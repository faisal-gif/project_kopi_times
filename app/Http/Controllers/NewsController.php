<?php

namespace App\Http\Controllers;

use App\Http\Requests\NewsFormRequest;
use App\Models\ImagesThumbnail;
use App\Models\KategoriKt;
use App\Models\News;
use App\Models\NewsAddonRequest;
use App\Models\User;
use App\Services\CdnService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class NewsController extends Controller
{
    public function __construct(
        protected CdnService $cdnService,
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $auth = Auth::user();
        $query = News::query()
            ->with('addonRequests') // Load data request agar tombol di UI bisa menyesuaikan
            ->select(
                'id',
                'title',
                'status',
                'created'
            );

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $search = $request->search;
                if (is_numeric($search)) {
                    $q->where('id', $search);
                } else {
                    $q->where('title', 'like', "%{$search}%");
                }
            });
        }

        // Filter status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $query->where('pewarta_id', $auth->id);

        // Optimized sorting
        $query->orderBy('created', 'DESC');

        // Faster pagination
        $news = $query->simplePaginate(10)->withQueryString();

        return Inertia::render('News/Index', [
            'news'    => $news,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();

        if ($user->quota_news == 0) {
            return redirect()->route('news.index');
        }

        if ($user->dateexp < now()) {
            return redirect()->route('news.index')->with('error', 'Masa aktif akun Anda telah berakhir. Silakan perbarui langganan Anda.');
        }

        $narsum_detail = [];
        if ($user->type == 4) {
            $narsum_detail = [
                'city' => $user->city,
                'narsum' => $user->nama,
                'profesi' => KategoriKt::where('kategori_id', $user->kategori)->first()->name,
                'contact' => $user->contact,
            ];
        }

        // Cek apakah user sudah pernah upload foto (sudah punya thumbnail jadi)
        $thumbnail = ImagesThumbnail::where('user_id', $user->id)->latest()->first();

        return Inertia::render('News/Create', [
            'narsum_detail' => $narsum_detail,
            'thumbnail' => $thumbnail?->image_path, // null jika belum pernah upload
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(NewsFormRequest $request)
    {
        $auth = Auth::user();

        $cleanTitle = preg_replace('/[^\x00-\x{FFFF}]/u', '', $request->title);
        $cleanContent = preg_replace('/[^\x00-\x{FFFF}]/u', '', $request->content);
        $cleanCaption = preg_replace('/[^\x00-\x{FFFF}]/u', '', $request->caption);

        do {
            $is_code = 'KT' . strtoupper(Str::random(8));
        } while (News::where('is_code', $is_code)->exists());

        // ==== LOGIKA UPLOAD SEKALI ====
        $existingThumbnail = ImagesThumbnail::where('user_id', $auth->id)->latest()->first();
        $thumbnailUrl = null;
        $newThumbnail = false;

        if ($existingThumbnail) {
            // Sudah pernah upload: pakai foto jadi, abaikan file baru
            $thumbnailUrl = $existingThumbnail->image_path;
        } elseif ($request->hasFile('image')) {
            // Upload pertama kali: kirim ke CDN
            try {
                $file = $request->file('image');
                $nameThumbnail = 'kopi-times-' . Str::slug(Str::limit($auth->nama, 100, '')) . '-thumbnail-1';

                $thumbnailUrl = $this->cdnService->uploadImage($file, $nameThumbnail, 3, 'raw', 0) ?? null;
                $newThumbnail = (bool) $thumbnailUrl;
            } catch (\Exception $e) {
                return back()->withInput()->withErrors(['error' => 'Gagal mengunggah gambar ke CDN: ' . $e->getMessage()]);
            }
        } else {
            // Belum punya thumbnail dan tidak upload
            return back()->withInput()->withErrors(['image' => 'Foto wajib diunggah untuk opini pertama Anda.']);
        }

        DB::beginTransaction();
        try {
            // Simpan foto jadi ke images_thumbnail agar dipakai selamanya
            if ($newThumbnail) {
                ImagesThumbnail::create([
                    'user_id' => $auth->id,
                    'template_id' => 1,
                    'image_path' => $thumbnailUrl,
                ]);
            }

            News::create([
                'is_code' => $is_code,
                'title' => $cleanTitle,
                'content' => $cleanContent,
                'city' => $request->city,
                'narsum' => $request->narsum,
                'profesi' => $request->profesi,
                'contact' => $request->contact,
                'datetime' => now(),
                'image' => $thumbnailUrl,
                'image2' => url(Storage::url($auth->avatar_raw)),
                'caption' => $cleanCaption,
                'pewarta_id' => $auth->id,
                'type' => $auth->type,
                'status' => 0,
            ]);

            User::where('id', $auth->id)->decrement('quota_news');

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->withErrors(['error' => 'Gagal menyimpan berita: ' . $e->getMessage()]);
        }

        return redirect()->route('news.index')->with('success', 'Berita berhasil ditambahkan.');
    }

    
    // private function storeImage($image, $title)
    // {
    //     $slug = Str::slug($title);
    //     $extension = $image->getClientOriginalExtension() ?: 'webp';
    //     $filename = $slug . '-' . time() . '.' . $extension;

    //     return $image->storeAs('images/berita', $filename, 'public');
    // }

    /**
     * Display the specified resource.
     */
    public function show(News $news)
    {
        return Inertia::render('News/Show', [
            'news' => $news,
        ]);
    }

    public function requestAddon(Request $request, News $news)
    {
        $request->validate([
            'jenis_request' => 'required|in:feed_instagram,ekoran,wa_channel'
        ]);

        $user = Auth::user();
        $jenis = $request->jenis_request;

        // 1. Cek apakah sudah pernah request dan statusnya belum ditolak
        $existingRequest = NewsAddonRequest::where('news_id', $news->id)
            ->where('jenis_request', $jenis)
            ->whereIn('status', ['pending', 'processing', 'completed'])
            ->first();

        if ($existingRequest) {
            return back()->with('error', 'Berita ini sudah diajukan untuk ' . str_replace('_', ' ', $jenis));
        }

        // 2. Cek apakah kuota masih ada
        if ($user->$jenis <= 0) {
            return back()->with('error', 'Kuota ' . str_replace('_', ' ', $jenis) . ' Anda sudah habis!');
        }

        // 3. Mulai Transaksi Database
        DB::beginTransaction();
        try {
            // Potong kuota user
            $user->decrement($jenis, 1);

            // Masukkan ke tabel antrean
            NewsAddonRequest::create([
                'news_id' => $news->id,
                'wartawan_id' => $user->id,
                'jenis_request' => $jenis,
                'status' => 'pending'
            ]);

            DB::commit();
            return back()->with('success', 'Permintaan ' . str_replace('_', ' ', $jenis) . ' berhasil dikirim ke redaksi.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Terjadi kesalahan sistem saat memproses request.');
        }
    }


    public function apiShow($id)
    {
        $news = News::with(['writer:id,nama,avatar,kategori,package_id', 'writer.kategoriKt', 'writer.paket'])->where('is_code', $id)->first();

        if (!$news) {
            return response()->json([
                'error' => true,
                'data' => null,
            ], 404);
        }

        return response()->json([
            'error' => false,
            'data' => [
                'is_code' => $news->is_code,
                'writer_name'   => $news->writer->nama,
                'writer_profesi' => $news->writer?->kategoriKt?->name,
                'writer_avatar'  => $news->writer?->avatar ? url(Storage::url($news->writer->avatar)) : null,
                'writer_badge'   => $news->writer?->paket?->badge,
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(News $news)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, News $news)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(News $news)
    {
        //
    }
}

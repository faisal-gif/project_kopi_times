<?php

namespace App\Http\Controllers;

use App\Http\Requests\NewsFormRequest;
use App\Models\KategoriKt;
use App\Models\News;
use App\Models\User;
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
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $auth = Auth::user();
        $query = News::query()
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

        $narsum_detail = [];
        if ($user->type == 4) {
            $narsum_detail = [
                'city' => $user->city,
                'narsum' => $user->nama,
                'profesi' => KategoriKt::where('kategori_id', $user->kategori)->first()->name,
                'contact' => $user->contact,
            ];
        }

        return Inertia::render('News/Create', [
            'narsum_detail' => $narsum_detail,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(NewsFormRequest $request)
    {

        $auth = Auth::user();
        $title = $request->title;
        $image_1 = null;
        $image_2 = null;
        $image_3 = null;

        if ($request->hasFile('image')) {
            $image_1 = $this->storeImage($request->file('image'), $title . '-1');
        }

        if ($request->hasFile('image_2')) {
            $image_2 = $this->storeImage($request->file('image_2'), $title . '-2');
        }

        if ($request->hasFile('image_3')) {
            $image_3 = $this->storeImage($request->file('image_3'), $title . '-3');
        }



        DB::beginTransaction();

        News::create([
            'title' => $request->title,
            'content' => $request->content,
            'city' => $request->city,
            'narsum' => $request->narsum,
            'profesi' => $request->profesi,
            'contact' => $request->contact,
            'datetime' => now(),
            'image' => url(Storage::url($image_1)),
            'image2' => url(Storage::url($image_2)),
            'image3' => url(Storage::url($image_3)),
            'caption' => $request->caption,
            'pewarta_id' => $auth->id,
            'type' => $auth->type,
            'status' => 0
        ]);

        $user = User::find($auth->id);
        $user->quota_news = $user->quota_news - 1;
        $user->save();

        DB::commit();
        return redirect()->route('news.index')->with('success', 'Berita berhasil ditambahkan.');
    }

    private function storeImage($image, $title)
    {
        $slug = Str::slug($title);
        $manager = new ImageManager(new Driver());
        $image = $manager->read($image);
        $encode = $image->toWebp();
        $path = 'images/berita/' . $slug . '-' . time() . '.webp';
        Storage::disk('public')->put($path, $encode);
        return $path;
    }

    /**
     * Display the specified resource.
     */
    public function show(News $news)
    {
        return Inertia::render('News/Show', [
            'news' => $news,
        ]);
    }


    public function apiShow($id)
    {
        $news = News::with('writer:id,nama')->find($id);

        if (!$news) {
            return response()->json([
                'error' => true
            ], 404);
        }

        return response()->json([
            'error' => false,
            'data' => [
                'datetime' => $news->datetime,
                'title'    => $news->title,
                'caption'  => $news->caption,
                'content'  => $news->content,
                'city'     => $news->city,
                'writer'   => optional($news->writer)->nama,
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

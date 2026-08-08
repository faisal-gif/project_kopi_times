<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\KategoriKt;
use App\Models\News;
use App\Services\CdnService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

// Kirim berita publik (tanpa login). Hanya untuk event ber-category public_event.
class PublicNewsController extends Controller
{
    public function __construct(
        protected CdnService $cdnService,
    ) {}

    public function create(Event $event)
    {
        abort_unless($event->category === 'public_event', 404);

        $og = [
            'title'       => $event->name . ' — Kirim Berita | Kopi TIMES',
            'description' => $event->description ?: 'Kirim berita Anda untuk event ini di Kopi TIMES.',
            'image'       => url('/bg_kopi_times.png'),
            'url'         => route('public-news.create', $event->slug),
        ];

        if (!$event->isOpen()) {
            return Inertia::render('PublicNews/Closed', [
                'reason' => $event->quotaLeft() <= 0 ? 'quota_full' : 'not_active',
                'og'     => $og,
                'flash'  => ['success' => session('success')],
            ]);
        }

        return Inertia::render('PublicNews/Create', [
            'event' => [
                'slug'        => $event->slug,
                'name'        => $event->name,
                'description' => $event->description,
                'ends_at'     => $event->ends_at,
                'quota_left'  => $event->quotaLeft(),
            ],
            'professions' => KategoriKt::orderBy('name')->get(['id', 'name']),
            'og'          => $og,
            'flash'       => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function store(Request $request, Event $event)
    {
        abort_unless($event->category === 'public_event', 404);

        // Honeypot: field tersembunyi 'website'. Bot mengisi semua field → drop diam-diam.
        if ($request->filled('website')) {
            return redirect()->route('public-news.create', $event->slug);
        }

        if (!$event->isOpen()) {
            return redirect()->route('public-news.create', $event->slug)
                ->with('error', 'Event sudah tidak menerima kiriman.');
        }

        $data = $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'required|string',
            'narsum'  => 'required|string|max:255',
            'city'    => 'required|string|max:100',
            'contact' => 'required|string|max:100',
            'profesi' => 'required|exists:kategori_kt,id',
            'image'   => 'required|image|max:4096',
        ], [
            'title.required'   => 'Judul wajib diisi.',
            'content.required' => 'Isi berita wajib diisi.',
            'narsum.required'  => 'Nama wajib diisi.',
            'city.required'    => 'Kota wajib diisi.',
            'contact.required' => 'Kontak wajib diisi.',
            'profesi.required' => 'Profesi wajib dipilih.',
            'profesi.exists'   => 'Profesi tidak valid.',
            'image.required'   => 'Foto wajib diunggah.',
            'image.image'      => 'File harus berupa gambar.',
            'image.max'        => 'Ukuran gambar maksimal 4MB.',
        ]);

        $clean = fn ($s) => preg_replace('/[^\x00-\x{FFFF}]/u', '', $s);
        $profesiName = KategoriKt::whereKey($data['profesi'])->value('name');

        // Upload foto (sudah ber-frame dari client) ke CDN sebelum transaksi.
        try {
            $name = 'kopi-times-' . Str::slug(Str::limit($data['narsum'], 100, '')) . '-public-' . time();
            $imageUrl = $this->cdnService->uploadImage($request->file('image'), $name, 3, 'raw', false);
        } catch (\Exception $e) {
            return back()->withInput()->withErrors(['image' => 'Gagal mengunggah gambar: ' . $e->getMessage()]);
        }

        DB::transaction(function () use ($data, $clean, $event, $profesiName, $imageUrl) {
            // ponytail: recheck kuota di dalam transaksi. Tanpa row-lock masih ada celah
            // over-submit sedikit saat submit bersamaan — volume event kecil, cukup.
            if ($event->quotaLeft() <= 0) {
                return;
            }

            do {
                $code = 'PUB' . strtoupper(Str::random(8));
            } while (News::where('is_code', $code)->exists());

            News::create([
                'is_code'    => $code,
                'pewarta_id' => null,
                'event_id'   => $event->id,
                'category'   => 'public_event', // sumber kiriman (regular = berita biasa)
                'title'      => $clean($data['title']),
                'content'    => $clean($data['content']),
                'narsum'     => $clean($data['narsum']),
                'city'       => $data['city'],
                'contact'    => $data['contact'],
                'profesi'    => $profesiName,
                'image'      => $imageUrl,
                'datetime'   => now(),
                'type'       => 4,
                'status'     => 0,
            ]);
        });

        return redirect()->route('public-news.create', $event->slug)
            ->with('success', 'Berita berhasil dikirim. Terima kasih! Tim redaksi akan meninjau kiriman Anda.');
    }
}

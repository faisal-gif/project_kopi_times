<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\PublicNewsEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

// Kirim berita publik (tanpa login). Tiap event punya URL sendiri via slug.
class PublicNewsController extends Controller
{
    public function create(PublicNewsEvent $event)
    {
        if (!$event->isOpen()) {
            return Inertia::render('PublicNews/Closed', [
                'reason' => $event->quotaLeft() <= 0 ? 'quota_full' : 'not_active',
                'flash'  => ['success' => session('success')],
            ]);
        }

        return Inertia::render('PublicNews/Create', [
            'event' => [
                'slug'        => $event->slug,
                'name'        => $event->name,
                'category'    => $event->category,
                'description' => $event->description,
                'ends_at'     => $event->ends_at,
                'quota_left'  => $event->quotaLeft(),
            ],
            'flash' => ['success' => session('success'), 'error' => session('error')],
        ]);
    }

    public function store(Request $request, PublicNewsEvent $event)
    {
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
        ], [
            'title.required'   => 'Judul wajib diisi.',
            'content.required' => 'Isi berita wajib diisi.',
            'narsum.required'  => 'Nama wajib diisi.',
            'city.required'    => 'Kota wajib diisi.',
            'contact.required' => 'Kontak wajib diisi.',
        ]);

        $clean = fn ($s) => preg_replace('/[^\x00-\x{FFFF}]/u', '', $s);

        DB::transaction(function () use ($data, $clean, $event) {
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
                'category'   => 'public_event', // sumber: dari public event (jenis event/lomba ada di public_news_events)
                'title'      => $clean($data['title']),
                'content'    => $clean($data['content']),
                'narsum'     => $clean($data['narsum']),
                'city'       => $data['city'],
                'contact'    => $data['contact'],
                'datetime'   => now(),
                'type'       => 4,
                'status'     => 0,
            ]);
        });

        return redirect()->route('public-news.create', $event->slug)
            ->with('success', 'Berita berhasil dikirim. Terima kasih! Tim redaksi akan meninjau kiriman Anda.');
    }
}

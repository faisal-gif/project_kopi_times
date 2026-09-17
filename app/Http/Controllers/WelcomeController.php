<?php

namespace App\Http\Controllers;

use App\Models\NewsPackage;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $query = NewsPackage::with('itemsLainnya')->where('type', '4')->where('status', 1);

        if ($user && $user->status == 1) {
            $newsPackages = $query->where('level', 2)->get();
        } else {
            $newsPackages = $query->where('level', 1)->get();
        }

        return Inertia::render('Welcome/Index', [
            'newsPackages' => $newsPackages,
            'og' => [
                'title' => 'Kolom Opini TIMES Indonesia — Kopi TIMES',
                'url'   => route('welcome'),
            ],
        ]);
    }

    public function harga()
    {
        $user = Auth::user();

        // Gunakan eager loading 'itemsLainnya' agar relasi dari tabel baru ikut dimuat
        $query = NewsPackage::with('itemsLainnya')->where('type', '4')->where('status', 1);

        if ($user && $user->status == 1) {
            $newsPackages = $query->where('level', 2)->get();
        } else {
            $newsPackages = $query->where('level', 1)->get();
        }

        return Inertia::render('Harga/Index', [
            'newsPackages' => $newsPackages,
            'og' => [
                'title'       => 'Paket Membership Penulis — Kopi TIMES',
                'description' => 'Pilih paket membership penulis Kopi TIMES: akses CMS, kuota menulis, member card, dan distribusi tulisan Anda di kanal TIMES Indonesia.',
                'url'         => route('harga'),
            ],
        ]);
    }
}

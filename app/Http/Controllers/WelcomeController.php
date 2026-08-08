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
                'title'       => 'Kopi TIMES',
                'description' => 'Membership Penulis Kopi TIMES — program keanggotaan bagi penulis yang ingin terlibat aktif dalam ekosistem gagasan di TIMES Indonesia.',
                'image'       => url('/bg_kopi_times.png'),
                'url'         => route('welcome'),
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
                'title'       => 'Harga & Paket — Kopi TIMES',
                'description' => 'Pilihan paket membership penulis Kopi TIMES untuk terlibat aktif dalam ekosistem gagasan di TIMES Indonesia.',
                'image'       => url('/bg_kopi_times.png'),
                'url'         => route('harga'),
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\NewsPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index()
    {
        // 1. Ambil semua data sekaligus menggunakan whereIn (Hanya 1x query ke database)
        $allNews = NewsPackage::where('type', '4')
            ->where('level', 2)
            ->where('status', 1)
            ->whereIn('kategori_produk', ['paket', 'satuan'])
            ->get();

        // 2. Pisahkan data menggunakan fungsi bawaan Laravel Collection
        $newsPackages = $allNews->where('kategori_produk', 'paket')->values();
        $newsSatuan   = $allNews->where('kategori_produk', 'satuan')->values();
        
        $user = Auth::user();

        $userPackage = NewsPackage::find($user->package_id);



        return Inertia::render('Subscription/Index', [
            'newsPackages' => $newsPackages,
            'newsSatuan' => $newsSatuan,
            'userPackage' => $userPackage,
        ]);
    }
}

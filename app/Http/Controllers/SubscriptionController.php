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
        $newsPackages = NewsPackage::where('type', '4')->where('level', 2)->where('kategori_produk', 'paket')->get();
        $newsSatuan = NewsPackage::where('type', '4')->where('level', 2)->where('kategori_produk', 'satuan')->get();

        $user = Auth::user();

        $userPackage = NewsPackage::find($user->package_id);



        return Inertia::render('Subscription/Index', [
            'newsPackages' => $newsPackages,
            'newsSatuan' => $newsSatuan,
            'userPackage' => $userPackage,
        ]);
    }
}

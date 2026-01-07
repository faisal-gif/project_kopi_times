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
        $user =  Auth::user();
        $newsPackages = NewsPackage::where('type', '4')->where('level', 1)->get();

        if ($user && $user->status == 1) {
            $newsPackages = NewsPackage::where('type', '4')->where('level', 2)->get();
        }

        return Inertia::render('Welcome/Index', [
            'newsPackages' => $newsPackages,
        ]);
    }
    public function harga()
    {
        $user =  Auth::user();
        $newsPackages = NewsPackage::where('type', '4')->where('level', 1)->get();


        if ($user && $user->status == 1) {
            $newsPackages = NewsPackage::where('type', '4')->where('level', 2)->get();
        }

        return Inertia::render('Harga/Index', [
            'newsPackages' => $newsPackages,
        ]);
    }
}

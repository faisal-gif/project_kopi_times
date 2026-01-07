<?php

namespace App\Http\Controllers;

use App\Models\NewsPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        $newsPackages = NewsPackage::where('type', '4')->where('level',1)->get();
     
        return Inertia::render('Welcome/Index', [
            'newsPackages' => $newsPackages,
        ]);
    }
     public function harga()
    {
        $newsPackages = NewsPackage::where('type', '4')->where('level',1)->get();

        return Inertia::render('Harga/Index', [
            'newsPackages' => $newsPackages,
        ]);
    }
}

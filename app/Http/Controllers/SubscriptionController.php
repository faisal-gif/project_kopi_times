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
        $newsPackages = NewsPackage::where('type', '4')->where('level', 2)->get();
        $user = Auth::user();

        $userPackage = NewsPackage::find($user->package_id);


        return Inertia::render('Subscription/Index', [
            'newsPackages' => $newsPackages,
            'userPackage' => $userPackage,
        ]);
    }
}

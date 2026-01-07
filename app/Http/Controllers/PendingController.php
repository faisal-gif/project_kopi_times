<?php

namespace App\Http\Controllers;

use App\Models\NewsPackage;
use App\Services\TripayService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PendingController extends Controller
{
    public function index(TripayService $tripayService, Request $request)
    {

        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $auth = auth()->user();

        $newsPackage = NewsPackage::find($auth->package_id);

        if ($request->package_id) {
            $newsPackage = NewsPackage::find($request->package_id);
        }

        $paymentChannels = $tripayService->getPaymentChannel();

        return Inertia::render('Pending/Index', [
            'channel' => $paymentChannels,
            'newsPackage' => $newsPackage,
        ]);
    }
}

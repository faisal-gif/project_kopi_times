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

        $packageId = $request->package_id ?: $auth->package_id;
        $newsPackage = NewsPackage::where('type', '4')
            ->where('status', 1)
            ->find($packageId);

        if (!$newsPackage) {
            return redirect()->route('subscription.index');
        }

        $paymentChannels = $tripayService->getPaymentChannel();

        return Inertia::render('Pending/Index', [
            'channel' => $paymentChannels,
            'newsPackage' => $newsPackage,
        ]);
    }
}

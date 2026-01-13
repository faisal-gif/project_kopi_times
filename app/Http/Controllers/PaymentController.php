<?php

namespace App\Http\Controllers;

use App\Models\NewsPackage;
use App\Models\Payments;
use App\Services\TripayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function store(Request $request, TripayService $tripayService)
    {
        $user = Auth::user();
        $newsPackage = NewsPackage::find($request->package_id);

        $merchant_ref = 'SUB-' . time();

        $payment = Payments::where('user_id', $user->id)
            ->where('package_id', $newsPackage->id)
            ->where('status', 'pending')
            ->where('method', $request->paymentMethod)
            ->where('expired_at', '>', now())
            ->latest()
            ->first();

        if ($payment->status == 'pending') {
            return redirect($payment->checkout_url);
        }

        DB::beginTransaction();
        $payment = Payments::create([
            'user_id' =>  $user->id,
            'method' => $request->paymentMethod,
            'package_id' => $newsPackage->id,
            'merchant_ref' => $merchant_ref,
            'amount' => $newsPackage->price,
            'status' => 'pending',
        ]);

        $response = $tripayService->createTransaction($newsPackage, $user, $merchant_ref, $request->paymentMethod);

        $payment->update([
            'expired_at' => now()->addHours(24),
            'reference' => $response['data']['reference'],
            'checkout_url' => $response['data']['checkout_url'],
        ]);
        DB::commit();

        return redirect($payment->checkout_url);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Payments;
use App\Services\PaymentFulfillmentService;
use Illuminate\Http\Request;

class TripayCallbackController extends Controller
{
    public function handle(Request $request, PaymentFulfillmentService $fulfillment)
    {
        $signature = hash_hmac(
            'sha256',
            $request->getContent(),
            config('services.tripay.private_key')
        );

        abort_unless(
            hash_equals($signature, (string) $request->header('X-Callback-Signature')),
            403
        );

        $data = $request->all();

        $payment = Payments::where('reference', $request->reference)->firstOrFail();

        // Fast path: callback duplikat untuk payment yang sudah paid.
        // Cek ulang di bawah lock di dalam service untuk callback yang datang bersamaan.
        if ($payment->status === 'paid') {
            return response()->json(['success' => true]);
        }

        $statusDariTripay = $fulfillment->statusLokal($data['status']);

        // Pengaktifan ada di PaymentFulfillmentService karena tombol "Cek status" di
        // halaman pembayaran memicu hal yang sama saat callback terlambat atau gagal.
        if ($statusDariTripay === 'paid') {
            $fulfillment->tandaiLunas($payment, $data);
        } elseif (in_array($statusDariTripay, ['pending', 'failed', 'expired', 'refunded'])) {
            $fulfillment->tandaiBelumLunas($payment, $statusDariTripay);
        }

        return response()->json(['success' => true]);
    }
}

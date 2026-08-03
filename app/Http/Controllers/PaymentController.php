<?php

namespace App\Http\Controllers;

use App\Models\NewsPackage;
use App\Models\Payments;
use App\Services\TripayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = Payments::ownedBy(Auth::id())
            ->with('newsPackage:id,name')
            ->latest()
            ->get()
            ->map(fn($p) => [
                'id'           => $p->id,
                'merchant_ref' => $p->merchant_ref,
                'method'       => $p->method,
                'amount'       => $p->amount,
                'total_amount' => $p->total_amount,
                'status'       => $p->status,
                'status_label' => $p->status_label,
                'paid_at'      => $p->paid_at,
                'created_at'   => $p->created_at,
                'package_name' => $p->newsPackage?->name,
            ]);

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'summary'  => [
                'total'   => $payments->count(),
                'paid'    => $payments->where('status', 'paid')->count(),
                'pending' => $payments->where('status', 'pending')->count(),
            ],
        ]);
    }

    public function show(Payments $payment)
    {
        abort_if($payment->user_id !== Auth::id(), 403);

        $payment->load('newsPackage:id,name,period,jenis_periode', 'user:id,nama,email');

        return Inertia::render('Payments/Invoice', [
            'payment' => array_merge($payment->toArray(), [
                'status_label' => $payment->status_label,
            ]),
        ]);
    }

    public function store(Request $request, TripayService $tripayService)
    {
        $request->validate([
            'package_id' => 'required',
            'paymentMethod' => 'required',
        ]);

        $user = Auth::user();
        $newsPackage = NewsPackage::where('type', '4')
            ->where('status', 1)
            ->findOrFail($request->package_id);

        $merchant_ref = 'SUB-' . time();

        $payment = Payments::where('user_id', $user->id)
            ->where('package_id', $newsPackage->id)
            ->where('status', 'pending')
            ->where('method', $request->paymentMethod)
            ->where('expired_at', '>', now())
            ->latest()
            ->first();

        if ($payment) {
            return redirect($payment->checkout_url);
        }

        DB::beginTransaction();
        $payment = Payments::create([
            'user_id' =>  $user->id,
            'method' => $request->paymentMethod,
            'type' => $newsPackage->type,
            'package_id' => $newsPackage->id,
            'merchant_ref' => $merchant_ref,
            'amount' => $newsPackage->price,
            'status' => 'pending',
        ]);

        $response = $tripayService->createTransaction($newsPackage, $user, $merchant_ref, $request->paymentMethod);

        if (empty($response['success'])) {
            DB::rollBack();
            return back()->with('error', $response['message'] ?? 'Gagal membuat transaksi pembayaran. Coba lagi.');
        }

        $payment->update([
            'expired_at' => now()->addHours(24),
            'reference' => $response['data']['reference'],
            'checkout_url' => $response['data']['checkout_url'],
        ]);
        DB::commit();

        return redirect($payment->checkout_url);
    }
}

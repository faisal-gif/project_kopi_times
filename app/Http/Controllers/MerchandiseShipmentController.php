<?php

namespace App\Http\Controllers;

use App\Models\MerchandiseShipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MerchandiseShipmentController extends Controller
{
    public function index()
    {
        $shipments = MerchandiseShipment::ownedBy(Auth::id())
            ->with('payment:id,merchant_ref,reference,method,amount,total_amount,status,paid_at')
            ->latest()
            ->get()
            ->map(fn($s) => [
                'id'               => $s->id,
                'item_name'        => $s->item_name,
                'shipping_address' => $s->shipping_address,
                'status'           => $s->status,
                'status_label'     => $s->status_label,
                'courier'          => $s->courier,
                'tracking_number'  => $s->tracking_number,
                'tracking_url'     => $s->tracking_url,
                'note'             => $s->note,
                'shipped_at'       => $s->shipped_at,
                'delivered_at'     => $s->delivered_at,
                'created_at'       => $s->created_at,
                'payment'          => $s->payment ? [
                    'merchant_ref' => $s->payment->merchant_ref,
                    'method'       => $s->payment->method,
                    'total_amount' => $s->payment->total_amount,
                    'status'       => $s->payment->status,
                    'paid_at'      => $s->payment->paid_at,
                ] : null,
            ]);

        return Inertia::render('Merchandise/Index', [
            'shipments' => $shipments,
            'summary'   => [
                'total'     => $shipments->count(),
                'on_going'  => $shipments->whereIn('status', ['pending', 'processing', 'shipped'])->count(),
                'delivered' => $shipments->where('status', 'delivered')->count(),
            ],
        ]);
    }


    public function show(MerchandiseShipment $merchandise)
    {
        abort_if($merchandise->user_id !== Auth::id(), 403);

        $merchandise->load('payment:id,merchant_ref,reference,method,amount,total_amount,status,paid_at');

        return Inertia::render('Merchandise/Show', [
            'shipment' => array_merge($merchandise->toArray(), [
                'status_label' => $merchandise->status_label,
                'tracking_url' => $merchandise->tracking_url,
            ]),
        ]);
    }

    // Member konfirmasi paket sudah diterima
    public function confirmReceived(MerchandiseShipment $merchandise)
    {
        abort_if($merchandise->user_id !== Auth::id(), 403);
        abort_if($merchandise->status !== 'shipped', 422, 'Paket belum dikirim.');

        $merchandise->update([
            'status'       => 'delivered',
            'delivered_at' => now(),
        ]);

        return back()->with('success', 'Terima kasih, paket ditandai sudah diterima.');
    }
}

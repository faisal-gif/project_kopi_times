<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class TripayService
{
    protected $apiKey;
    protected $merchantCode;
    protected $privateKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.tripay.api_key');
        $this->merchantCode = config('services.tripay.merchant_code');
        $this->privateKey = config('services.tripay.private_key');
        $this->baseUrl = 'https://tripay.co.id/api'; // ganti ke production kalau live
    }

    public function getPaymentChannel()
    {
        /** @var \Illuminate\Http\Client\Response $response */
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
        ])->get($this->baseUrl . '/merchant/payment-channel');

        return json_decode($response)->data;
    }


    public function createTransaction($newsPackage, $user, $merchant_ref, $paymentMethod)
    {

        $amount = (int) number_format($newsPackage->price, 0, '', '');
        $payload = [
            'method'         => $paymentMethod, // atau gunakan inputan dari user
            'merchant_ref'   => $merchant_ref,
            'amount'         => $amount,
            'customer_name'  => $user->nama,
            'customer_email' => $user->email,
            'order_items'    => [[
                'name'        => $newsPackage->name,
                'price'       => $amount,
                'quantity'    => 1,
            ]],
            'callback_url'   => route('api.tripay.callback'),
            'return_url'     => route('dashboard'),
            'expired_time'   => now()->addHours(24)->timestamp,
            'signature'      => hash_hmac('sha256', $this->merchantCode . $merchant_ref . $amount, $this->privateKey)
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
        ])->post($this->baseUrl . '/transaction/create', $payload);

        /** @var \Illuminate\Http\Client\Response $response */
        return $response->json();
    }
}

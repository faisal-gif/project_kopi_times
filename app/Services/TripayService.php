<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
        // Dari config, bukan hardcoded: tanpa ini sandbox tidak bisa dijangkau tanpa
        // mengedit kelas ini, dan halaman pembayaran mustahil diuji tanpa menagih
        // kartu sungguhan. Default tetap produksi supaya perilaku lama tidak berubah.
        $this->baseUrl = rtrim((string) config('services.tripay.base_url'), '/');
    }

    /**
     * Daftar channel aktif di akun merchant.
     *
     * Di-cache dan diberi timeout: ini dipanggil pada SETIAP render /checkout, dan
     * sebelumnya satu gangguan di Tripay membuat halaman itu mati total karena
     * `json_decode($response)->data` melempar saat jawabannya bukan JSON.
     * Gagal sekarang berarti daftar kosong — halaman tetap terbuka.
     *
     * @return array<int, object>
     */
    public function getPaymentChannel(): array
    {
        return Cache::remember('tripay_payment_channels', now()->addMinutes(10), function () {
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                ])->timeout(10)->get($this->baseUrl . '/merchant/payment-channel');

                $data = $response->json('data');

                return is_array($data) ? json_decode(json_encode($data)) : [];
            } catch (\Throwable $e) {
                Log::warning('Tripay: daftar channel gagal diambil.', ['pesan' => $e->getMessage()]);

                return [];
            }
        });
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
        ])->timeout(30)->post($this->baseUrl . '/transaction/create', $payload);

        /** @var \Illuminate\Http\Client\Response $response */
        return $response->json();
    }

    /**
     * Keadaan transaksi menurut Tripay — satu-satunya cara aplikasi ini bisa
     * bertanya, dan dasar tombol "Cek status" di halaman pembayaran.
     *
     * Mengembalikan null bila Tripay tidak bisa dihubungi atau menolak; pemanggil
     * memperlakukan null sebagai "belum tahu", bukan "belum dibayar".
     */
    public function detailTransaction(string $reference): ?array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->timeout(15)->get($this->baseUrl . '/transaction/detail', [
                'reference' => $reference,
            ]);

            $json = $response->json();

            return empty($json['success']) ? null : ($json['data'] ?? null);
        } catch (\Throwable $e) {
            Log::warning('Tripay: cek status gagal.', ['reference' => $reference, 'pesan' => $e->getMessage()]);

            return null;
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\NewsPackage;
use App\Models\Payments;
use App\Services\PaymentFulfillmentService;
use App\Services\TripayService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
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

        $payment = Payments::where('user_id', $user->id)
            ->where('package_id', $newsPackage->id)
            ->where('status', 'pending')
            ->where('method', $request->paymentMethod)
            ->where('expired_at', '>', now())
            ->latest()
            ->first();

        // Pembayaran yang masih hidup dilanjutkan di halaman sendiri, bukan di Tripay.
        if ($payment) {
            return redirect()->route('pembayaran.instruksi', $payment->merchant_ref);
        }

        $payment = $this->buatTransaksi($newsPackage, $user, $request->paymentMethod, $tripayService);

        if (! $payment instanceof Payments) {
            return back()->with('error', $payment);
        }

        return redirect()->route('pembayaran.instruksi', $payment->merchant_ref);
    }

    /** Halaman instruksi pembayaran — pengganti halaman checkout milik Tripay. */
    public function instruksi(string $merchantRef)
    {
        $payment = $this->milikSaya($merchantRef);
        $this->tandaiKedaluwarsaBilaLewat($payment);

        return Inertia::render('Pembayaran/Instruksi', [
            'payment' => $this->propsPembayaran($payment),
        ]);
    }

    /**
     * Tanya Tripay keadaan transaksinya.
     *
     * Ini bukan sekadar pembacaan: kalau Tripay bilang sudah dibayar sementara
     * callbacknya terlambat atau gagal, membernya diaktifkan di sini juga — lewat
     * PaymentFulfillmentService yang sama dengan callback, jadi lock dan
     * idempotensinya identik dan pemicu kedua tidak menggandakan apa pun.
     */
    public function cekStatus(string $merchantRef, TripayService $tripay, PaymentFulfillmentService $fulfillment)
    {
        $payment = $this->milikSaya($merchantRef);

        if ($payment->status === 'paid') {
            return back();
        }

        $data = $payment->reference ? $tripay->detailTransaction($payment->reference) : null;

        // Null = Tripay tidak bisa dihubungi. Itu "belum tahu", bukan "belum dibayar";
        // jangan mengubah status apa pun berdasarkan kegagalan jaringan.
        if ($data === null) {
            $this->tandaiKedaluwarsaBilaLewat($payment);

            return back()->with('error', 'Status belum bisa diambil dari Tripay. Coba sebentar lagi.');
        }

        $status = $fulfillment->statusLokal((string) ($data['status'] ?? ''));

        if ($status === 'paid') {
            $fulfillment->tandaiLunas($payment, $data);

            return back()->with('success', 'Pembayaran diterima. Akun Anda sudah aktif.');
        }

        if (in_array($status, ['failed', 'expired', 'refunded'], true)) {
            $fulfillment->tandaiBelumLunas($payment, $status);

            return back();
        }

        $this->tandaiKedaluwarsaBilaLewat($payment);

        return back()->with('info', 'Pembayaran belum masuk. Selesaikan pembayaran lalu cek lagi.');
    }

    /** Buat transaksi baru dengan channel yang sama setelah yang lama kedaluwarsa. */
    public function buatUlang(string $merchantRef, TripayService $tripayService)
    {
        $payment = $this->milikSaya($merchantRef);
        $this->tandaiKedaluwarsaBilaLewat($payment);

        if ($payment->fresh()->status === 'paid') {
            return redirect()->route('pembayaran.instruksi', $payment->merchant_ref);
        }

        // Yang masih hidup tidak boleh diulang: itu akan meninggalkan dua tagihan
        // terbuka untuk satu paket, dan Tripay tidak membatalkan yang lama.
        if ($payment->fresh()->status === 'pending') {
            return redirect()->route('pembayaran.instruksi', $payment->merchant_ref)
                ->with('error', 'Pembayaran ini masih berlaku, tidak perlu dibuat ulang.');
        }

        $newsPackage = NewsPackage::where('type', '4')->where('status', 1)->find($payment->package_id);

        if (! $newsPackage) {
            return redirect()->route('subscription.index')
                ->with('error', 'Paket ini sudah tidak tersedia. Silakan pilih paket lain.');
        }

        $baru = $this->buatTransaksi($newsPackage, Auth::user(), $payment->method, $tripayService);

        if (! $baru instanceof Payments) {
            return back()->with('error', $baru);
        }

        return redirect()->route('pembayaran.instruksi', $baru->merchant_ref);
    }

    /**
     * Panggil Tripay lalu catat barisnya. Mengembalikan Payments bila berhasil,
     * atau string pesan kesalahan bila gagal.
     *
     * Tripay dipanggil DI LUAR transaksi DB: timeout atau koneksi putus ditangani,
     * bukan meninggalkan transaksi terbuka yang menahan lock selama timeout HTTP.
     *
     * @return Payments|string
     */
    private function buatTransaksi(NewsPackage $newsPackage, $user, string $method, TripayService $tripayService)
    {
        // ULID: unik walau dua user checkout di detik yang sama (kolom merchant_ref unique).
        $merchantRef = 'SUB-' . Str::upper((string) Str::ulid());

        try {
            $response = $tripayService->createTransaction($newsPackage, $user, $merchantRef, $method);
        } catch (\Throwable $e) {
            report($e);
            $response = null;
        }

        if (empty($response['success'])) {
            return $response['message'] ?? 'Gagal membuat transaksi pembayaran. Coba lagi.';
        }

        $data = $response['data'];

        // Catat payment hanya setelah Tripay menerima transaksi.
        return Payments::create([
            'user_id' => $user->id,
            'method' => $method,
            'type' => $newsPackage->type,
            'package_id' => $newsPackage->id,
            'merchant_ref' => $merchantRef,
            'amount' => $newsPackage->price,
            'status' => 'pending',
            'reference' => $data['reference'],
            'checkout_url' => $data['checkout_url'] ?? null,

            // Alat bayarnya — inilah yang membuat halaman sendiri mungkin.
            'pay_code' => $data['pay_code'] ?? null,
            'pay_url' => $data['pay_url'] ?? null,
            'qr_url' => $data['qr_url'] ?? null,
            'payment_name' => $data['payment_name'] ?? null,
            'instructions' => $data['instructions'] ?? null,

            // Nominal yang benar-benar harus dibayar, diketahui sejak sekarang.
            // Sebelumnya hanya ada sebagai hitungan JavaScript yang tidak disimpan.
            'total_amount' => $data['total_amount'] ?? $newsPackage->price,
            'fee_customer' => $data['fee_customer'] ?? null,
            'total_fee' => $data['total_fee'] ?? null,

            /*
             * Kedaluwarsa menurut Tripay, bukan tebakan 24 jam lokal.
             *
             * Zona waktunya WAJIB disebut. Tanpa itu createFromTimestamp() memakai UTC
             * sementara aplikasi ini Asia/Jakarta (+7), sehingga kedaluwarsa tersimpan
             * tujuh jam lebih awal dan pembayaran yang baru dibuat langsung dianggap
             * kedaluwarsa. Ketahuan dari test, bukan dari produksi.
             */
            'expired_at' => isset($data['expired_time'])
                ? Carbon::createFromTimestamp($data['expired_time'], config('app.timezone'))
                : now()->addHours(24),
        ]);
    }

    /** Pembayaran milik user yang sedang login; milik orang lain tidak boleh terbuka. */
    private function milikSaya(string $merchantRef): Payments
    {
        return Payments::ownedBy(Auth::id())
            ->where('merchant_ref', $merchantRef)
            ->firstOrFail();
    }

    /**
     * Tandai kedaluwarsa saat dilihat, bukan lewat scheduler.
     *
     * Projek ini tidak punya scheduler sama sekali, dan tanpa ini baris `pending`
     * yang sudah lewat tetap `pending` selamanya kecuali Tripay mengirim callback
     * EXPIRED. Menandainya saat halaman dibuka atau status dicek sudah cukup:
     * hanya di dua tempat itu statusnya dibaca manusia.
     */
    private function tandaiKedaluwarsaBilaLewat(Payments $payment): void
    {
        if ($payment->status !== 'pending' || ! $payment->expired_at || $payment->expired_at->isFuture()) {
            return;
        }

        Payments::whereKey($payment->id)
            ->where('status', 'pending')
            ->update(['status' => 'expired']);

        $payment->refresh();
    }

    private function propsPembayaran(Payments $payment): array
    {
        $payment->loadMissing('newsPackage:id,name,period,jenis_periode');

        return [
            'merchant_ref' => $payment->merchant_ref,
            'status' => $payment->status,
            'status_label' => $payment->status_label,
            'method' => $payment->method,
            'payment_name' => $payment->payment_name ?: $payment->method,
            'amount' => (int) $payment->amount,
            'fee_customer' => (int) $payment->fee_customer,
            'total_amount' => (int) ($payment->total_amount ?: $payment->amount),
            'pay_code' => $payment->pay_code,
            'pay_url' => $payment->pay_url,
            'qr_url' => $payment->qr_url,
            'instructions' => $payment->instructions ?? [],
            'expired_at' => $payment->expired_at,
            'paid_at' => $payment->paid_at,
            // Jalan keluar darurat untuk baris lama yang tidak punya alat bayar,
            // atau channel yang bentuknya tak terduga.
            'checkout_url' => $payment->checkout_url,
            'package_name' => $payment->newsPackage?->name,
        ];
    }
}

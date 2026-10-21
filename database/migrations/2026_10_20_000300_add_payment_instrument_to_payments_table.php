<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Alat bayar dari respons Tripay, supaya halaman pembayaran bisa dirender sendiri.
 *
 * Kedua aplikasi sudah memakai Tripay closed payment dengan channel ditentukan di
 * aplikasi, jadi respons `/transaction/create` SUDAH memuat nomor VA, QRIS, deeplink,
 * dan langkah-langkahnya. Sebelum migration ini semuanya dibuang dan hanya
 * `reference` + `checkout_url` yang disimpan — itulah sebabnya user harus dilempar
 * ke halaman Tripay.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Nomor Virtual Account atau kode bayar retail (Alfamart/Indomaret).
            $table->string('pay_code')->nullable()->after('checkout_url');
            // Deeplink aplikasi e-wallet (OVO, DANA, ShopeePay).
            $table->string('pay_url')->nullable()->after('pay_code');
            // URL gambar QRIS; dirender langsung sebagai <img>, tidak perlu library QR.
            $table->string('qr_url')->nullable()->after('pay_url');
            // Nama channel yang bisa dibaca manusia, mis. "BRI Virtual Account".
            // Disimpan supaya halaman tidak perlu memanggil daftar channel Tripay lagi.
            $table->string('payment_name')->nullable()->after('qr_url');
            // Langkah-langkah pembayaran dari Tripay, apa adanya.
            $table->json('instructions')->nullable()->after('payment_name');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['pay_code', 'pay_url', 'qr_url', 'payment_name', 'instructions']);
        });
    }
};

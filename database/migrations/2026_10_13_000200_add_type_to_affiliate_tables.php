<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Penanda situs di seluruh tabel afiliasi.
 *
 * Nilainya mengikuti kolom `type` yang sudah dipakai sistem lama: 1 = AJP, 4 = Kopi TIMES
 * (2 dan 3 lini produk lain). Afiliator hanya memperoleh komisi dari pendaftar di situs
 * yang sama dengan `type`-nya, dan pencairan disusun terpisah per situs.
 *
 * Default 4 hanya menambal baris lama; aplikasi selalu mengisi kolom ini secara eksplisit
 * dari config('affiliate.site_type') milik deployment masing-masing.
 */
return new class extends Migration
{
    private array $tables = ['affiliates', 'affiliate_referrals', 'affiliate_commissions', 'affiliate_payouts'];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->unsignedTinyInteger('type')->default(4)->index()->after('id');
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropColumn('type');
            });
        }
    }
};

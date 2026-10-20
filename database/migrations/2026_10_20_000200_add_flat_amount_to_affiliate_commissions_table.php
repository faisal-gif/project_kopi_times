<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Komponen TETAP sebuah pos komisi, di atas persentasenya.
 *
 * Pos internal (staff IT) berubah dari "10% dari sisa" menjadi "10% dari sisa + Rp 1.000".
 * Tanpa kolom ini baris internal berhenti bisa dihitung ulang: orang yang mengaudit akan
 * melihat base 38.400 dengan rate 1000 bps tapi amount 4.840, lalu menyimpulkan ada bug.
 *
 * Dengan kolom ini setiap baris tetap menjelaskan dirinya sendiri:
 *     amount = intdiv(base_amount * rate_bps, 10000) + flat_amount
 *
 * Default 0, jadi seluruh baris lama tetap memenuhi rumus itu tanpa diubah.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('affiliate_commissions', function (Blueprint $table) {
            $table->unsignedBigInteger('flat_amount')->default(0)->after('rate_bps');
        });
    }

    public function down(): void
    {
        Schema::table('affiliate_commissions', function (Blueprint $table) {
            $table->dropColumn('flat_amount');
        });
    }
};

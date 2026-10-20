<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Penanda akun yang boleh menerima komisi tingkat 2 (5%) dari jaringannya.
 *
 * Inilah satu-satunya hal yang admin tentukan soal tingkat kedua. Admin mencentang
 * akun mana yang berhak; siapa upline seseorang lalu diturunkan sistem dari afiliator
 * yang mengundang dia jadi member — tapi HANYA bila afiliator itu dicentang.
 *
 * Riwayat singkat yang perlu diketahui sebelum mengubah ini lagi:
 *   2026-10-19  upline diisi otomatis dari perekrut, tanpa syarat apa pun
 *   2026-10-20  dibatalkan; upline sepenuhnya manual lewat dropdown di CMS
 *   2026-10-20  bentuk final: dropdown diganti penanda ini, upline otomatis tapi
 *               hanya untuk akun yang dicentang admin
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('affiliates', function (Blueprint $table) {
            $table->boolean('tier2_eligible')->default(false)->after('upline_id');
        });
    }

    public function down(): void
    {
        Schema::table('affiliates', function (Blueprint $table) {
            $table->dropColumn('tier2_eligible');
        });
    }
};

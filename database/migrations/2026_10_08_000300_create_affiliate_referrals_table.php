<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affiliate_referrals', function (Blueprint $table) {
            $table->id();

            // wartawan.id — satu member selamanya milik satu perekrut. Tanpa FK (tipe int legacy).
            $table->unsignedBigInteger('user_id')->unique();

            $table->unsignedBigInteger('affiliate_id')->index();
            $table->string('code', 32);                               // snapshot kode yang dipakai
            $table->enum('source', ['link', 'manual'])->default('link');

            $table->timestamps();                                      // created_at = waktu atribusi dikunci

            // restrict: afiliator yang sudah punya rekrutan tidak bisa dihapus.
            $table->foreign('affiliate_id')->references('id')->on('affiliates')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliate_referrals');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affiliate_payouts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('affiliate_id')->index();

            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();

            // Wajib sama dengan SUM(affiliate_commissions.amount) yang payout_id-nya menunjuk batch ini.
            $table->unsignedBigInteger('amount');

            // Snapshot rekening saat transfer — data di tabel affiliates bisa berubah nanti.
            $table->enum('method', ['bank', 'ewallet'])->default('bank');
            $table->string('bank_name', 60)->nullable();
            $table->string('bank_account_number', 40)->nullable();
            $table->string('bank_account_name', 100)->nullable();

            $table->string('reference')->nullable();    // nomor referensi transfer
            $table->string('proof_path')->nullable();   // bukti transfer

            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->text('note')->nullable();

            $table->timestamps();

            $table->index(['affiliate_id', 'status']);
            $table->foreign('affiliate_id')->references('id')->on('affiliates')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliate_payouts');
    }
};

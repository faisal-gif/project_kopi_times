<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affiliate_commissions', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('payment_id');
            $table->unsignedBigInteger('user_id')->index();   // member yang membayar (wartawan.id)

            $table->enum('role', ['tier1', 'tier2', 'internal']);

            // Penerima. Null untuk pos internal dan untuk tier2 yang belum punya upline.
            $table->unsignedBigInteger('affiliate_id')->nullable()->index();

            // Perekrut langsung asal baris ini — membuat baris tier2 tertahan tetap bisa ditelusuri.
            $table->unsignedBigInteger('source_affiliate_id')->nullable()->index();

            // Snapshot cara hitung saat kejadian, supaya perubahan harga/tarif tidak mengubah angka lama.
            $table->unsignedBigInteger('base_amount');
            $table->unsignedSmallInteger('rate_bps');
            $table->unsignedBigInteger('amount');

            $table->enum('status', [
                'accrued',      // tercatat, menunggu masa tahan
                'unassigned',   // tier2 tanpa upline, belum ada penerima
                'approved',     // disetujui admin, siap masuk batch
                'rejected',     // dibatalkan sebelum dibayar (final)
                'paid',         // sudah dicairkan
                'reversed',     // dibalik karena refund/chargeback
            ])->default('accrued');
            $table->string('status_note')->nullable();

            $table->timestamp('available_at');                 // paid_at + hold_days
            $table->unsignedBigInteger('payout_id')->nullable()->index();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();

            // Jaminan idempotensi: callback ganda tidak bisa menggandakan komisi.
            $table->unique(['payment_id', 'role']);
            $table->index(['affiliate_id', 'status']);
            $table->index(['status', 'available_at']);

            $table->foreign('payment_id')->references('id')->on('payments')->restrictOnDelete();
            $table->foreign('affiliate_id')->references('id')->on('affiliates')->restrictOnDelete();
            $table->foreign('source_affiliate_id')->references('id')->on('affiliates')->restrictOnDelete();
            $table->foreign('payout_id')->references('id')->on('affiliate_payouts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliate_commissions');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('merchandise_shipments', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel wartawan (penerima)
            // Sesuaikan references('id')->on('wartawan') jika menggunakan custom table
            $table->integer('user_id');
            $table->foreign('user_id')->references('id')->on('wartawan')->onDelete('cascade');

            // Relasi ke tabel payments (sumber transaksi)
            // Dibuat nullable() agar Admin tetap bisa mengirim hadiah manual tanpa lewat payment gateway jika diperlukan
            $table->unsignedBigInteger('payment_id')->nullable();
            $table->foreign('payment_id')->references('id')->on('payments')->onDelete('cascade');

            // Detail Barang & Pengiriman
            $table->string('item_name');
            $table->text('shipping_address');
            $table->enum('status', ['pending', 'processing', 'shipped', 'delivered'])->default('pending');
            $table->string('tracking_number')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('merchandise_shipments');
    }
};

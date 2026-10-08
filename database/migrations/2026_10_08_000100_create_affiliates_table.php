<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affiliates', function (Blueprint $table) {
            $table->id();

            // Relasi ke wartawan.id — identitas login portal afiliasi.
            // Tanpa foreign key: wartawan.id bertipe int legacy, sedangkan kolom ini bigint.
            // Null = afiliator yang tidak pernah login, hanya dibayar lewat transfer.
            $table->unsignedBigInteger('user_id')->nullable()->unique();

            // Tingkat kedua: perekrut dari afiliator ini.
            $table->unsignedBigInteger('upline_id')->nullable()->index();

            $table->string('code', 32)->unique();   // nilai ?ref= di URL publik
            $table->string('name');
            $table->string('email')->nullable()->unique();
            $table->string('phone', 30)->nullable();

            $table->enum('payout_method', ['bank', 'ewallet'])->default('bank');
            $table->string('bank_name', 60)->nullable();
            $table->string('bank_account_number', 40)->nullable();
            $table->string('bank_account_name', 100)->nullable();

            // Hanya 'active' yang menghasilkan atribusi dan komisi baru.
            $table->enum('status', ['pending', 'active', 'suspended', 'inactive'])->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->text('note')->nullable();

            $table->timestamps();

            $table->foreign('upline_id')->references('id')->on('affiliates')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliates');
    }
};

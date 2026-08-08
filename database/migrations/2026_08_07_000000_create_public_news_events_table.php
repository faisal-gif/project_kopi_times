<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Konfigurasi "kirim berita tanpa login" per-event. Dibaca app ini, ditulis CMS lain.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('public_news_events', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category')->default('event'); // event | lomba
            $table->text('description')->nullable();
            $table->boolean('enabled')->default(false);
            $table->dateTime('starts_at')->nullable();
            $table->dateTime('ends_at')->nullable();
            $table->unsignedInteger('quota')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('public_news_events');
    }
};

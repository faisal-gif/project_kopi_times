<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tandai asal event (relasi ke tabel events). Null = bukan dari event.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('news', function (Blueprint $table) {
            $table->unsignedBigInteger('event_id')->nullable()->after('pewarta_id')->index();
            $table->string('category')->default('regular')->after('event_id')->index(); // regular | event | lomba
        });
    }

    public function down(): void
    {
        Schema::table('news', function (Blueprint $table) {
            $table->dropColumn(['event_id', 'category']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Member bisa mengajukan diri jadi afiliator; dua kolom ini jejak pengajuannya.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('affiliates', function (Blueprint $table) {
            // Kosong untuk afiliator yang dibuat admin lewat CMS.
            $table->timestamp('terms_accepted_at')->nullable()->after('approved_at');
            // Alasan/audiens dari pemohon. Dipisah dari `note` yang milik admin.
            $table->text('applicant_note')->nullable()->after('terms_accepted_at');
        });
    }

    public function down(): void
    {
        Schema::table('affiliates', function (Blueprint $table) {
            $table->dropColumn(['terms_accepted_at', 'applicant_note']);
        });
    }
};

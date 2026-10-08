<?php

namespace Tests\Concerns;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel legacy (`wartawan`, `news_package`, `items_lainnya`, `kategori_kt`) tidak punya
 * migration di repo ini, jadi tidak ada di database test. Trait ini membuat versi
 * minimalnya khusus untuk test.
 *
 * Sengaja trait, bukan migration: migration akan mencoba membuat tabel ini di produksi,
 * padahal di sana tabelnya sudah ada dan dimiliki CMS.
 */
trait CreatesLegacySchema
{
    protected function createLegacySchema(): void
    {
        Schema::create('wartawan', function (Blueprint $table) {
            $table->increments('id');
            $table->string('nama')->nullable();
            $table->string('email')->nullable();
            $table->string('password')->nullable();
            $table->string('passwd')->nullable();
            $table->string('remember_token', 100)->nullable();
            $table->string('prov')->nullable();
            $table->string('city')->nullable();
            $table->string('contact')->nullable();
            $table->string('address')->nullable();
            $table->string('instansi')->nullable();
            $table->string('avatar')->nullable();
            $table->string('avatar_raw')->nullable();
            $table->integer('kategori')->nullable();
            $table->integer('package_id')->nullable();
            $table->integer('status')->default(0);
            $table->integer('type')->nullable();
            $table->integer('quota_news')->default(0);
            $table->integer('feed_instagram')->default(0);
            $table->integer('ekoran')->default(0);
            $table->integer('wa_channel')->default(0);
            $table->dateTime('dateexp')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('created')->nullable();
            $table->timestamp('modified')->nullable();
        });

        Schema::create('news_package', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('level')->default(1);
            $table->string('type')->default('4');
            $table->integer('status')->default(1);
            $table->unsignedBigInteger('price')->default(0);
            $table->integer('period')->default(1);
            $table->string('jenis_periode')->default('bulan');
            $table->integer('quota')->default(0);
            $table->integer('feed_instagram')->default(0);
            $table->integer('ekoran')->default(0);
            $table->integer('wa_channel')->default(0);
            $table->boolean('popular')->default(false);
            $table->text('feature')->nullable();
            $table->text('description')->nullable();
            $table->string('kategori_produk')->default('paket');
            $table->timestamps();
        });

        Schema::create('items_lainnya', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('news_package_id');
            $table->string('type')->default('merchandise');
            $table->string('nama_item');
            $table->integer('qty')->default(1);
            $table->timestamps();
        });

        Schema::create('kategori_kt', function (Blueprint $table) {
            $table->id();
            $table->integer('kategori_id')->unique();
            $table->string('name');
        });

        // Kolom yang ada di DB produksi tapi tidak pernah masuk migration `payments`.
        Schema::table('payments', function (Blueprint $table) {
            $table->string('type')->nullable();
            $table->unsignedBigInteger('fee_merchant')->nullable();
            $table->unsignedBigInteger('fee_customer')->nullable();
            $table->unsignedBigInteger('total_fee')->nullable();
            $table->unsignedBigInteger('total_amount')->nullable();
            $table->unsignedBigInteger('amount_recived')->nullable();
        });
    }
}

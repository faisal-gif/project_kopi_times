<?php

return [
    /*
     * Matikan untuk menghentikan pencatatan komisi tanpa deploy ulang kode.
     * Atribusi referral tetap berjalan; hanya pembuatan baris komisi yang berhenti.
     */
    'enabled' => (bool) env('AFFILIATE_ENABLED', true),

    /*
     * Tarif dalam basis poin (1% = 100 bps) supaya tidak ada pecahan.
     * tier1 dihitung dari harga pembayaran, tier2 & internal dari sisa setelah tier1.
     * Default: 48.000 -> 9.600 (tier1) / 1.920 (tier2) / 3.840 (internal) / 32.640 (kantor).
     */
    'tier1_bps'    => (int) env('AFFILIATE_TIER1_BPS', 2000),
    'tier2_bps'    => (int) env('AFFILIATE_TIER2_BPS', 500),
    'internal_bps' => (int) env('AFFILIATE_INTERNAL_BPS', 1000),

    /*
     * Komponen TETAP pos internal (staff IT), ditambahkan di atas persentase:
     * internal = internal_bps% x sisa setelah tier1  +  internal_flat.
     * Default 48.000 -> 3.840 + 1.000 = 4.840.
     *
     * Karena ini bukan persentase, nilainya di-snapshot per baris di kolom
     * `affiliate_commissions.flat_amount` supaya tiap baris tetap bisa dihitung
     * ulang: amount = intdiv(base_amount * rate_bps, 10000) + flat_amount.
     */
    'internal_flat' => (int) env('AFFILIATE_INTERNAL_FLAT', 1000),

    // Masa tahan sebelum komisi boleh disetujui untuk dicairkan.
    'hold_days' => (int) env('AFFILIATE_HOLD_DAYS', 7),

    // Saldo minimum sebelum komisi bisa dicairkan. Dipakai di syarat & ketentuan,
    // dan jadi acuan CMS saat menyusun batch pencairan.
    'min_payout' => (int) env('AFFILIATE_MIN_PAYOUT', 50_000),

    /*
     * Label situs untuk laporan. Kopi TIMES dan AJP memakai codebase dan database
     * yang sama, jadi deployment-lah yang menyebutkan dirinya siapa.
     */
    'site' => env('AFFILIATE_SITE', 'kopi'),

    /*
     * Penanda situs yang disimpan di seluruh tabel afiliasi, memakai kolom `type`
     * yang sudah dipakai sistem lama: 1 = AJP, 4 = Kopi TIMES.
     * Afiliator hanya berkomisi dari pendaftar di situs yang sama dengan type-nya.
     */
    'site_type' => (int) env('AFFILIATE_SITE_TYPE', 4),

    // Cookie atribusi: sentuhan pertama yang menang.
    'cookie_name' => 'kt_ref',
    'cookie_days' => 30,

    /*
     * Kosong = cookie hanya berlaku di domain situs ini (atribusi terpisah per situs).
     * Diisi '.times.co.id' = satu klik berlaku di seluruh subdomain TIMES.
     * Nama cookie sengaja sama di semua situs supaya opsi ini bisa dinyalakan kapan saja.
     *
     * Nilainya DINORMALKAN, bukan dipakai apa adanya. Pada 2026-10-20 produksi terisi
     * 'https://kopi.times.co.id/' — URL penuh, bukan nama domain. Atribut domain yang
     * tidak sah membuat browser menolak cookie TANPA pesan error apa pun: tidak ada
     * yang masuk log, dan seluruh atribusi referral mati diam-diam selama berminggu-
     * minggu. Kegagalan sesenyap itu pada jalur uang pantas ditahan di sini, bukan
     * diserahkan ke kedisiplinan mengisi .env.
     *
     * Hasilnya: URL penuh diambil host-nya, '.times.co.id' dibiarkan utuh beserta
     * titik depannya, dan kosong tetap null (Laravel lalu jatuh ke session.domain).
     */
    'cookie_domain' => (static function () {
        $nilai = trim((string) env('AFFILIATE_COOKIE_DOMAIN'));

        if ($nilai === '') {
            return null;
        }

        return parse_url($nilai, PHP_URL_HOST) ?: rtrim($nilai, '/');
    })(),
];

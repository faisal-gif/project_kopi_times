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

    // Masa tahan sebelum komisi boleh disetujui untuk dicairkan.
    'hold_days' => (int) env('AFFILIATE_HOLD_DAYS', 7),

    /*
     * Label situs untuk laporan. Kopi TIMES dan AJP memakai codebase dan database
     * yang sama, jadi deployment-lah yang menyebutkan dirinya siapa.
     */
    'site' => env('AFFILIATE_SITE', 'kopi'),

    // Cookie atribusi: sentuhan pertama yang menang.
    'cookie_name' => 'kt_ref',
    'cookie_days' => 30,

    /*
     * Kosong = cookie hanya berlaku di domain situs ini (atribusi terpisah per situs).
     * Diisi '.times.co.id' = satu klik berlaku di seluruh subdomain TIMES.
     * Nama cookie sengaja sama di semua situs supaya opsi ini bisa dinyalakan kapan saja.
     */
    'cookie_domain' => env('AFFILIATE_COOKIE_DOMAIN'),
];

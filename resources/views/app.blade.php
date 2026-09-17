<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="times">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        @php
            // OpenGraph server-side (crawler WhatsApp, FB, X, Google tidak menjalankan JS).
            // Halaman tanpa props.og memakai default; yang bukan halaman publik diberi noindex.
            $pageOg = data_get($page, 'props.og') ?? [];
            $og = array_merge([
                'title'       => 'Kolom Opini TIMES Indonesia — Kopi TIMES',
                'description' => 'Tulis opini dan terbitkan di TIMES Indonesia. Jadi anggota penulis Kopi TIMES: akses CMS, kuota menulis, member card, dan tulisan terindeks Google.',
                'image'       => url('/og-kopi-times.png'),
                'image_alt'   => 'Naskah opini Kopi TIMES: Gagasan Anda layak dibaca Indonesia.',
                'url'         => url()->current(),
                'type'        => 'website',
            ], array_filter($pageOg));
            $indexable = (bool) $pageOg;
        @endphp
        <title inertia>{{ $og['title'] }}</title>
        <meta name="description" content="{{ $og['description'] }}">
        <meta name="robots" content="{{ $indexable ? 'index, follow' : 'noindex, nofollow' }}">
        <link rel="canonical" href="{{ $og['url'] }}">
        <meta name="theme-color" content="#8a0b10">
        <link rel="icon" href="/favicon.ico">

        <meta property="og:site_name" content="Kopi TIMES">
        <meta property="og:locale" content="id_ID">
        <meta property="og:type" content="{{ $og['type'] }}">
        <meta property="og:title" content="{{ $og['title'] }}">
        <meta property="og:description" content="{{ $og['description'] }}">
        <meta property="og:url" content="{{ $og['url'] }}">
        <meta property="og:image" content="{{ $og['image'] }}">
        <meta property="og:image:type" content="image/png">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="{{ $og['image_alt'] }}">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:site" content="@@timescoid">
        <meta name="twitter:title" content="{{ $og['title'] }}">
        <meta name="twitter:description" content="{{ $og['description'] }}">
        <meta name="twitter:image" content="{{ $og['image'] }}">
        <meta name="twitter:image:alt" content="{{ $og['image_alt'] }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        <!--
        THESIS: Landing Kopi TIMES adalah naskah opini yang sedang disunting redaksi; menolak hero SaaS tengah + kartu ikon.
        OWN-WORLD: meja merah TIMES (#8a0b10), lembar HVS (#fcfcfa), tinta hitam, pena merah (#b30d12), stabilo saffron (#fbb40a); Archivo cetak, Courier Prime ketik, Kalam tulisan tangan; selotip kuning, garis putus-putus.
        STORY: pengunjung paham tulisannya akan terbit di TIMES Indonesia setelah seleksi redaksi, melihat member card & bingkai, lalu daftar atau pilih paket.
        FIRST VIEWPORT: lembar naskah 8/12 miring tipis di meja merah; judul "Gagasan Anda" + frasa dicoret pena + sisipan tulisan tangan; tombol Daftar merah di dalam lembar; member card asli diselotip di kanan.
        FORM: Naskah & Tinta Merah Redaksi, kandidat #1 (pick), seed 89e085db.
        FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
        -->
        @inertia
    </body>
</html>

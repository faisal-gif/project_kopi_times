<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" data-theme="times">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        @php($og = data_get($page, 'props.og'))
        <title inertia>{{ data_get($og, 'title', config('app.name', 'Laravel')) }}</title>

        {{-- OpenGraph server-side (untuk crawler: WhatsApp, FB, Google — mereka tak jalankan JS) --}}
        @if($og)
            <meta name="description" content="{{ data_get($og, 'description') }}">
            <meta property="og:type" content="{{ data_get($og, 'type', 'website') }}">
            <meta property="og:title" content="{{ data_get($og, 'title') }}">
            <meta property="og:description" content="{{ data_get($og, 'description') }}">
            <meta property="og:image" content="{{ data_get($og, 'image') }}">
            <meta property="og:url" content="{{ data_get($og, 'url', url()->current()) }}">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="630">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="{{ data_get($og, 'title') }}">
            <meta name="twitter:description" content="{{ data_get($og, 'description') }}">
            <meta name="twitter:image" content="{{ data_get($og, 'image') }}">
        @endif

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

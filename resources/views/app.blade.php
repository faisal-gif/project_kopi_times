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
        @inertia
    </body>
</html>

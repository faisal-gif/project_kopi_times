# Kopi TIMES

Aplikasi membership penulis **Kopi TIMES** (Kolom Opini TIMES Indonesia). Penulis mendaftar dan membayar paket, lalu menulis opini lewat CMS. Tulisan yang lolos seleksi redaksi terbit di TIMES Indonesia. Aplikasi ini juga melayani form **Kirim Berita** publik per event tanpa login.

- Produk, audiens, dan fakta yang boleh diklaim: [PRODUCT.md](PRODUCT.md)
- Sistem visual halaman publik: [DESIGN.md](DESIGN.md)
- Spesifikasi manage event untuk CMS redaksi: [INSTRUKSI_MANAGE_PUBLIC_EVENT.md](INSTRUKSI_MANAGE_PUBLIC_EVENT.md)

## Stack

Laravel 12 (PHP 8.2) · Inertia 2 + React 18 · Vite 7 · Tailwind CSS 4 + daisyUI 5 · MariaDB/MySQL · pembayaran Tripay · penyimpanan gambar TIN CDN.

## Menjalankan secara lokal

```bash
composer setup   # install, .env, key:generate, migrate, npm install, build
composer dev     # server + queue listener + log (pail) + vite
```

Buka `http://localhost:8000`.

> **Hati-hati dengan database.** Kalau `.env` menunjuk ke database bersama/remote, driver `database` untuk session, cache, dan queue akan menulis ke sana. Untuk sekadar melihat halaman, jalankan server dengan `SESSION_DRIVER=file CACHE_STORE=file`. Konfigurasi `laravel` di [.claude/launch.json](.claude/launch.json) sudah melakukannya.

### Environment

Selain variabel bawaan Laravel di `.env.example`, aplikasi membutuhkan:

| Variabel | Dipakai untuk |
|---|---|
| `TRIPAY_API_KEY`, `TRIPAY_MERCHANT_CODE`, `TRIPAY_PRIVATE_KEY` | Pembayaran paket (`app/Services/TripayService.php`); callback di `POST /api/tripay/callback` |
| `TIN_CDN_URL`, `TIN_CDN_API_KEY` | Upload gambar (`app/Services/CdnService.php`) |
| `APP_URL` | URL absolut (link email, dsb.). Meta OG/canonical memakai host dari request, lihat [Meta & OpenGraph](#meta--opengraph). |

## Peta halaman

| URL | Komponen | Catatan |
|---|---|---|
| `/` | `Pages/Welcome/Index.jsx` | Landing; paket dari `WelcomeController@index` |
| `/tentang` | `Pages/Tentang/Index.jsx` | Closure di `routes/web.php` |
| `/harga` | `Pages/Harga/Index.jsx` | Memakai ulang `PricingSection` + `FeatureSection` |
| `/kebijakan-privasi`, `/syarat-ketentuan` | `Pages/KebijakanPrivasi`, `Pages/SyaratKetentuan` | |
| `/login`, `/register`, `/forgot-password`, … | `Pages/Auth/*` | Layout `GuestLayout` |
| `/kirim-berita/{slug}` | `Pages/PublicNews/Create` atau `Closed` | Hanya event `public_event` yang aktif dan kuotanya belum penuh; `POST` dibatasi 5/menit |
| `/checkout`, `/dashboard`, `/news`, … | halaman terautentikasi | Layout `AuthenticatedLayout` |

Paket yang tampil bergantung pada user: tamu dan user nonaktif melihat paket `level 1` (tombol ke `/register`); user aktif melihat `level 2` (tombol ke `/checkout?package_id=`).

## Halaman publik

Halaman publik (landing, Tentang, Harga, dan semua halaman `GuestLayout`) memakai dunia visual "naskah & tinta merah redaksi". Aturan lengkapnya ada di [DESIGN.md](DESIGN.md). Ringkasan untuk developer:

- **Token** ada di `@theme` pada `resources/css/app.css`: warna `desk`, `sheet`, `paper`, `ink`, `pen`, `saffron`, dan font `font-print`, `font-type`, `font-pen`. Pakai utility-nya (`bg-desk`, `text-pen`, `font-type`), jangan hex langsung.
- **Font** (Archivo, Courier Prime, Kalam) dimuat dari fonts.bunny.net di `LandingLayout` dan `GuestLayout`. Dashboard tetap memakai Figtree + tema daisyUI `times`.
- **Wrapper:** bungkus konten publik dengan `kt-landing`. `GuestLayout` juga memasang `kt-auth`, yang menata ulang `.input`, `.select`, `.textarea`, `.btn-primary`, `.checkbox`, dan `.alert` daisyUI **hanya di dalam layout itu**. Komponen form bersama di `resources/js/Components` tidak diubah.
- **Komponen yang bisa dipakai ulang:**
  - `Welcome/Partials/PricingSection`: props `newsPackages`, `as` (tag heading), `title`, `className`.
  - `Welcome/Partials/FeatureSection`: kriteria redaksi.
  - `Welcome/Partials/AboutSection`: benefit + bingkai foto.
  - `GuestLayout` mengekspor `GuestHeading`, `Field`, `Notice`, dan `textLinkClass` untuk halaman guest.

```jsx
import GuestLayout, { Field, GuestHeading } from '@/Layouts/GuestLayout';

<GuestLayout>
    <Head title="Lupa Password" />
    <GuestHeading title="Lupa password?">Masukkan email akun Anda.</GuestHeading>
    <Field id="email" label="Email" error={errors.email}>
        <TextInput id="email" type="email" className="block w-full" … />
    </Field>
</GuestLayout>
```

**Aturan konten:** angka yang boleh ditampilkan hanya 10K+ artikel, 5K+ penulis, dan 1M+ pembaca. Testimoni hanya 8 gambar di CDN. Jangan menambah klaim, nama penulis, atau kutipan tanpa konfirmasi (lihat [PRODUCT.md](PRODUCT.md)).

## Meta & OpenGraph

Crawler WhatsApp, Facebook, X, dan Google tidak menjalankan JavaScript, jadi meta dirender di server oleh [resources/views/app.blade.php](resources/views/app.blade.php) dari prop Inertia `og`.

**Untuk menambah halaman publik**, kirim `og` dari controller atau route:

```php
return Inertia::render('Tentang/Index', [
    'og' => [
        'title'       => 'Tentang Kami — Kopi TIMES',   // samakan dengan <Head title="Tentang Kami" />
        'description' => 'Maksimal ±155 karakter.',
        'url'         => route('tentang'),
        // opsional: 'image' => url('/…png'), 'image_alt' => '…', 'type' => 'article'
    ],
]);
```

- **Default:** field yang tidak diisi memakai default di Blade. Gambar default `public/og-kopi-times.png` berukuran 1200×630.
- **Indexing:** halaman **dengan** `og` mendapat `robots: index, follow`. Halaman **tanpa** `og` (lupa/reset password, verifikasi email, dashboard) otomatis `noindex, nofollow`. Jadi kalau halaman baru harus terindeks Google, beri `og`.
- **Judul tab:** diatur `app.jsx` sebagai `"{title} — Kopi TIMES"`. Isi `<Head title>` dengan judul pendek saja, dan jangan menaruh `<meta>` di `<Head>` React (tidak dibaca crawler).
- **Kirim Berita:** deskripsi diambil dari deskripsi event, dirapikan dengan `Str::squish` lalu dipotong dengan `Str::limit(155)`.

**Memeriksa hasil:**

```bash
curl -s http://localhost:8000/harga | grep -E '<title|og:|robots|canonical'
```

Setelah deploy, cek pratinjau share di [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/). Kalau aplikasi berada di belakang proxy HTTPS, pastikan trusted proxies dikonfigurasi. Kalau tidak, `og:image` dan canonical akan tertulis `http://`.

## Build & deploy

```bash
npm run build                       # aset ke public/build
php artisan migrate --force
php artisan view:clear              # setelah mengubah app.blade.php
pm2 start ecosystem.config.cjs      # worker antrean "kopi-worker" (queue:work --tries=3)
```

## Test

```bash
composer test
```

# ADR 0002: Halaman pembayaran sendiri, bukan halaman Tripay

Tanggal: 2026-10-20 · Berlaku untuk `kopi.times.co.id` dan `ajp.times.co.id`

## Konteks

Setelah memilih channel di `/checkout`, user dilempar keluar ke halaman checkout milik Tripay lewat `redirect($payment->checkout_url)`. Manajemen ingin user tidak pernah keluar dari situs.

Keadaan saat keputusan ini dibuat:

- Kedua aplikasi sudah memakai Tripay **closed payment** (`POST /transaction/create` dengan `method` ditentukan), jadi channel memang sudah dipilih di aplikasi. Respons create sudah memuat `pay_code`, `pay_url`, `qr_url`, `instructions`, `expired_time`, dan `total_amount` — **semuanya dibuang**; hanya `reference` dan `checkout_url` yang disimpan.
- Tidak ada satu pun cara menanyakan status ke Tripay. Tidak ada `/transaction/detail`, tidak ada scheduler, tidak ada job. Callback adalah satu-satunya sumber kebenaran, dan kalau gagal, member sudah membayar tapi tidak aktif selamanya.
- Tidak ada yang menandai pembayaran kedaluwarsa secara lokal.
- `TripayService` identik di kedua repo, tapi `PaymentController` di AJP adalah fork lama tanpa validasi, tanpa pelingkupan paket, dengan `merchant_ref` berbasis `time()` pada kolom unik, dan memanggil HTTP di dalam transaksi DB.

## Keputusan

### 1. Simpan alat bayarnya, render sendiri

Lima kolom baru di `payments` (`pay_code`, `pay_url`, `qr_url`, `payment_name`, `instructions`), ditambah pengisian `expired_at`, `total_amount`, `fee_customer`, dan `total_fee` sejak create. Halaman `/pembayaran/{merchant_ref}` merender semuanya.

`checkout_url` tetap disimpan dan dipakai sebagai jalan keluar bila sebuah baris tidak punya alat bayar — baris lama sebelum migration, atau channel yang bentuknya tak terduga. Karena itu perubahan ini bisa dirilis tanpa hari-H.

### 2. Pengaktifan hanya boleh ada di satu tempat

Tombol "Cek status" menanyakan `/transaction/detail` dan, bila Tripay menjawab sudah dibayar, **mengaktifkan membernya saat itu juga**. Artinya ada dua pemicu untuk fulfilment yang sama.

Karena itu seluruh isi blok `paid` dipindah dari `TripayCallbackController` ke `PaymentFulfillmentService::tandaiLunas()`, dan kedua pemicu memanggilnya. Dua hal di dalamnya tidak boleh diubah: baris payment dikunci lalu statusnya diperiksa ulang di dalam transaksi, dan komisi afiliasi dicatat **sebelum** mutasi user karena `isNewMemberSale()` membaca status aktif user.

Servicenya disalin per repo, bukan dibagi: isi fulfilmen AJP memang lebih sedikit (satu counter, tanpa merchandise) dan harus tetap begitu.

Alasan menerima jalur kedua ini: tanpa itu, kegagalan callback — yang tidak terdeteksi oleh apa pun di sistem ini — berarti member membayar tanpa mendapat apa-apa. Risiko dobel ditangani lock yang memang sudah ada dan terbukti lewat test.

### 3. Kedaluwarsa ditandai saat dilihat, bukan oleh scheduler

Projek ini tidak punya scheduler sama sekali. Menandai kedaluwarsa saat halaman dibuka atau status dicek sudah cukup, karena hanya di dua tempat itu statusnya dibaca manusia. Menambah scheduler untuk satu kolom tidak sepadan.

### 4. AJP disejajarkan karena filenya memang ditulis ulang

Validasi, pelingkupan paket, `merchant_ref` ULID, dan pemanggilan Tripay di luar transaksi DB ikut masuk ke AJP. `merchant_ref` berbasis `time()` pada kolom unik adalah bug tabrakan yang nyata; keduanya berada di baris yang memang diganti.

## Konsekuensi

**Positif**

- User menyelesaikan pembayaran tanpa keluar dari situs, dan nominal yang harus dibayar diketahui sejak transaksi dibuat, bukan diperkirakan JavaScript.
- Callback yang gagal tidak lagi menjebak member yang sudah membayar.
- Kedaluwarsa akhirnya tercatat.

**Yang disadari**

- Ada jalur pengaktifan yang dipicu tindakan user. Keamanannya bergantung pada lock dan pemeriksaan ulang di dalam transaksi — kalau keduanya dicabut, kuota dan komisi bisa dobel.
- Polling halaman menambah beban ringan ke Tripay dan ke server. Dibatasi `throttle` dan hanya berjalan selama halaman terbuka dan pembayaran masih menunggu.
- `instructions` dirender sebagai teks, bukan HTML. Sebagian penekanan dari Tripay jadi hilang; itu disengaja.

## Alternatif yang ditolak

| Alternatif | Alasan ditolak |
|---|---|
| Tetap memakai halaman Tripay | Tidak menjawab permintaannya, dan tidak memperbaiki apa pun soal callback yang gagal |
| Pindah ke `/open-payment` | Tidak dibutuhkan; closed payment sudah memberi semua datanya |
| Scheduler untuk menandai kedaluwarsa | Menambah infrastruktur baru ke projek tanpa scheduler, demi satu kolom yang hanya dibaca di dua layar |
| Cek status hanya membaca, tidak mengaktifkan | Lebih sedikit kode, tapi membiarkan kegagalan callback tetap menjebak member yang sudah membayar |
| Satu `PaymentFulfillmentService` dibagi dua repo | Isi fulfilmen keduanya memang berbeda dan harus tetap berbeda |

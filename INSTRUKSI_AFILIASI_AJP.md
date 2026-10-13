# Instruksi: Ikut Program Afiliasi (untuk projek AJP)

Program afiliasi 2 tingkat dibangun di projek **Kopi TIMES** (`kopi.times.co.id`). Dokumen ini untuk projek **AJP** (`ajp.times.co.id`) agar ikut program yang sama.

> Prinsip: hampir tidak ada kode baru. Codebase dan database kedua projek sama, jadi tugas AJP adalah **mengambil kode yang sudah ada dan mengisi konfigurasi** — bukan membangun ulang.

## Konteks

- Kedua projek memakai **codebase yang sama** dan **database yang sama**: `timesindo_ajp`.
- Yang membedakan produk adalah kolom **`type`**: paket di `news_package`, akun di `wartawan`, transaksi di `payments`, berita di `news`. Nilainya tidak pernah ditulis di kode mana pun, hanya ada di data:

| `type` | Produk |
|---|---|
| **1** | **AJP** |
| 2, 3 | lini produk lain di database yang sama |
| **4** | **Kopi TIMES** |
- Satu akun hanya bisa membeli produk satu situs, dan `app/Http/Requests/Auth/LoginRequest.php` sudah memblokir login silang.

**Karena databasenya satu, afiliasi lintas situs otomatis terjadi:**

| Hal | Jadinya |
|---|---|
| Afiliator | Satu tabel `affiliates` untuk semua situs |
| Kode referral | Satu kode milik afiliator, berlaku di situs mana pun |
| Ledger komisi | Satu tabel `affiliate_commissions` |
| Saldo & pencairan | Satu saldo, satu batch transfer |
| Laporan | Tetap bisa dipecah per situs lewat `type` |

Jadi afiliator yang merekrut ke Kopi TIMES dan ke AJP tetap satu orang dengan satu saldo. Tidak ada layanan terpusat, tidak ada API antar situs, tidak ada sinkronisasi.

## Yang sudah tersedia — jangan dibangun ulang

Semuanya sudah ada di codebase (ambil dari projek Kopi TIMES):

| Bagian | File |
|---|---|
| Tabel | 4 migration `database/migrations/2026_10_08_0001..0004_*` |
| Model | `app/Models/Affiliate.php`, `AffiliateReferral.php`, `AffiliateCommission.php`, `AffiliatePayout.php` |
| Konfigurasi | `config/affiliate.php` |
| Tangkap kode referral | `app/Http/Middleware/CaptureReferralCode.php` (terdaftar di grup `web` pada `bootstrap/app.php`) |
| Atribusi saat daftar | `app/Http/Controllers/Auth/RegisteredUserController.php` + `resources/js/Pages/Auth/Register.jsx` |
| Test | `tests/Feature/Affiliate/ReferralAttributionTest.php`, `tests/Concerns/CreatesLegacySchema.php` |

Ikut terbawa saat merge, tanpa langkah tambahan: **mesin komisi** di `TripayCallbackController`, **halaman afiliator** `/afiliasi`, **formulir pengajuan** `/afiliasi/daftar` (hanya untuk member aktif), dan **halaman syarat & ketentuan** `/syarat-afiliasi`. Karena tabel afiliasi dipakai bersama, pengajuan dari member AJP langsung masuk ke antrean yang sama di CMS.

Catatan lama (sudah tidak berlaku, disimpan sebagai jejak): bagian ini sebelumnya menyebut mesin komisi dan halaman afiliator **belum ada**. Begitu keduanya jadi di Kopi TIMES, AJP cukup menarik kodenya — tanpa perubahan apa pun.

Sisi admin (kelola afiliator, setujui komisi, pencairan) dibangun di **CMS**, lihat `INSTRUKSI_AFILIASI_CMS.md`. AJP tidak perlu membangun layar admin.

## Yang harus dilakukan projek AJP

### 1. Ambil kodenya
Merge atau cherry-pick perubahan afiliasi dari projek Kopi TIMES. Kalau kedua repo sudah lama berpisah, ambil per file sesuai tabel di atas.

### 2. JANGAN jalankan migration afiliasi
Database sama, dan tabel `migrations` juga sama. Setelah Kopi TIMES menjalankannya sekali, keempat tabel sudah ada untuk kedua situs. Menjalankan `php artisan migrate` di AJP akan dilewati karena sudah tercatat — dan **jangan sekali-kali** membuat migration baru dengan nama lain untuk tabel yang sama.

Pastikan dulu tabelnya memang sudah ada:

```sql
SHOW TABLES LIKE 'affiliate%';
```

Kalau belum muncul, tunggu projek Kopi TIMES menjalankan migration-nya. Jangan mendahului.

### 3. Isi `.env`

```env
AFFILIATE_ENABLED=true
AFFILIATE_SITE=ajp

# Isi hanya bila tarif AJP berbeda dari Kopi TIMES (default: 20% / 5% / 10%)
# AFFILIATE_TIER1_BPS=2000
# AFFILIATE_TIER2_BPS=500
# AFFILIATE_INTERNAL_BPS=1000
# AFFILIATE_HOLD_DAYS=7

# Kosong  = klik di AJP hanya berlaku untuk pendaftaran AJP
# .times.co.id = satu klik berlaku di seluruh subdomain TIMES
AFFILIATE_COOKIE_DOMAIN=
```

`AFFILIATE_SITE` hanya label untuk laporan; pemisahan data yang sebenarnya tetap lewat `type`.

### 4. Samakan keputusan lintas situs
Tiga setelan ini **harus sama persis** di kedua deployment, kalau tidak hasilnya aneh:

- `AFFILIATE_COOKIE_DOMAIN` — kalau satu situs mengisinya dan satunya tidak, atribusi jadi tidak konsisten.
- Nama cookie (`kt_ref`, di `config/affiliate.php`) — **jangan diganti**. Namanya memang berbau Kopi TIMES, tapi harus sama supaya cookie lintas subdomain bisa dinyalakan kapan saja.
- Masa tahan komisi (`AFFILIATE_HOLD_DAYS`), kecuali memang sengaja dibedakan.

### 5. Pastikan harga dan paket AJP
Komisi hanya dihitung untuk pembelian **member baru**, yaitu paket `level = 1` milik `type` AJP, dan hanya bila pembeli belum pernah punya pembayaran lunas. Jadi pastikan paket pendaftaran AJP ada dengan `level = 1`, `status = 1`, dan `type` AJP.

### 6. Verifikasi
1. Buat satu afiliator berstatus `active` lewat CMS, catat kodenya.
2. Buka `https://ajp.times.co.id/?ref=KODE`, pastikan cookie `kt_ref` terpasang.
3. Daftar akun baru, lalu cek satu baris muncul:
   ```sql
   SELECT * FROM affiliate_referrals ORDER BY id DESC LIMIT 1;
   ```
4. Jalankan test bawaan: `php artisan test --filter=ReferralAttributionTest` (9 test).

## Yang dilarang

- Membuat migration atau tabel afiliasi baru, termasuk versi "khusus AJP".
- Menambah kolom ke tabel afiliasi tanpa koordinasi; skema itu dipakai bersama tiga pihak (Kopi TIMES, AJP, CMS).
- Mengubah nominal, `base_amount`, `rate_bps`, atau `role` di `affiliate_commissions`. Ledger hanya ditulis oleh mesin komisi saat pembayaran lunas.
- Mengganti nama cookie atau format kode referral.
- Mengubah rumus komisi di kode. Semua perbedaan tarif lewat env.
- Membangun halaman afiliator kedua atau layar admin sendiri.

## Laporan per situs

Ledger tidak punya kolom situs, dan memang tidak perlu — situs bisa ditelusuri lewat paket yang dibeli:

```sql
SELECT np.type AS situs,
       SUM(CASE WHEN c.role = 'tier1'    THEN c.amount ELSE 0 END) AS tier1,
       SUM(CASE WHEN c.role = 'tier2'    THEN c.amount ELSE 0 END) AS tier2,
       SUM(CASE WHEN c.role = 'internal' THEN c.amount ELSE 0 END) AS kita_ai,
       SUM(c.amount) AS total
FROM affiliate_commissions c
JOIN payments p      ON p.id = c.payment_id
JOIN news_package np ON np.id = p.package_id
WHERE c.status <> 'rejected'
GROUP BY np.type;
```

Join lewat `news_package.type` dipakai karena kolom itu pasti ada. `payments.type` juga berisi nilai yang sama dan lebih pendek ditulis, tapi kolom itu tidak ada di migration mana pun (drift lama), jadi jangan dijadikan satu-satunya andalan.

## Login afiliator

`LoginRequest` membatasi satu akun hanya bisa login di situs sesuai `type`-nya. Karena ledger-nya bersama, **afiliator cukup login di satu situs** dan tetap melihat seluruh komisinya, termasuk yang berasal dari situs lain. Jangan membangun portal afiliasi kedua di AJP.

Afiliator yang bukan member mana pun tetap bisa dilayani: CMS menautkan akunnya lewat `affiliates.user_id`, atau membiarkannya kosong bila ia hanya menerima transfer tanpa perlu login.

## Yang perlu diputuskan pemilik produk

Tulis jawabannya di sini supaya kedua projek memakai setelan yang sama:

1. **Atribusi lintas subdomain** — satu klik berlaku di dua situs, atau terpisah? (default sekarang: terpisah)
2. **Tarif AJP** — sama dengan Kopi TIMES (20% / 5% / 10%) atau berbeda?
3. **Harga member baru AJP** — Kopi TIMES naik ke Rp 48.000; AJP berapa?
4. ~~**Nilai `type` AJP**~~ — sudah dikonfirmasi: **AJP = `1`**, Kopi TIMES = `4`.

## Catatan

- Codebase kedua projek sudah lama berpisah, jadi periksa konflik saat merge, terutama di `bootstrap/app.php` (pendaftaran middleware) dan `RegisteredUserController`.
- Zona waktu kedua deployment harus `Asia/Jakarta`; MySQL menyimpan datetime polos, dan beda zona membuat batas periode laporan meleset.
- Repo Kopi TIMES punya sisa kode AJP lama yang tidak terpakai (`RegisterAJPController`, `RegisterAJP.jsx` tanpa route, footer dan teks legal yang masih menyebut AJP). Jangan dijadikan acuan; itu warisan, bukan rancangan.

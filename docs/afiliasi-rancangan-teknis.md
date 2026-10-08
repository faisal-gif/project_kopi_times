# Rancangan Teknis: Afiliasi 2 Tingkat

Dokumen ini merinci implementasi di repo `kopi.times.co.id`. Keputusan dan alasannya ada di [ADR 0001](adr/0001-afiliasi-2-tingkat.md). Sisi admin dikerjakan CMS dengan kontrak di [INSTRUKSI_AFILIASI_CMS.md](../INSTRUKSI_AFILIASI_CMS.md).

## 0. Ringkasan rumus

Berlaku hanya untuk pembayaran **member baru yang punya perekrut**.

```
Tier 1 (perekrut langsung)  = 20% x 48.000 = 9.600
sisa (gross)                = 48.000 - 9.600 = 38.400
Tier 2 (upline perekrut)    =  5% x 38.400 =  1.920
Internal KITA AI (hidden)   = 10% x 38.400 =  3.840
Net kantor                  = 48.000 - 15.360 = 32.640
```

Net kantor **tidak disimpan sebagai baris ledger**; selalu `payment.amount - SUM(amount komisi)`. Dengan begitu sisa pembulatan otomatis jadi milik kantor dan jumlah baris tidak akan pernah melebihi nilai pembayaran.

## 1. Skema

Empat migration baru. Urutan: `affiliates` → `affiliate_payouts` → `affiliate_referrals` → `affiliate_commissions` (yang terakhir punya FK ke payouts).

Konvensi mengikuti `payments` dan `merchandise_shipments`: `$table->id()`, `unsignedBigInteger` untuk kolom relasi, `enum(...)->default()` untuk status, `timestamps()`.

> **Catatan FK:** `wartawan.id` bertipe `int` legacy, sedangkan kolom baru `unsignedBigInteger`. Tipe berbeda tidak bisa di-FK-kan di MySQL, jadi `user_id` di semua tabel di bawah hanya diberi index/unique tanpa constraint — sama seperti `payments.user_id` yang juga tanpa constraint.

### `affiliates`

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | bigint PK | |
| `user_id` | unsignedBigInteger nullable **unique** | `wartawan.id`. Null = afiliator yang tidak pernah login, hanya dibayar transfer |
| `upline_id` | unsignedBigInteger nullable, index | FK ke `affiliates.id`, `nullOnDelete` |
| `code` | string(32) unique | huruf besar + angka, nilai `?ref=` |
| `name` | string | wajib, dipakai di laporan dan di halaman pendaftaran |
| `email` | string nullable unique | juga dipakai untuk menolak self-referral |
| `phone` | string(30) nullable | |
| `payout_method` | enum(bank, ewallet) default bank | |
| `bank_name`, `bank_account_number`, `bank_account_name` | string nullable | |
| `status` | enum(pending, active, suspended, inactive) default pending | hanya `active` menghasilkan atribusi dan komisi |
| `approved_at` | timestamp nullable | |
| `note` | text nullable | catatan admin |
| `timestamps` | | |

### `affiliate_referrals`

Satu member satu perekrut, dikunci saat pendaftaran dan tidak pernah berubah.

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | bigint PK | |
| `user_id` | unsignedBigInteger **unique** | `wartawan.id` member yang direkrut |
| `affiliate_id` | unsignedBigInteger, index | FK `affiliates.id`, `restrictOnDelete` |
| `code` | string(32) | snapshot kode yang benar-benar dipakai |
| `source` | enum(link, manual) default link | dari cookie/URL atau diketik di form |
| `timestamps` | | `created_at` = waktu atribusi dikunci |

`restrictOnDelete` membuat "afiliator yang sudah punya rekrutan tidak bisa dihapus" jadi aturan database, bukan sekadar kesepakatan di CMS.

### `affiliate_commissions`

Ledger. Satu baris per pos per pembayaran, hanya ditulis aplikasi ini.

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | bigint PK | |
| `payment_id` | unsignedBigInteger | FK `payments.id`, `restrictOnDelete` |
| `user_id` | unsignedBigInteger, index | member yang membayar |
| `role` | enum(tier1, tier2, internal) | posisi pembagian |
| `affiliate_id` | unsignedBigInteger nullable, index | penerima. Null untuk `internal` dan untuk tier 2 yang belum ada uplinenya |
| `source_affiliate_id` | unsignedBigInteger nullable, index | perekrut langsung yang jadi asal baris ini. Membuat baris tier 2 tertahan tetap bisa ditelusuri |
| `base_amount` | unsignedBigInteger | 48.000 untuk tier1; 38.400 untuk tier2 dan internal |
| `rate_bps` | unsignedSmallInteger | 2000 / 500 / 1000 |
| `amount` | unsignedBigInteger | rupiah bulat |
| `status` | enum(accrued, unassigned, approved, rejected, paid, reversed) default accrued | |
| `status_note` | string nullable | alasan tolak/batal dari CMS |
| `available_at` | timestamp | `paid_at` + 7 hari. Sebelum ini lewat, komisi tidak boleh disetujui |
| `payout_id` | unsignedBigInteger nullable, index | FK `affiliate_payouts.id`, `nullOnDelete` |
| `approved_at`, `paid_at` | timestamp nullable | |
| `timestamps` | | |

Index tambahan: **`unique(payment_id, role)`** (jaminan idempotensi), `(affiliate_id, status)`, `(status, available_at)`.

### `affiliate_payouts`

| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | bigint PK | |
| `affiliate_id` | unsignedBigInteger, index | FK `affiliates.id`, `restrictOnDelete` |
| `period_start`, `period_end` | date nullable | |
| `amount` | unsignedBigInteger | harus sama dengan jumlah komisi yang menempel |
| `method` | enum(bank, ewallet) default bank | |
| `bank_name`, `bank_account_number`, `bank_account_name` | string nullable | snapshot rekening saat transfer; rekening afiliator bisa berubah nanti |
| `reference`, `proof_path` | string nullable | nomor dan bukti transfer |
| `status` | enum(pending, paid, cancelled) default pending | |
| `paid_at` | timestamp nullable | |
| `note` | text nullable | |
| `timestamps` | | |

Komisi menempel ke payout lewat `affiliate_commissions.payout_id`. Tidak ada tabel pivot.

## 2. Config dan aritmetika uang

`config/affiliate.php`:

```php
return [
    'enabled'      => (bool) env('AFFILIATE_ENABLED', true),
    'tier1_bps'    => (int) env('AFFILIATE_TIER1_BPS', 2000),
    'tier2_bps'    => (int) env('AFFILIATE_TIER2_BPS', 500),
    'internal_bps' => (int) env('AFFILIATE_INTERNAL_BPS', 1000),
    'hold_days'    => (int) env('AFFILIATE_HOLD_DAYS', 7),
    'cookie_name'  => 'kt_ref',
    'cookie_days'  => 30,
];
```

Tarif dalam basis poin supaya tidak ada pecahan. Semua uang bilangan bulat rupiah, pembulatan ke bawah:

```php
public static function split(int $amount): array
{
    $tier1 = intdiv($amount * config('affiliate.tier1_bps'), 10_000);
    $gross = $amount - $tier1;

    return [
        ['role' => 'tier1',    'base_amount' => $amount, 'rate_bps' => (int) config('affiliate.tier1_bps'),    'amount' => $tier1],
        ['role' => 'tier2',    'base_amount' => $gross,  'rate_bps' => (int) config('affiliate.tier2_bps'),    'amount' => intdiv($gross * config('affiliate.tier2_bps'), 10_000)],
        ['role' => 'internal', 'base_amount' => $gross,  'rate_bps' => (int) config('affiliate.internal_bps'), 'amount' => intdiv($gross * config('affiliate.internal_bps'), 10_000)],
    ];
}
```

**Yang dibagi adalah `payment.amount`, bukan `news_package.price` saat callback datang.** Harga di baris payment sudah dikunci saat checkout, jadi kenaikan harga di tengah umur invoice tidak mengubah pembagian invoice itu.

## 3. Atribusi referral

**Langkah 1 — middleware `CaptureReferralCode`** (ditambahkan ke grup `web` di `bootstrap/app.php`):

```php
$code = strtoupper((string) $request->query('ref'));
if ($code !== '' && preg_match('/^[A-Z0-9]{3,32}$/', $code) && ! $request->cookie(config('affiliate.cookie_name'))) {
    Cookie::queue(config('affiliate.cookie_name'), $code, config('affiliate.cookie_days') * 1440);
}
```

- **Sentuhan pertama yang menang**: cookie yang sudah ada tidak ditimpa.
- Tidak ada tulisan ke database saat orang mengklik link. Belum ada pencatatan klik; tambahkan kalau nanti diminta.
- Cookie terenkripsi Laravel dan hanya dibaca di server.

**Langkah 2 — `Affiliate::resolveByCode(?string $code): ?self`**: `where('code', strtoupper($code))->where('status', 'active')->first()`. Kode tidak dikenal dan afiliator `suspended` sama-sama menghasilkan `null`.

**Langkah 3 — halaman daftar.** `RegisteredUserController@create` membaca `?ref=` lalu cookie (query lebih dulu, karena cookie yang baru di-queue belum terbaca pada request yang sama), lalu mengirim prop:

```php
'referral' => ($aff = Affiliate::resolveByCode($code)) ? ['code' => $aff->code, 'name' => $aff->name] : null,
```

`Register.jsx` menampilkan `<Notice>` di langkah 2: "Anda mendaftar atas ajakan {name}.", dan menyimpan kodenya di field tersembunyi `ref`. Di bawahnya tetap ada satu field opsional **"Kode referral (jika ada)"** memakai komponen `Field` dari `GuestLayout` — ini penting karena tokoh seperti dosen akan menyebarkan kode secara lisan, bukan selalu lewat link. Isian manual menang atas cookie dan disimpan dengan `source = manual`.

**Langkah 4 — `RegisteredUserController@store`.** Validasi tambahan `'ref' => 'nullable|string|max:32'`. Pembuatan user dan baris referral dibungkus satu `DB::transaction`:

| Kasus | Perilaku |
|---|---|
| Tanpa kode | User dibuat, tanpa baris referral |
| Kode tidak dikenal | **Pendaftaran tetap berhasil**, tanpa baris referral, tanpa pesan error |
| Afiliator bukan `active` | Sama seperti kode tidak dikenal |
| Email pendaftar sama dengan email afiliator | Tanpa baris referral (self-referral) |
| Kode valid | Baris `affiliate_referrals` dibuat di transaksi yang sama |

Pendaftaran tidak pernah digagalkan karena urusan referral. Kehilangan satu komisi jauh lebih murah daripada kehilangan satu member.

## 4. Mesin komisi

`app/Services/AffiliateCommissionService.php`:

```php
public static function split(int $amount): array;        // murni, tanpa DB
public function accrue(Payments $payment): int;          // jumlah baris; 0 bila tidak memenuhi syarat
public function reverse(Payments $payment, string $reason): int;
```

**Penempatan:** satu baris di dalam `DB::transaction` pada [TripayCallbackController.php](../app/Http/Controllers/TripayCallbackController.php), setelah `$payment->update([...])` dan **sebelum** blok mutasi user:

```php
app(AffiliateCommissionService::class)->accrue($payment);
```

Diletakkan sebelum mutasi user supaya deteksi member baru tidak terganggu oleh `status = 1` yang baru saja ditulis callback.

**Alur `accrue()`:**

1. `config('affiliate.enabled')` false → berhenti.
2. Ambil `affiliate_referrals` milik `payment.user_id`. Tidak ada → berhenti, **tanpa baris apa pun, termasuk pos internal**. (Tanpa afiliator tidak ada potongan 20%, jadi Rp 48.000 utuh ke kantor.)
3. Afiliator bukan `active` → berhenti.
4. **Deteksi member baru**, dua syarat dan keduanya wajib:
   ```php
   (int) $payment->newsPackage?->level === 1
       && ! Payments::where('user_id', $payment->user_id)
            ->where('status', 'paid')->whereKeyNot($payment->id)->exists();
   ```
   Syarat `level` saja tidak cukup: member lama yang sudah lewat masa aktif bisa memilih paket level 1 lagi dan akan menghasilkan komisi kedua. Kolom snapshot di `payments` juga ditolak, karena tabel itu sudah mengalami drift skema dan flag yang ditulis saat checkout bisa basi bila invoice lama dibayar belakangan.
5. Hitung `split((int) $payment->amount)` dan tentukan penerima:
   - `tier1` → afiliator perekrut, `status = accrued`
   - `tier2` → `upline_id` perekrut. Tidak ada upline → `affiliate_id = null`, `status = unassigned`
   - `internal` → `affiliate_id = null`, `status = accrued`
   - semua baris: `source_affiliate_id` = perekrut, `available_at = now() + hold_days`
6. Simpan sekaligus dengan `DB::table('affiliate_commissions')->insertOrIgnore($rows)`. Dengan unique `(payment_id, role)`, callback ganda menjadi no-op diam-diam, bukan exception yang membuat callback 500 dan membuat Tripay mengulang terus.

Pembayaran kedua dan seterusnya dari user yang sama tidak pernah menghasilkan komisi, karena syarat nomor 4 gagal.

**Model baru** (`Affiliate`, `AffiliateReferral`, `AffiliateCommission`, `AffiliatePayout`) mengikuti pola `MerchandiseShipment`: `$fillable`, cast datetime, `const STATUSES` + `getStatusLabelAttribute()`, dan `scopeOwnedBy`. Tambahkan juga relasi `affiliate()` di `User` dan `commissions()` di `Payments`.

## 5. Halaman afiliator

Masalah: afiliator belum tentu member, sedangkan autentikasi berjalan di tabel `wartawan`.

**Dipilih: afiliator login memakai akun `wartawan` biasa.** Admin membuat/menautkan akun lewat CMS (`affiliates.user_id`). Akun afiliator non-member tetap `status = 0`, tanpa kuota dan tanpa `dateexp` — murni identitas login. Halaman afiliasi ditempatkan di grup `Route::middleware('auth')` **tanpa** `active`, persis seperti `/payments` yang memang sengaja bisa diakses user non-aktif.

Ditolak: guard terpisah dengan login sendiri (orang yang juga member jadi punya dua akun), dan halaman publik bertoken tanpa login (data rekening dan pencairan terlalu sensitif).

```php
// routes/web.php, di dalam grup Route::middleware('auth')
Route::get('/afiliasi', [AffiliateController::class, 'index'])
    ->middleware('affiliate')->name('afiliasi.index');
```

```php
// app/Http/Middleware/EnsureUserIsAffiliate.php, alias 'affiliate'
abort_unless($request->user()?->affiliate?->status === 'active', 403);
```

**Props** dari `AffiliateController@index` (pola DTO manual seperti controller lain):

- `affiliate`: `name`, `code`, `referral_url` (`url('/?ref='.$code)`)
- `summary`: jumlah member direkrut, komisi tertahan, siap cair, sudah dibayar
- `commissions`: paginator (`paginate(15)`, karena `PaginationDaisy` butuh `last_page`/`links`) berisi tanggal, nama member, label, nominal, status

Query: `AffiliateCommission::where('affiliate_id', $me->id)->whereIn('role', ['tier1','tier2'])->latest()->paginate(15)`.

**Pos internal tidak bisa bocor secara struktural**, bukan sekadar disembunyikan: baris `internal` selalu `affiliate_id = null`, sehingga filter `affiliate_id` tidak mungkin mengembalikannya. Filter `whereIn('role', ...)` hanya pengaman tambahan. `base_amount` dan `rate_bps` tidak pernah dikirim ke browser, dan label memakai kata "Komisi langsung" serta "Komisi jaringan", bukan persentase — menampilkan "5%" di sebelah Rp 1.920 justru memancing pertanyaan yang jawabannya adalah pos internal 10%.

**UI** `resources/js/Pages/Afiliasi/Index.jsx` menyalin kerangka `Pages/Payments/Index.jsx`: `space-y-6`, `Head`, `StatCard`/`StatusBadge`/`STATUS_META` lokal, `Card`, baris `divide-y`, `PaginationDaisy`, `formatRupiah`/`formatDate`. Ditambah satu baris link referral dengan tombol salin.

**Sidebar** [AuthenticatedLayout.jsx](../resources/js/Layouts/AuthenticatedLayout.jsx): entri "Afiliasi" baru yang hanya muncul bila `is_affiliate` (shared prop lazy di `HandleInertiaRequests`). Sekalian sembunyikan menu khusus member saat `user.status !== 1`, supaya afiliator non-member tidak melihat lima menu yang semuanya memantul ke `/checkout`.

## 6. Rencana test

**Hambatan yang harus dibereskan lebih dulu.** Test DB hanya berisi 8 migration; `wartawan`, `news_package`, dan `items_lainnya` tidak ada di sana, `UserFactory` masih bawaan Laravel (`name`, `remember_token`) sehingga tidak bisa insert ke `wartawan`, dan tabel `payments` di test kekurangan kolom hasil drift. Jalankan `php artisan test` dulu untuk melihat kondisi awal — jangan berasumsi baseline-nya hijau.

**Fase 0:** trait `tests/Concerns/CreatesLegacySchema.php` yang membuat tabel legacy minimal (`wartawan`, `news_package`, `items_lainnya`, `kategori_kt`) dan menambahkan kolom drift ke `payments`, dipanggil dari `setUp()` hanya oleh test yang membutuhkan. Dibuat sebagai trait, bukan migration, supaya tidak pernah mencoba membuat tabel legacy di produksi. Tambah juga `UserFactory` versi `wartawan` dan `AffiliateFactory`.

**Unit (tanpa DB):**
1. `split(48000)` tepat 9.600 / 1.920 / 3.840 dengan base 48.000 / 38.400 / 38.400.
2. `sum(amount) + 32.640 === 48.000`.
3. Harga ganjil (mis. 47.777): semua hasil `int`, `sum <= price`, sisa tidak dibagi-bagi.

**Atribusi:**
4. `GET /?ref=ABC` memasang cookie 30 hari.
5. Cookie lama tidak ditimpa `?ref` yang berbeda.
6. Daftar dengan kode valid → satu baris `affiliate_referrals` dengan `affiliate_id` dan snapshot `code` yang benar.
7. Kode tidak dikenal → pendaftaran berhasil, nol baris referral.
8. Afiliator `suspended` → nol baris referral, pendaftaran tetap berhasil.
9. Self-referral (email sama) → nol baris referral.

**Mesin komisi:**
10. Callback lunas, paket level 1, ada perekrut **dan** upline → tepat 3 baris dengan nominal benar, dan `sum(amount) + 32.640 == payment.amount`.
11. Perekrut tanpa upline → baris tier 2 `unassigned`, `affiliate_id` null, `source_affiliate_id` terisi.
12. Member direkrut tapi beli paket level 2 → nol baris.
13. Member baru tanpa perekrut → nol baris, termasuk tidak ada baris internal.
14. Callback dikirim dua kali → tetap 3 baris, dua-duanya HTTP 200.
15. Pembayaran lunas kedua user yang sama di paket level 1 → tidak ada baris baru.
16. Pembagian memakai `payment.amount`, bukan harga paket terkini (ubah harga paket di antara checkout dan callback).
17. `available_at` = `paid_at` + 7 hari.

**Halaman:**
18. User bukan afiliator → 403 di `/afiliasi`.
19. Afiliator `active` dengan user `status = 0` → 200 (membuktikan halaman di luar middleware `active`).
20. Props tidak pernah memuat baris `role = internal`, `base_amount`, atau `rate_bps`.

## 7. Risiko dan celah terbuka

1. **Refund setelah komisi tercatat.** Callback keluar lebih awal pada pembayaran yang sudah `paid`, jadi callback `refund` tidak membalik apa pun. Ini perilaku lama dan **sengaja tidak diubah** di pekerjaan ini, karena early return itulah pengaman idempotensi untuk merchandise dan email juga. Penanganan: admin menandai komisi `reversed` di CMS. Method `reverse()` sudah disediakan supaya nanti bisa dipakai perintah artisan.
2. **Afiliator ditangguhkan setelah komisi tercatat.** Asumsi: penangguhan menghentikan atribusi baru, tidak membatalkan komisi lama. Pembatalan massal adalah keputusan admin di CMS. Konfirmasikan ke pemilik produk.
3. **Harga berubah di tengah jalan.** Aman: yang dibagi `payment.amount`, dan `base_amount`/`rate_bps` disimpan per baris.
4. **Kecurangan afiliator.** Penolakan self-referral hanya mencocokkan email; afiliator yang memakai email kedua tidak terdeteksi di kode. Masa tahan 7 hari memberi jeda, deteksi polanya ada di CMS.
5. **Tier 2 tertahan menumpuk.** Tidak ada mekanisme kedaluwarsa. CMS wajib punya laporan `status = unassigned`, kalau tidak uang itu tidak terlihat siapa pun.
6. **Zona waktu.** Aplikasi memakai `Asia/Jakarta` dan MySQL menyimpan datetime polos. Kalau CMS berjalan di UTC, setiap batas bulan bergeser 7 jam. Ini tertulis juga di dokumen CMS.
7. **Cache halaman publik.** Middleware memasang cookie per request. Kalau nanti `/` dipasang cache penuh atau CDN, atribusi akan hilang.
8. **Belum ada scheduler.** Transisi "sudah lewat masa tahan" dievaluasi CMS lewat `available_at <= now()` saat menyusun batch.
9. **Pajak.** Rancangan ini belum memuat pemotongan PPh maupun NPWP. Konfirmasi ke bagian keuangan sebelum pencairan pertama.

## 8. Urutan pengerjaan

| Tahap | Isi | Membuka jalan untuk |
|---|---|---|
| 0 | Harga paket member baru diubah ke Rp 48.000 (data, bukan kode). Trait skema test, `UserFactory`, `AffiliateFactory` | semua pengujian |
| 1 | 4 migration + 4 model + `config/affiliate.php` + dokumen kontrak. Tanpa perubahan perilaku | **tim CMS bisa langsung mulai** |
| 2 | Middleware `CaptureReferralCode`, `resolveByCode`, perubahan pendaftaran, `Register.jsx`. Test 4–9 | atribusi mulai terkumpul sebelum mesin komisi jadi |
| 3 | `AffiliateCommissionService` + satu baris di callback. Test 1–3, 10–17 | uang |
| 4 | `EnsureUserIsAffiliate`, `AffiliateController`, halaman, sidebar. Test 18–20 | afiliator melihat sendiri |
| lanjutan | perintah `affiliate:reverse`, laporan tertahan, analitik klik, tarif per afiliator, pajak | saat diminta |

Tahap 2 sengaja mendahului tahap 3: referral yang tercatat lebih dulu masih bisa dihitung mundur dari tabel `payments` kalau tahap 3 molor, sedangkan urutan sebaliknya menghasilkan komisi yang tidak punya penerima.

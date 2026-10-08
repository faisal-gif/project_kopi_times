# ADR 0001: Program afiliasi 2 tingkat

- **Status:** Proposed
- **Tanggal:** 2026-10-08
- **Berlaku untuk:** `kopi.times.co.id` (repo ini), lalu disalin ke `ajp.times.co.id`

## Konteks

Manajemen menaikkan harga membership penulis baru menjadi **Rp 48.000** dan meminta program afiliasi 2 tingkat untuk mengejar akuisisi member baru. Seluruh karyawan TIMES Indonesia diwajibkan menjadi afiliator, ditambah tokoh eksternal dengan basis massa (dosen, ketua organisasi profesi). Harga perpanjangan tidak berubah dan tidak menghasilkan komisi.

Pembagian per pembayaran member baru yang berafiliasi:

| Pos | Dasar | Tarif | Nominal |
|---|---|---|---|
| Tier 1 — perekrut langsung | 48.000 | 20% | 9.600 |
| Tier 2 — upline perekrut | 38.400 | 5% | 1.920 |
| Internal KITA AI / tim IT (tidak ditampilkan ke publik) | 38.400 | 10% | 3.840 |
| Net kantor | — | sisa | 32.640 |

Keadaan sistem saat keputusan ini dibuat:

- Aplikasi ini tidak memiliki UI admin, role, gate, maupun policy. Administrasi berjalan di **CMS terpisah yang berbagi database** `timesindo_ajp`. Pola kerjanya sudah tertulis di `INSTRUKSI_MANAGE_PUBLIC_EVENT.md`: repo ini pemilik migration, CMS pemilik layar admin.
- Seluruh pembayaran menjadi lunas di satu tempat, yaitu blok `paid` di dalam `DB::transaction` pada `app/Http/Controllers/TripayCallbackController.php`. Blok itu sudah idempoten dan mengunci baris `payments` serta `wartawan`.
- Tabel user (`wartawan`) dan paket (`news_package`) adalah tabel legacy tanpa migration di repo ini.
- Tidak ada fitur referral, komisi, atau saldo sama sekali (greenfield).

## Keputusan

### 1. Komisi dicatat sebagai ledger append-only, bukan kolom saldo

Tabel `affiliate_commissions` menyimpan satu baris per pos per pembayaran. Saldo afiliator selalu dihitung dengan agregasi, tidak pernah disimpan sebagai angka yang bisa di-update.

Alasan: uang harus bisa ditelusuri per transaksi, dan kolom saldo yang di-update rawan balapan serta mustahil direkonsiliasi saat terjadi sengketa.

### 2. Pencatatan komisi di dalam transaksi callback Tripay

Komisi dibuat di blok `paid` yang sudah memegang lock baris payment dan user, dengan unique constraint `(payment_id, role)` sebagai pengaman terakhir.

Alasan: callback Tripay bisa datang berulang. Menumpang pada transaksi dan lock yang sudah ada memberi atomisitas dan idempotensi tanpa mekanisme baru. Pola yang sama sudah dipakai untuk pembuatan `merchandise_shipments`.

### 3. Afiliator adalah entitas sendiri, bukan flag pada user

Tabel `affiliates` berdiri sendiri, dengan `user_id` opsional yang menunjuk ke `wartawan`.

Alasan: afiliator tidak wajib menjadi member berbayar, dan `wartawan` adalah tabel legacy yang tidak boleh diubah dari repo ini.

### 4. Atribusi referral disimpan di tabel terpisah

Tabel `affiliate_referrals` mencatat siapa merekrut member mana, kode yang dipakai, dan kapan.

Alasan: menambah kolom `referred_by` ke `wartawan` berarti mengubah tabel milik CMS. Tabel terpisah juga menyimpan jejak audit yang tidak muat di satu kolom.

### 5. Tarif ada di config, nilainya di-snapshot per baris

`config/affiliate.php` memegang tarif berjalan dalam basis poin. Setiap baris komisi menyimpan `base_amount` dan `rate_bps` saat kejadian.

Alasan: harga dan tarif akan berubah. Tanpa snapshot, laporan bulan lalu ikut berubah setiap kali tarif diubah.

### 6. Seluruh UI admin dibangun di CMS, migration tetap milik repo ini

Repo ini membuat tabel, mesin komisi, dan halaman afiliator. CMS membangun CRUD afiliator, persetujuan komisi, batch pencairan, dan laporan.

Alasan: meneruskan pembagian kerja yang sudah berjalan. Membangun admin di aplikasi publik berarti memperkenalkan sistem role yang saat ini tidak ada sama sekali.

### 7. AJP memakai modul yang sama dengan deploy dan database terpisah

Tidak ada layanan afiliasi terpusat dan tidak ada saldo lintas situs.

Alasan: kebutuhan yang disampaikan adalah "skema yang sama", bukan "saldo yang sama". Layanan terpusat menambah autentikasi antar-layanan, sinkronisasi, dan satu titik gagal baru, tanpa manfaat yang diminta hari ini.

### 8. Komisi hanya untuk pembayaran member baru yang berafiliasi

Penentuannya memakai dua syarat sekaligus: paket `level = 1` **dan** user belum punya pembayaran lunas lain. Member baru tanpa referral tidak menghasilkan baris komisi apa pun, termasuk pos internal.

### 9. Tier 2 tanpa upline tetap dicatat sebagai pos tertahan

Baris tier 2 tetap dibuat dengan status `unassigned` dan tanpa penerima, bukan dihapus dan bukan dialihkan ke afiliator.

Alasan: angkanya tetap terlihat di laporan, dan manajemen bisa memutuskan peruntukannya belakangan tanpa menghitung ulang data lama.

### 10. Komisi ditahan 7 hari, pencairan manual

Komisi baru bisa masuk batch pencairan setelah `available_at` (lunas + 7 hari) terlewati. Pencairan dilakukan admin lewat transfer manual, lalu ditandai lunas dengan bukti.

Alasan: memberi jeda untuk mendeteksi pendaftaran fiktif, dan menghindari integrasi disbursement beserta saldo mengendap pada tahap awal.

## Alternatif yang ditolak

| Alternatif | Alasan ditolak |
|---|---|
| Kolom saldo di tabel afiliator | Tidak bisa diaudit, rawan balapan, sulit direkonsiliasi saat sengketa |
| Kolom `referred_by` di `wartawan` | Mengubah tabel legacy milik CMS, dan tidak menyimpan jejak audit |
| Menghitung komisi lewat job terjadwal terpisah | Aplikasi ini belum punya scheduler; pemisahan dari transaksi pembayaran membuka celah hitung ganda dan selisih waktu |
| Layanan afiliasi terpusat untuk dua situs | Biaya besar untuk kebutuhan yang belum diminta |
| Semua member otomatis jadi afiliator | Sulit dikontrol, memperbesar peluang pendaftaran fiktif, dan bertentangan dengan arahan bahwa afiliator ditunjuk |
| Guard autentikasi terpisah untuk afiliator | Orang yang sekaligus member jadi punya dua login; biaya pemeliharaan tidak sepadan |
| Halaman afiliator publik bertoken tanpa login | Data pencairan dan rekening terlalu sensitif untuk dibuka dengan tautan |

## Konsekuensi

**Positif**

- Angka komisi bisa ditelusuri sampai ke nomor pembayaran dan tidak berubah saat tarif atau harga diubah.
- Callback ganda, yang nyata terjadi pada Tripay, tidak bisa menggandakan komisi.
- CMS bisa dikerjakan paralel oleh tim lain hanya dengan kontrak database.
- Modul bisa disalin ke AJP tanpa mengubah logika.

**Negatif dan utang yang disadari**

- Pencairan tetap pekerjaan manual; biaya operasionalnya naik seiring jumlah afiliator.
- Refund setelah komisi tercatat harus dibatalkan manual lewat CMS, karena callback hari ini tidak memproses refund pada pembayaran yang sudah lunas.
- Tidak ada lapisan API yang memaksa CMS menaati kontrak database; kepatuhannya bergantung pada dokumen `INSTRUKSI_AFILIASI_CMS.md`.
- Transisi status `held` → `payable` dijalankan CMS saat menyusun batch, bukan oleh job harian, karena scheduler belum ada.
- Fitur ini menambah logika uang kedua di atas codebase yang skema intinya belum ada di migration dan cakupan test-nya nyaris nol. Lihat audit tech debt: pekerjaan migration dan test sebaiknya didahulukan atau dikerjakan bersamaan.

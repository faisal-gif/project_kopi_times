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

Pembayaran member baru **tanpa** perekrut hanya menerbitkan pos internal, dengan dasar harga utuh (lihat keputusan 8a):

| Pos | Dasar | Tarif | Nominal |
|---|---|---|---|
| Internal KITA AI / tim IT | 48.000 | 10% | 4.800 |
| Net kantor | — | sisa | 43.200 |

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

> **DIGANTI 2026-10-12.** Keputusan ini dibuat dengan asumsi AJP punya database sendiri. Ternyata **AJP dan Kopi TIMES memakai codebase dan database yang sama** (`timesindo_ajp`), hanya beda projek dan branding; `wartawan.type` adalah pembeda produknya. Lihat keputusan 7a.

Tidak ada layanan afiliasi terpusat dan tidak ada saldo lintas situs.

Alasan: kebutuhan yang disampaikan adalah "skema yang sama", bukan "saldo yang sama". Layanan terpusat menambah autentikasi antar-layanan, sinkronisasi, dan satu titik gagal baru, tanpa manfaat yang diminta hari ini.

### 7a. AJP ikut memakai tabel afiliasi yang sama (pengganti keputusan 7)

> **DIKOREKSI 2026-10-13.** Kalimat "satu afiliator dan satu saldo untuk semua situs" tidak lagi berlaku; lihat keputusan 7b. Tabelnya tetap satu, tapi datanya dipisah per situs.

Satu tabel afiliator, satu kode referral, satu ledger, dan satu saldo untuk semua situs di database bersama. AJP tidak membuat migration apa pun dan tidak membangun portal afiliator sendiri; cukup mengambil kode yang sama dan mengisi `AFFILIATE_SITE` serta tarif di `.env`. Arahannya ada di [INSTRUKSI_AFILIASI_AJP.md](../../INSTRUKSI_AFILIASI_AJP.md).

Laporan per situs tetap bisa dipecah lewat `news_package.type` (dijoin dari `payments.package_id`), jadi ledger tidak perlu kolom situs. Atribusi lintas subdomain tersedia sebagai pilihan lewat `AFFILIATE_COOKIE_DOMAIN`, mati secara default.

Alasan: database sudah bersama, jadi memisahkan ledger justru menciptakan dua kebenaran untuk satu afiliator, dan pencairan harus dilakukan dua kali untuk orang yang sama.

### 7b. Afiliator terikat satu situs lewat kolom `type`

Keempat tabel afiliasi mendapat kolom `type` (1 = AJP, 4 = Kopi TIMES), diisi dari `config('affiliate.site_type')` milik deployment tempat baris itu dibuat. Afiliator hanya memperoleh komisi dari pendaftar di situs yang sama, dan pencairan disusun terpisah per situs.

Alasan: tiap situs punya unit bisnis, kas, dan pembukuannya sendiri. Satu saldo gabungan membuat komisi AJP dibayar dari kas Kopi TIMES, dan laporan per unit jadi perlu pembongkaran ulang setiap periode.

Konsekuensi yang disadari: orang yang ingin aktif di dua situs harus punya dua baris afiliator dengan dua kode berbeda, dan menerima dua kali transfer. Referral lintas situs tetap dicatat tetapi tidak berkomisi — ini terlihat sebagai rekrutan tanpa komisi, jadi perlu dijelaskan ke afiliator.

### 8. Komisi hanya untuk pembayaran member baru yang berafiliasi

> **DIKOREKSI 2026-10-15.** Kalimat terakhir tidak lagi berlaku untuk pos internal; lihat keputusan 8a. Syarat "member baru" tetap berlaku untuk semua pos.

Penentuannya memakai dua syarat sekaligus: paket `level = 1` **dan** user belum punya pembayaran lunas lain. Member baru tanpa referral tidak menghasilkan baris komisi apa pun, termasuk pos internal.

### 8a. Pos internal terbit untuk setiap member baru, ada perekrut atau tidak (pengganti bagian keputusan 8)

Pos `internal` (KITA AI / tim IT) dicatat untuk **setiap** pendaftaran member baru. Tanpa perekrut yang berhak, hanya pos itu yang terbit: tidak ada tier1 dan tidak ada tier2.

Dasarnya harga utuh, karena tidak ada potongan tier1 yang benar-benar terjadi: **48.000 × 10% = 4.800**, sisa kantor 43.200. Angkanya memang lebih besar daripada 3.840 pada penjualan berafiliasi — di sana 10% dihitung dari 38.400 setelah komisi perekrut diambil. Tarifnya satu, dasarnya yang berbeda, dan `base_amount` tiap baris selalu angka yang benar-benar terjadi pada penjualan itu.

Alasan: tim IT membangun dan merawat seluruh jalur pembayaran, dan beban kerjanya tidak berkurang ketika pembeli datang tanpa kode referral. Mengikat bagian mereka pada keberadaan perekrut membuat penghasilan tim bergantung pada hal yang di luar kendali mereka.

"Perekrut yang berhak" berarti satu hal yang sama untuk ketiga kasus gagal — tidak ada referral, afiliatornya tidak aktif, atau afiliatornya milik situs lain. Ketiganya diperlakukan identik: kantor menyimpan harga utuh, jadi pos internal tetap terbit. Tanpa penyamaan ini, afiliator yang ditangguhkan akan ikut menghapus bagian tim IT.

Konsekuensi yang disadari: `affiliate_commissions` sekarang punya baris untuk pembayaran yang sama sekali tidak berkaitan dengan afiliator mana pun, dan baris itu ber-`source_affiliate_id` NULL. Laporan rekap CMS sudah menghitungnya dengan benar karena pos internal dijumlahkan per `role`, bukan per afiliator.

### 9. Tier 2 tanpa upline tetap dicatat sebagai pos tertahan

Baris tier 2 tetap dibuat dengan status `unassigned` dan tanpa penerima, bukan dihapus dan bukan dialihkan ke afiliator.

Alasan: angkanya tetap terlihat di laporan, dan manajemen bisa memutuskan peruntukannya belakangan tanpa menghitung ulang data lama.

### 9a. Upline pengajuan mandiri diturunkan dari perekrut membernya

Saat member mengajukan diri jadi afiliator, `upline_id` diisi otomatis dengan afiliator yang dulu merekrut orang itu jadi member — dibaca dari `affiliate_referrals`, bukan dari input pemohon. Dilewati bila tidak ada baris referral, perekrutnya bukan `active`, atau perekrutnya milik situs lain.

Alasan: tanpa ini jaringan tetap rata dan **setiap** komisi tingkat 2 lahir berstatus `unassigned` — uang tanpa pemilik yang menumpuk sampai ada yang memutuskan. Padahal jawabannya sudah ada di data: orang yang membawa dia masuk. Menetapkannya manual satu per satu adalah pekerjaan yang jawabannya sudah diketahui sistem.

Pemohon tidak boleh memilih uplinenya sendiri; itu akan membuat rantai bisa diatur demi komisi. Admin tetap berwenang menimpa, dan nilai otomatis hanya jadi pilihan awal di antrean pengajuan.

Lingkaran tidak diperiksa di jalur ini karena tidak mungkin terbentuk: baris afiliator yang baru dibuat belum ditunjuk siapa pun sebagai upline, dan relasi "direkrut oleh" mengikuti urutan pendaftaran sehingga tidak bisa menutup. Perubahan upline belakangan tetap dijaga pemeriksaan lingkaran di CMS.

Konsekuensi yang disadari: afiliator yang sudah ada sebelum program referral berjalan — termasuk karyawan yang mendaftar jauh sebelumnya — tidak punya baris referral, jadi uplinenya tetap harus ditetapkan manual.

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
- Tidak ada lapisan API yang memaksa CMS menaati kontrak database; kepatuhannya bergantung pada dokumen `INSTRUKSI_AFILIASI_CMS_BARU.md`.
- Transisi status `held` → `payable` dijalankan CMS saat menyusun batch, bukan oleh job harian, karena scheduler belum ada.
- Fitur ini menambah logika uang kedua di atas codebase yang skema intinya belum ada di migration dan cakupan test-nya nyaris nol. Lihat audit tech debt: pekerjaan migration dan test sebaiknya didahulukan atau dikerjakan bersamaan.

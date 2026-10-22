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
| Internal staff IT (tidak ditampilkan ke publik) | 38.400 | 10% + Rp 1.000 | 4.840 |
| Net kantor | — | sisa | 31.640 |

Pembayaran member baru **tanpa** perekrut hanya menerbitkan pos internal, dengan dasar harga utuh (lihat keputusan 8a):

| Pos | Dasar | Tarif | Nominal |
|---|---|---|---|
| Internal staff IT | 48.000 | 10% + Rp 1.000 | 5.800 |
| Net kantor | — | sisa | 42.200 |

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

### 4a. Atribusi dipegang sentuhan terakhir, bukan sentuhan pertama

`CaptureReferralCode` menimpa cookie referral setiap kali pengunjung membuka `?ref=` yang baru, dan masa berlaku cookie dihitung ulang dari klik terakhir itu.

Semula cookie yang sudah ada sengaja tidak ditimpa, supaya afiliator yang pertama memperkenalkan produk tidak kehilangan haknya. Aturan itu dibatalkan 22 Oktober 2026 atas permintaan pemilik produk: yang dihargai adalah afiliator yang ajakannya benar-benar membuat orang mendaftar, dan itu hampir selalu tautan terakhir yang dibuka.

Konsekuensi yang disadari dan diterima: afiliator bisa kehilangan atribusi yang tadinya sudah "miliknya" hanya karena calon pendaftar membuka tautan orang lain belakangan. Risiko sebaliknya juga terbuka — menyebarkan tautan tepat sebelum orang mendaftar jadi strategi yang menguntungkan. Tidak ada pencatatan klik, jadi perpindahan semacam itu tidak meninggalkan jejak yang bisa diperiksa; kalau nanti perlu disengketakan, pencatatan klik harus ditambahkan lebih dulu.

Yang tidak berubah: begitu orang mendaftar, baris `affiliate_referrals` terkunci dan tidak bisa dipindahkan. Kode yang diketik manual di formulir pendaftaran tetap mengalahkan cookie.

Sebagai pengimbang, pendaftar diberi jalan keluar: halaman pendaftaran menampilkan tombol "Daftar tanpa kode ini" yang mengosongkan field `ref`. Karena itu `recordReferral()` kini memperlakukan field `ref` yang terkirim sebagai penentu — termasuk saat kosong — dan hanya jatuh ke cookie bila field itu sama sekali tidak ada. Tanpa aturan ini tombolnya tidak berarti apa-apa, sebab cookie akan tetap mencatatkan komisi.

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

Pos `internal` (staff IT) dicatat untuk **setiap** pendaftaran member baru. Tanpa perekrut yang berhak, hanya pos itu yang terbit: tidak ada tier1 dan tidak ada tier2.

Dasarnya harga utuh, karena tidak ada potongan tier1 yang benar-benar terjadi: **48.000 × 10% = 4.800**, sisa kantor 43.200. Angkanya memang lebih besar daripada 3.840 pada penjualan berafiliasi — di sana 10% dihitung dari 38.400 setelah komisi perekrut diambil. Tarifnya satu, dasarnya yang berbeda, dan `base_amount` tiap baris selalu angka yang benar-benar terjadi pada penjualan itu.

Alasan: tim IT membangun dan merawat seluruh jalur pembayaran, dan beban kerjanya tidak berkurang ketika pembeli datang tanpa kode referral. Mengikat bagian mereka pada keberadaan perekrut membuat penghasilan tim bergantung pada hal yang di luar kendali mereka.

"Perekrut yang berhak" berarti satu hal yang sama untuk ketiga kasus gagal — tidak ada referral, afiliatornya tidak aktif, atau afiliatornya milik situs lain. Ketiganya diperlakukan identik: kantor menyimpan harga utuh, jadi pos internal tetap terbit. Tanpa penyamaan ini, afiliator yang ditangguhkan akan ikut menghapus bagian tim IT.

Konsekuensi yang disadari: `affiliate_commissions` sekarang punya baris untuk pembayaran yang sama sekali tidak berkaitan dengan afiliator mana pun, dan baris itu ber-`source_affiliate_id` NULL. Laporan rekap CMS sudah menghitungnya dengan benar karena pos internal dijumlahkan per `role`, bukan per afiliator.

### 9. Tier 2 tanpa upline tetap dicatat sebagai pos tertahan

> **DIBATALKAN 2026-10-21.** Keputusan ini tidak lagi berlaku; lihat keputusan 9d.

Baris tier 2 tetap dibuat dengan status `unassigned` dan tanpa penerima, bukan dihapus dan bukan dialihkan ke afiliator.

Alasan: angkanya tetap terlihat di laporan, dan manajemen bisa memutuskan peruntukannya belakangan tanpa menghitung ulang data lama.

### 9a. Upline pengajuan mandiri diturunkan dari perekrut membernya

> **DIBATALKAN 2026-10-20, satu hari setelah diterapkan.** Keputusan ini tidak lagi berlaku; lihat keputusan 9b. Kodenya sudah dicabut dari `AffiliateApplicationController::store()` di kedua aplikasi publik.

Saat member mengajukan diri jadi afiliator, `upline_id` diisi otomatis dengan afiliator yang dulu merekrut orang itu jadi member — dibaca dari `affiliate_referrals`, bukan dari input pemohon. Dilewati bila tidak ada baris referral, perekrutnya bukan `active`, atau perekrutnya milik situs lain.

Alasan: tanpa ini jaringan tetap rata dan **setiap** komisi tingkat 2 lahir berstatus `unassigned` — uang tanpa pemilik yang menumpuk sampai ada yang memutuskan. Padahal jawabannya sudah ada di data: orang yang membawa dia masuk. Menetapkannya manual satu per satu adalah pekerjaan yang jawabannya sudah diketahui sistem.

Pemohon tidak boleh memilih uplinenya sendiri; itu akan membuat rantai bisa diatur demi komisi. Admin tetap berwenang menimpa, dan nilai otomatis hanya jadi pilihan awal di antrean pengajuan.

Lingkaran tidak diperiksa di jalur ini karena tidak mungkin terbentuk: baris afiliator yang baru dibuat belum ditunjuk siapa pun sebagai upline, dan relasi "direkrut oleh" mengikuti urutan pendaftaran sehingga tidak bisa menutup. Perubahan upline belakangan tetap dijaga pemeriksaan lingkaran di CMS.

Konsekuensi yang disadari: afiliator yang sudah ada sebelum program referral berjalan — termasuk karyawan yang mendaftar jauh sebelumnya — tidak punya baris referral, jadi uplinenya tetap harus ditetapkan manual.

### 9b. Upline sepenuhnya ditetapkan admin (pengganti keputusan 9a)

> **DIGANTI 2026-10-20, beberapa jam setelah diterapkan.** Lihat keputusan 9c. Dropdown upline di CMS sudah dihapus.

`upline_id` pada pengajuan mandiri **selalu** masuk kosong. Tidak ada pengisian otomatis dari sumber mana pun.

Alasan: upline menentukan siapa menerima komisi tingkat 2 (5%), dan pemilik produk menghendaki penerima uang itu menjadi keputusan manusia, bukan kesimpulan sistem dari data referral. Rantai komisi adalah urusan kebijakan — siapa pantas memperoleh 5% dari jaringan seseorang bisa berbeda dari siapa yang secara teknis membawa orang itu masuk.

Mekanisme komisinya sendiri **tidak berubah** dan memang sudah sesuai yang dikehendaki: akun A yang mengundang B memperoleh 20% dari pendaftaran B; bila B kemudian mengundang C, A memperoleh 5% dari pendaftaran C. Yang berubah hanya cara `upline_id` milik B terisi — kini hanya lewat CMS.

Konsekuensi yang disadari dan diterima: selama upline seorang afiliator kosong, **setiap** komisi tingkat 2 dari jaringannya lahir berstatus `unassigned` — uang tanpa pemilik. Layar Baris Tertahan di CMS karena itu bukan laporan pelengkap, melainkan antrean kerja yang harus dipantau, dan menetapkan upline sedini mungkin adalah tugas admin saat menyetujui pengajuan.

Pembatalan 9a disengaja dan dikunci dengan test: memakai perekrut yang sempurna memenuhi syarat, sehingga menghidupkan kembali pengisian otomatis akan menggagalkan test — penerima uang tidak boleh berubah diam-diam.

### 9c. Admin menentukan siapa BERHAK, sistem menurunkan rantainya (pengganti 9a dan 9b)

Kolom baru `affiliates.tier2_eligible`. Admin mencentang akun mana yang boleh menerima komisi tingkat 2; `upline_id` lalu diturunkan sistem dari afiliator yang mengundang si pemohon jadi member — **tetapi hanya bila akun pengundang itu dicentang.** Dropdown pemilihan upline di CMS dihapus.

Alasan: dua percobaan sebelumnya masing-masing salah di satu sisi. Keputusan 9a mengisi upline untuk semua orang tanpa kendali, sehingga siapa pun yang kebetulan mengundang orang lain langsung memperoleh 5% tanpa persetujuan. Keputusan 9b menyerahkan semuanya ke admin, tetapi admin tidak punya informasi yang dibutuhkan — hanya `affiliate_referrals` yang tahu siapa benar-benar mengundang siapa, dan memilih dari dropdown berarti menebak atau menyalin data itu dengan tangan.

Pembagian yang benar: **kebijakan ke admin, fakta ke sistem.** Siapa yang berhak memperoleh 5% adalah kebijakan. Siapa mengundang siapa adalah fakta yang sudah tercatat.

Yang tidak berubah: mekanisme komisinya. Akun A yang mengundang B memperoleh 20% dari pendaftaran B; bila B kemudian mengundang C, A memperoleh 5% dari pendaftaran C. Komisi 20% dari pendaftar langsung **tidak** bergantung pada penanda ini — penanda hanya mengatur terbentuknya tingkat kedua.

Konsekuensi yang disadari:

- **Tidak berlaku ke belakang.** Penanda dibaca saat pengajuan afiliator dibuat. Mencentang sebuah akun hari ini tidak membentuk rantai dari orang-orang yang sudah jadi afiliator sebelumnya; uplinenya tetap seperti saat itu.
- **Admin tidak lagi bisa menyusun rantai bebas.** Rantai hanya mengikuti data referral. Koreksi satu-satunya adalah menetapkan penerima per baris komisi di layar Baris Tertahan, yang memang sudah ada.
- Enam afiliator yang ada saat keputusan ini dibuat belum punya baris referral sama sekali, jadi rantai pertama baru akan terbentuk dari pengajuan berikutnya.

Dikunci dengan test: `RantaiTier2Test` menelusuri A→B→C ujung ke ujung untuk kedua keadaan penanda (dicentang dan tidak), plus empat test pada `AffiliateApplicationTest` untuk pengundang yang tidak dicentang, ditangguhkan, dan milik situs lain.

### 9d. Tier 2 tanpa upline tidak diterbitkan sama sekali (pengganti keputusan 9)

Bila perekrut tidak punya upline, pos tier 2 **tidak dibuat**. Tidak ada lagi baris `unassigned` yang lahir dari pencatatan komisi.

Alasan: baris tanpa penerima ternyata lebih membingungkan daripada membantu. Di layar ia berdampingan dengan nama perekrut lewat `source_affiliate_id`, sehingga terbaca seolah perekrut menerima dua pos sekaligus — keluhan yang benar-benar muncul dari pemilik produk saat melihat daftar transaksi. Baris itu juga ikut terhitung dalam "komisi keluar", membuat net kantor tampak lebih kecil daripada kenyataan, padahal uangnya tidak berpindah ke mana pun.

Konsekuensi yang disadari dan diterima: **5% itu kini tinggal di kantor tanpa jejak baris apa pun.** Tidak ada laporan yang bisa menjawab "berapa potensi komisi tingkat 2 yang tidak tersalurkan bulan ini", karena angkanya tidak pernah dicatat. Itu persis yang hendak dicegah keputusan 9; manajemen memilih kejelasan layar di atas keterlacakan angka itu.

Status `unassigned` dan layar **Baris Tertahan** di CMS tetap ada — dipakai baris lama yang sudah terlanjur terbit, dan tetap menjadi jalur koreksi manual.

Kalau suatu saat ingin dilacak lagi, hidupkan kembali di `AffiliateCommissionService::accrue()`; tempat itu satu-satunya yang memutuskan hal ini.

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

import LandingLayout from '@/Layouts/LandingLayout';
import { formatRupiah } from '@/Utils/formatter';
import { Head, Link } from '@inertiajs/react';

// Panduan praktis — melengkapi Syarat & Ketentuan, bukan menyalinnya.
// S&K menjawab "apa aturannya", halaman ini "bagaimana melakukannya".
// Pos internal 10% tidak pernah disebut di halaman publik.
const CONTOH_HARGA = 48000;

function Langkah({ nomor, judul, children }) {
    return (
        <section className="relative border-t border-dashed border-ink/25 py-7 pl-12 sm:pl-14">
            <span
                aria-hidden="true"
                className="absolute left-0 top-7 flex h-9 w-9 items-center justify-center rounded-full bg-pen font-print text-sm font-black text-sheet"
            >
                {nomor}
            </span>
            <h2 className="text-2xl font-black tracking-[-0.02em]">{judul}</h2>
            <div className="mt-3 space-y-3 font-type text-[15px] leading-relaxed text-ink/85">{children}</div>
        </section>
    );
}

function Tanya({ judul, children }) {
    return (
        <section className="border-t border-dashed border-ink/25 py-6">
            <h2 className="font-print text-lg font-black tracking-[-0.01em]">{judul}</h2>
            <div className="mt-2 space-y-2 font-type text-[15px] leading-relaxed text-ink/85">{children}</div>
        </section>
    );
}

export default function Panduan({ min_payout, hold_days, cookie_days, tier1_bps, tier2_bps }) {
    // Tarif datang dari config lewat props, bukan diketik di halaman.
    const TIER1_PERSEN = tier1_bps / 100 + '%';
    const TIER2_PERSEN = tier2_bps / 100 + '%';
    const contohTier1 = Math.floor((CONTOH_HARGA * tier1_bps) / 10000);
    const contohTier2 = Math.floor(((CONTOH_HARGA - contohTier1) * tier2_bps) / 10000);

    return (
        <>
            <Head title="Panduan Afiliasi" />
            <LandingLayout>
                <main className="kt-landing bg-paper text-ink font-print">
                    <section className="bg-desk px-4 pt-28 pb-16 md:pt-36 md:pb-20">
                        <div className="mx-auto max-w-4xl rounded-[3px] bg-sheet px-5 py-8 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)] sm:px-10 sm:py-12">
                            <header className="flex items-baseline justify-between gap-4 font-type text-[13px] uppercase tracking-wide text-ink/70">
                                <span>Program afiliasi &middot; Kopi TIMES</span>
                                <span>Panduan</span>
                            </header>
                            <div className="kt-rule mt-3 text-ink/30" />

                            <h1 className="mt-8 text-balance text-4xl font-black leading-[1.02] tracking-[-0.03em] sm:text-5xl">
                                Ajak satu orang menulis,
                                <br />
                                Anda dapat bagiannya.
                            </h1>
                            <p className="mt-4 max-w-[62ch] font-type leading-relaxed text-ink/80">
                                Setiap orang yang mendaftar jadi member Kopi TIMES lewat tautan Anda, lalu menyelesaikan
                                pembayaran pendaftarannya, memberi Anda komisi{' '}
                                <strong className="font-print font-extrabold">{TIER1_PERSEN} dari harga paket</strong>.
                                Halaman ini menjelaskan cara kerjanya dari awal sampai komisinya cair.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href="/afiliasi/daftar"
                                    className="inline-flex items-center rounded-[2px] bg-pen px-6 py-3 font-print text-sm font-black uppercase tracking-wide text-sheet transition hover:bg-desk"
                                >
                                    Ajukan diri jadi afiliator
                                </Link>
                                <Link
                                    href="/syarat-afiliasi"
                                    className="inline-flex items-center rounded-[2px] border-2 border-ink/20 px-6 py-3 font-print text-sm font-black uppercase tracking-wide transition hover:border-ink/50"
                                >
                                    Baca syarat &amp; ketentuan
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="px-4 py-16 md:py-20">
                        <div className="mx-auto max-w-3xl">
                            <Langkah nomor="1" judul="Pastikan keanggotaan Anda aktif">
                                <p>
                                    Program ini hanya untuk member Kopi TIMES yang masa aktifnya sedang berjalan. Kalau
                                    masa aktif Anda sudah habis, perpanjang dulu sebelum mengajukan diri.
                                </p>
                            </Langkah>

                            <Langkah nomor="2" judul="Ajukan diri, lalu tunggu ditinjau">
                                <p>
                                    Isi formulir pengajuan: nama, kontak, dan <strong>nomor rekening</strong> tujuan
                                    pencairan. Rekening diisi sejak awal — tanpa itu komisi Anda tidak bisa dicairkan
                                    nanti.
                                </p>
                                <p>
                                    Pengajuan ditinjau tim kami lebih dulu. Selama masih ditinjau, halaman afiliasi Anda
                                    menampilkan status menunggu dan tautan referral belum berlaku.
                                </p>
                            </Langkah>

                            <Langkah nomor="3" judul="Bagikan tautan referral Anda">
                                <p>
                                    Setelah disetujui, Anda mendapat kode unik dan tautan siap bagikan, bentuknya{' '}
                                    <code className="rounded bg-ink/10 px-1.5 py-0.5 font-type text-[13px]">
                                        ?ref=KODEANDA
                                    </code>
                                    . Salin dari halaman afiliasi Anda, lalu sebarkan di mana pun Anda biasa menulis atau
                                    berbicara.
                                </p>
                                <p>
                                    Kode itu menempel di peramban calon pendaftar selama{' '}
                                    <strong>{cookie_days} hari</strong>. Jadi ia tidak harus mendaftar saat itu juga —
                                    selama masih dalam rentang tersebut, pendaftarannya tetap tercatat sebagai ajakan
                                    Anda.
                                </p>
                                <p>
                                    Kalau ia membuka tautan afiliator lain sesudah tautan Anda,{' '}
                                    <strong>yang terakhir dibuka itulah yang berlaku</strong>, dan hitungan harinya ikut
                                    dimulai ulang dari klik terakhir. Ia juga bisa mengetik kode Anda secara manual di
                                    kolom kode referral saat mendaftar.
                                </p>
                            </Langkah>

                            <Langkah nomor="4" judul="Komisi tercatat saat pembayarannya lunas">
                                <p>
                                    Komisi muncul ketika orang yang Anda ajak menyelesaikan pembayaran{' '}
                                    <strong>pendaftaran member baru</strong>. Perpanjangan masa aktif dan pembelian paket
                                    tambahan tidak menghasilkan komisi.
                                </p>
                                <p>
                                    Contoh pada harga paket {formatRupiah(CONTOH_HARGA)}: komisi langsung Anda{' '}
                                    <strong className="font-print font-extrabold">{formatRupiah(contohTier1)}</strong>.
                                    Karena berupa persentase, nominalnya mengikuti harga yang benar-benar dibayarkan.
                                </p>
                                {tier2_bps > 0 && (
                                    <p>
                                        Sebagian afiliator juga ditunjuk untuk menerima{' '}
                                        <strong>komisi jaringan {TIER2_PERSEN}</strong> dari pendaftar yang dibawa orang
                                        yang dulu mereka ajak — pada contoh di atas {formatRupiah(contohTier2)}.
                                        Penunjukan itu dilakukan tim kami, jadi{' '}
                                        <em>tidak berlaku otomatis untuk setiap afiliator</em>.
                                    </p>
                                )}
                            </Langkah>

                            <Langkah nomor="5" judul="Pencairan">
                                <p>
                                    Komisi ditahan <strong>{hold_days} hari</strong> sejak pembayaran lunas. Masa ini
                                    dipakai untuk memastikan pendaftarannya benar, bukan pembatalan atau pendaftaran
                                    fiktif.
                                </p>
                                <p>
                                    Setelah itu komisi masuk antrean persetujuan, lalu dicairkan lewat transfer manual ke
                                    rekening yang Anda daftarkan. Pencairan dilakukan bila saldo yang siap cair sudah
                                    mencapai <strong>{formatRupiah(min_payout)}</strong>.
                                </p>
                            </Langkah>

                            <h2 className="mt-14 text-3xl font-black tracking-[-0.03em]">
                                Pertanyaan yang sering muncul
                            </h2>
                            <div className="mt-6">
                                <Tanya judul="Teman saya sudah mendaftar, kenapa komisinya belum muncul?">
                                    <p>
                                        Komisi baru tercatat setelah <strong>pembayarannya lunas</strong>, bukan saat
                                        akunnya dibuat. Kalau ia belum menyelesaikan pembayaran, belum ada yang tercatat.
                                    </p>
                                    <p>
                                        Setelah lunas pun angkanya masih dalam masa tahan {hold_days} hari sebelum bisa
                                        dicairkan.
                                    </p>
                                </Tanya>

                                <Tanya judul="Ia mendaftar lewat tautan saya tapi tidak tercatat. Kenapa?">
                                    <p>Biasanya salah satu dari ini:</p>
                                    <ul className="list-disc space-y-1 pl-5">
                                        <li>
                                            ia membuka tautan afiliator lain sesudah tautan Anda — yang terakhir yang
                                            berlaku;
                                        </li>
                                        <li>lewat dari {cookie_days} hari sejak ia membuka tautan Anda;</li>
                                        <li>
                                            ia mendaftar di peramban atau perangkat lain, bukan yang dipakai membuka
                                            tautan;
                                        </li>
                                        <li>riwayat perambannya dibersihkan sebelum ia mendaftar.</li>
                                        <li>ia menekan &quot;Daftar tanpa kode ini&quot; di halaman pendaftaran.</li>
                                    </ul>
                                    <p>
                                        Cara paling aman: minta ia mengetik kode Anda langsung di kolom kode referral saat
                                        mendaftar.
                                    </p>
                                </Tanya>

                                <Tanya judul="Apakah saya dapat komisi kalau ia memperpanjang masa aktif?">
                                    <p>
                                        Tidak. Hanya <strong>pendaftaran member baru</strong> yang berkomisi. Perpanjangan
                                        dan paket tambahan tidak.
                                    </p>
                                </Tanya>

                                <Tanya judul="Boleh saya mendaftar lewat tautan saya sendiri?">
                                    <p>
                                        Tidak. Pendaftaran dengan tautan sendiri tidak akan tercatat, dan upaya membuat
                                        pendaftaran fiktif berakibat komisi dibatalkan serta akun afiliator ditangguhkan.
                                    </p>
                                </Tanya>

                                <Tanya judul="Berapa lama komisinya sampai ke rekening?">
                                    <p>
                                        Pencairan diproses manual oleh tim kami setelah masa tahan lewat dan saldo siap
                                        cair mencapai {formatRupiah(min_payout)}. Statusnya bisa Anda pantau kapan saja di
                                        halaman afiliasi Anda.
                                    </p>
                                </Tanya>
                            </div>

                            <div className="border-t border-dashed border-ink/25 pt-7">
                                <p className="font-type text-[15px] leading-relaxed text-ink/85">
                                    Panduan ini menjelaskan cara kerjanya secara ringkas. Yang mengikat secara aturan
                                    adalah{' '}
                                    <Link
                                        href="/syarat-afiliasi"
                                        className="font-print font-extrabold text-pen underline decoration-2 underline-offset-4 hover:text-desk"
                                    >
                                        Syarat &amp; Ketentuan Afiliasi
                                    </Link>
                                    . Bila keduanya tampak berbeda, yang berlaku adalah syarat &amp; ketentuan.
                                </p>
                                <p className="mt-4 font-type text-[15px] text-ink/80">
                                    Masih ada pertanyaan:{' '}
                                    <a
                                        href="mailto:redaksi@timesindonesia.co.id"
                                        className="font-print font-extrabold text-pen underline decoration-2 underline-offset-4 hover:text-desk"
                                    >
                                        redaksi@timesindonesia.co.id
                                    </a>
                                </p>

                                <Link
                                    href="/afiliasi/daftar"
                                    className="mt-8 inline-flex items-center rounded-[2px] bg-pen px-6 py-3 font-print text-sm font-black uppercase tracking-wide text-sheet transition hover:bg-desk"
                                >
                                    Ajukan diri jadi afiliator
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>
            </LandingLayout>
        </>
    );
}

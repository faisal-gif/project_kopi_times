import LandingLayout from '@/Layouts/LandingLayout';
import { formatRupiah } from '@/Utils/formatter';
import { Head, Link } from '@inertiajs/react';

// Panduan komisi jaringan (tingkat 2). Melengkapi /panduan-afiliasi, bukan menggantinya.
// Pos internal 10% tidak pernah disebut di halaman publik.
//
// Dua hal yang harus tetap jujur di halaman ini, karena keduanya mudah salah dibaca
// sebagai janji: komisi jaringan hanya untuk akun yang DITUNJUK tim, dan rantainya
// hanya SATU tingkat ke atas — tidak ada tingkat ketiga.
const CONTOH_HARGA = 48000;

function Bagian({ judul, children }) {
    return (
        <section className="border-t border-dashed border-ink/25 py-7">
            <h2 className="text-2xl font-black tracking-[-0.02em]">{judul}</h2>
            <div className="mt-3 space-y-3 font-type text-[15px] leading-relaxed text-ink/85">{children}</div>
        </section>
    );
}

export default function PanduanJaringan({ min_payout, hold_days, tier1_bps, tier2_bps }) {
    const TIER1_PERSEN = tier1_bps / 100 + '%';
    const TIER2_PERSEN = tier2_bps / 100 + '%';
    const contohTier1 = Math.floor((CONTOH_HARGA * tier1_bps) / 10000);
    const contohSisa = CONTOH_HARGA - contohTier1;
    const contohTier2 = Math.floor((contohSisa * tier2_bps) / 10000);

    return (
        <>
            <Head title="Panduan Komisi Jaringan" />
            <LandingLayout>
                <main className="kt-landing bg-paper text-ink font-print">
                    <section className="bg-desk px-4 pt-28 pb-16 md:pt-36 md:pb-20">
                        <div className="mx-auto max-w-4xl rounded-[3px] bg-sheet px-5 py-8 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)] sm:px-10 sm:py-12">
                            <header className="flex items-baseline justify-between gap-4 font-type text-[13px] uppercase tracking-wide text-ink/70">
                                <span>Program afiliasi &middot; Kopi TIMES</span>
                                <span>Komisi jaringan</span>
                            </header>
                            <div className="kt-rule mt-3 text-ink/30" />

                            <h1 className="mt-8 text-balance text-4xl font-black leading-[1.02] tracking-[-0.03em] sm:text-5xl">
                                Orang yang Anda ajak
                                <br />
                                mengajak orang lain.
                            </h1>
                            <p className="mt-4 max-w-[62ch] font-type leading-relaxed text-ink/80">
                                Selain {TIER1_PERSEN} dari rekrutan Anda sendiri, sebagian afiliator juga menerima{' '}
                                <strong className="font-print font-extrabold">komisi jaringan {TIER2_PERSEN}</strong> dari
                                pendaftar yang dibawa afiliator yang dulu mereka undang. Halaman ini menjelaskan siapa
                                yang menerimanya dan bagaimana menghitungnya.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href="/panduan-afiliasi"
                                    className="inline-flex items-center rounded-[2px] border-2 border-ink/20 px-6 py-3 font-print text-sm font-black uppercase tracking-wide transition hover:border-ink/50"
                                >
                                    Panduan afiliasi dasar
                                </Link>
                                <Link
                                    href="/syarat-afiliasi"
                                    className="inline-flex items-center rounded-[2px] border-2 border-ink/20 px-6 py-3 font-print text-sm font-black uppercase tracking-wide transition hover:border-ink/50"
                                >
                                    Syarat &amp; ketentuan
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="px-4 py-16 md:py-20">
                        <div className="mx-auto max-w-3xl">
                            <Bagian judul="Siapa yang menerimanya">
                                <p>
                                    Komisi jaringan <strong>tidak berlaku otomatis untuk setiap afiliator</strong>. Tim
                                    kami menandai akun mana yang berhak menerimanya, satu per satu. Kalau akun Anda
                                    ditandai, halaman afiliasi Anda menampilkan tautan undangan; kalau tidak ada tautan
                                    itu, akun Anda belum ditunjuk.
                                </p>
                                <p>
                                    Penunjukan itu keputusan tim kami dan bisa berubah. Ia juga tidak bisa diminta lewat
                                    formulir mana pun di situs ini.
                                </p>
                            </Bagian>

                            <Bagian judul="Cara membangun jaringan">
                                <p>
                                    Di halaman afiliasi Anda ada <strong>tautan undangan jadi afiliator</strong>, berbeda
                                    dengan tautan referral biasa. Bagikan tautan itu ke member yang ingin jadi afiliator.
                                </p>
                                <p>
                                    Begitu pengajuannya disetujui tim kami, orang itu menjadi bagian jaringan Anda. Sejak
                                    saat itu, setiap pendaftar baru yang ia bawa dengan kodenya sendiri menghasilkan{' '}
                                    {TIER2_PERSEN} untuk Anda.
                                </p>
                                <p>
                                    Perlu diingat: yang menentukan jaringan adalah <strong>tautan undangan</strong>, bukan
                                    tautan referral biasa. Orang yang mendaftar jadi member lewat tautan referral Anda
                                    memberi Anda {TIER1_PERSEN}, tapi ia baru masuk jaringan Anda bila kemudian ia
                                    mengajukan diri jadi afiliator — lewat undangan Anda, atau karena dulu memang Anda
                                    yang mengajaknya jadi member.
                                </p>
                            </Bagian>

                            <Bagian judul="Hitungannya">
                                <p>
                                    Komisi jaringan dihitung dari <strong>sisa setelah komisi langsung</strong>, bukan dari
                                    harga paket utuh. Pada harga {formatRupiah(CONTOH_HARGA)}:
                                </p>
                                <ul className="list-disc space-y-1 pl-5">
                                    <li>
                                        afiliator di jaringan Anda menerima {TIER1_PERSEN} ={' '}
                                        <strong>{formatRupiah(contohTier1)}</strong>;
                                    </li>
                                    <li>
                                        sisanya {formatRupiah(contohSisa)}, dan {TIER2_PERSEN} dari sisa itu ={' '}
                                        <strong className="font-print font-extrabold">{formatRupiah(contohTier2)}</strong>{' '}
                                        untuk Anda.
                                    </li>
                                </ul>
                                <p>
                                    Karena berupa persentase, nominalnya mengikuti harga yang benar-benar dibayarkan.
                                    Setelah tercatat, angkanya tidak berubah lagi walau harga paket atau tarif komisi
                                    diubah di kemudian hari.
                                </p>
                            </Bagian>

                            <Bagian judul="Hanya satu tingkat">
                                <p>
                                    Jaringan ini <strong>berhenti di satu tingkat</strong>. Anda menerima {TIER2_PERSEN}{' '}
                                    dari pendaftar yang dibawa afiliator jaringan Anda — tapi bila afiliator itu kelak
                                    mengundang afiliator lain lagi, pendaftar dari orang ketiga itu tidak menghasilkan
                                    apa pun untuk Anda.
                                </p>
                                <p>
                                    Program ini bukan skema berjenjang. Tidak ada tingkat ketiga, tidak ada komisi dari
                                    merekrut sesama afiliator, dan tidak ada pembayaran apa pun untuk bergabung.
                                </p>
                            </Bagian>

                            <Bagian judul="Kapan tidak ada komisi jaringan">
                                <ul className="list-disc space-y-1 pl-5">
                                    <li>pengajuan afiliator orang yang Anda undang belum disetujui tim kami;</li>
                                    <li>pendaftarnya belum menyelesaikan pembayaran;</li>
                                    <li>
                                        yang dibayar bukan pendaftaran member baru — perpanjangan dan paket tambahan tidak
                                        berkomisi untuk siapa pun;
                                    </li>
                                    <li>akun afiliator jaringan Anda sedang ditangguhkan;</li>
                                    <li>
                                        pendaftarnya membeli paket situs lain; komisi tidak melintasi Kopi TIMES dan AJP.
                                    </li>
                                </ul>
                            </Bagian>

                            <Bagian judul="Pencairannya">
                                <p>
                                    Sama persis dengan komisi langsung: ditahan <strong>{hold_days} hari</strong> sejak
                                    pembayaran lunas, lalu masuk antrean persetujuan, lalu dicairkan lewat transfer manual
                                    bila saldo siap cair sudah mencapai <strong>{formatRupiah(min_payout)}</strong>.
                                </p>
                                <p>
                                    Di halaman afiliasi Anda, komisi jaringan muncul bercampur dengan komisi langsung dan
                                    ditandai sebagai pos Tier 2.
                                </p>
                            </Bagian>

                            <div className="border-t border-dashed border-ink/25 pt-7">
                                <p className="font-type text-[15px] leading-relaxed text-ink/85">
                                    Yang mengikat secara aturan adalah{' '}
                                    <Link
                                        href="/syarat-afiliasi"
                                        className="font-print font-extrabold text-pen underline decoration-2 underline-offset-4 hover:text-desk"
                                    >
                                        Syarat &amp; Ketentuan Afiliasi
                                    </Link>
                                    . Bila halaman ini tampak berbeda dengannya, yang berlaku adalah syarat &amp;
                                    ketentuan.
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
                            </div>
                        </div>
                    </section>
                </main>
            </LandingLayout>
        </>
    );
}

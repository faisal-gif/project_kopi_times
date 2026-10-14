import LandingLayout from '@/Layouts/LandingLayout';
import { formatRupiah } from '@/Utils/formatter';
import { Head, Link } from '@inertiajs/react';

// Komisi ditulis sebagai persentase supaya ikut harga paket, ditambah satu contoh angka.
// Pos internal 10% tidak pernah disebut di halaman publik.
const CONTOH_HARGA = 48000;
const CONTOH_TIER1 = 9600;
const CONTOH_TIER2 = 1920;
const BERLAKU = '13 Oktober 2026';

function Pasal({ nomor, judul, children }) {
    return (
        <section className="border-t border-dashed border-ink/25 py-7">
            <h2 className="flex items-baseline gap-3 text-2xl font-black tracking-[-0.02em]">
                <span className="font-pen text-xl font-bold text-pen">{nomor}</span>
                {judul}
            </h2>
            <div className="mt-3 space-y-3 font-type text-[15px] leading-relaxed text-ink/85">{children}</div>
        </section>
    );
}

export default function SyaratKetentuan({ min_payout, hold_days, cookie_days, tier1_bps, tier2_bps }) {
    // Tarif datang dari config lewat props, bukan diketik di halaman.
    const TIER1_PERSEN = (tier1_bps / 100) + '%';
    const TIER2_PERSEN = (tier2_bps / 100) + '%';

    return (
        <>
            <Head title="Syarat & Ketentuan Afiliasi" />
            <LandingLayout>
                <main className="kt-landing bg-paper text-ink font-print">
                    <section className="bg-desk px-4 pt-28 pb-16 md:pt-36 md:pb-20">
                        <div className="mx-auto max-w-4xl rounded-[3px] bg-sheet px-5 py-8 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)] sm:px-10 sm:py-12">
                            <header className="flex items-baseline justify-between gap-4 font-type text-[13px] uppercase tracking-wide text-ink/70">
                                <span>Program afiliasi &middot; Kopi TIMES</span>
                                <span>Berlaku {BERLAKU}</span>
                            </header>
                            <div className="kt-rule mt-3 text-ink/30" />

                            <h1 className="mt-8 text-balance text-4xl font-black leading-[1.02] tracking-[-0.03em] sm:text-5xl">
                                Syarat &amp; Ketentuan Afiliasi
                            </h1>
                            <p className="mt-4 max-w-[62ch] font-type leading-relaxed text-ink/80">
                                Ketentuan ini mengikat setiap orang yang mengajukan diri dan disetujui sebagai afiliator
                                Kopi TIMES. Dengan mengirim pengajuan, Anda menyatakan telah membacanya.
                            </p>
                        </div>
                    </section>

                    <section className="px-4 py-16 md:py-20">
                        <div className="mx-auto max-w-3xl">
                            <Pasal nomor="1" judul="Keanggotaan">
                                <p>
                                    Pengajuan hanya dapat dilakukan oleh member Kopi TIMES yang berstatus aktif. Satu orang
                                    hanya boleh memiliki satu akun afiliator, dan satu akun member hanya dapat ditautkan ke
                                    satu akun afiliator.
                                </p>
                                <p>
                                    Pengajuan ditinjau terlebih dahulu. Kami berhak menyetujui atau menolak pengajuan tanpa
                                    kewajiban menjelaskan alasannya.
                                </p>
                            </Pasal>

                            <Pasal nomor="2" judul="Komisi">
                                <p>
                                    Untuk setiap pendaftar baru yang masuk melalui link referral Anda dan menyelesaikan
                                    pembayaran paket pendaftaran, Anda memperoleh komisi{' '}
                                    <span className="kt-mark font-bold text-ink">{TIER1_PERSEN} dari harga paket</span>.
                                </p>
                                <p>
                                    Bila afiliator yang Anda rekrut memperoleh pendaftar baru, Anda memperoleh komisi
                                    jaringan sebesar <strong>{TIER2_PERSEN} dari sisa setelah komisi tingkat 1</strong>{' '}
                                    untuk setiap pendaftar tersebut.
                                </p>
                                <p>
                                    Contoh pada harga paket {formatRupiah(CONTOH_HARGA)}: komisi langsung{' '}
                                    {formatRupiah(CONTOH_TIER1)} dan komisi jaringan {formatRupiah(CONTOH_TIER2)}.
                                </p>
                                <p>
                                    Karena berupa persentase, komisi mengikuti harga yang benar-benar dibayarkan.
                                    Perubahan harga paket mengubah nominal komisi untuk transaksi berikutnya, tanpa
                                    mengubah komisi yang sudah tercatat.
                                </p>
                            </Pasal>

                            <Pasal nomor="3" judul="Transaksi yang berkomisi">
                                <p>
                                    Komisi hanya berlaku untuk <strong>pendaftaran member baru</strong>. Perpanjangan
                                    membership, pembelian paket tambahan, dan pembelian satuan tidak menghasilkan komisi.
                                </p>
                                <p>
                                    Pembayaran yang dibatalkan, gagal, kedaluwarsa, atau dikembalikan tidak menghasilkan
                                    komisi. Komisi yang terlanjur tercatat atas pembayaran semacam itu akan dibatalkan.
                                </p>
                            </Pasal>

                            <Pasal nomor="4" judul="Pencatatan referral">
                                <p>
                                    Kode referral tersimpan di perangkat pendaftar selama <strong>{cookie_days} hari</strong>{' '}
                                    sejak ia membuka link Anda. Bila dalam rentang itu ia mendaftar, pendaftaran dicatat atas
                                    nama Anda.
                                </p>
                                <p>
                                    Bila seseorang membuka beberapa link referral berbeda, yang berlaku adalah link yang{' '}
                                    <strong>pertama</strong> ia buka. Satu pendaftar selamanya tercatat pada satu afiliator
                                    dan tidak dapat dipindahkan.
                                </p>
                            </Pasal>

                            <Pasal nomor="5" judul="Masa tahan dan pencairan">
                                <p>
                                    Komisi ditahan <strong>{hold_days} hari</strong> sejak pembayaran dinyatakan lunas,
                                    sebelum dapat diajukan untuk pencairan.
                                </p>
                                <p>
                                    Pencairan dilakukan melalui transfer ke rekening yang Anda daftarkan, dengan saldo
                                    minimum <strong>{formatRupiah(min_payout)}</strong>. Kesalahan data rekening yang Anda
                                    isi di luar tanggung jawab kami.
                                </p>
                                <p>
                                    Pajak atas komisi mengikuti ketentuan perpajakan yang berlaku.
                                </p>
                            </Pasal>

                            <Pasal nomor="6" judul="Larangan">
                                <p>Anda dilarang:</p>
                                <ul className="ml-5 list-disc space-y-2">
                                    <li>mendaftarkan diri sendiri atau membuat akun fiktif untuk memperoleh komisi;</li>
                                    <li>menyebarkan link referral lewat spam, pesan massal tanpa izin, atau cara yang menyesatkan;</li>
                                    <li>mengaku sebagai karyawan, perwakilan resmi, atau juru bicara TIMES Indonesia;</li>
                                    <li>menjanjikan keuntungan, jaminan pemuatan tulisan, atau ketentuan apa pun di luar dokumen ini;</li>
                                    <li>memakai nama, logo, atau identitas TIMES Indonesia untuk keperluan di luar promosi program ini.</li>
                                </ul>
                            </Pasal>

                            <Pasal nomor="7" judul="Sanksi">
                                <p>
                                    Pelanggaran atas ketentuan di atas dapat berakibat pembatalan komisi yang belum
                                    dicairkan, penangguhan, atau penghentian akun afiliator. Komisi dari transaksi yang
                                    terbukti tidak sah tidak akan dibayarkan.
                                </p>
                            </Pasal>

                            <Pasal nomor="8" judul="Perubahan ketentuan">
                                <p>
                                    Ketentuan ini dapat diubah sewaktu-waktu. Perubahan berlaku untuk transaksi setelah
                                    tanggal perubahan dan tidak mengubah komisi yang sudah tercatat. Versi yang berlaku
                                    adalah yang tercantum di halaman ini.
                                </p>
                            </Pasal>

                            <div className="border-t border-dashed border-ink/25 pt-7">
                                <p className="font-type text-[15px] text-ink/80">
                                    Pertanyaan tentang program ini:{' '}
                                    <a href="mailto:redaksi@timesindonesia.co.id" className="font-print font-extrabold text-pen underline decoration-2 underline-offset-4 hover:text-desk">
                                        redaksi@timesindonesia.co.id
                                    </a>
                                </p>
                                <p className="mt-6 font-type text-sm text-ink/70">
                                    Lihat juga{' '}
                                    <Link href="/syarat-ketentuan" className="text-pen underline underline-offset-4">
                                        Syarat &amp; Ketentuan layanan
                                    </Link>{' '}
                                    dan{' '}
                                    <Link href="/kebijakan-privasi" className="text-pen underline underline-offset-4">
                                        Kebijakan Privasi
                                    </Link>
                                    .
                                </p>
                            </div>
                        </div>
                    </section>
                </main>
            </LandingLayout>
        </>
    );
}

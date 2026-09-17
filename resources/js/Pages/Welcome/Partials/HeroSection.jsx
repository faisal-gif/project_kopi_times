import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

// Coretan tangan editor: satu garis coret + tanda sisip, digambar ulang saat halaman dibuka.
function Strike({ className = '' }) {
    return (
        <svg className={`kt-strike pointer-events-none absolute inset-x-[-4%] top-1/2 h-[0.5em] w-[108%] -translate-y-1/2 ${className}`} viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true">
            <path d="M3 13 C 70 5, 150 15, 297 6" pathLength="1" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
    );
}

function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-desk pt-24 pb-16 md:pt-32 md:pb-24">
            <div className="relative mx-auto grid max-w-7xl items-start gap-10 px-4 lg:grid-cols-12">
                {/* Lembar naskah */}
                <article className="relative rounded-[3px] bg-sheet px-5 py-7 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)] sm:px-10 sm:py-10 lg:col-span-8 lg:-rotate-[0.6deg] lg:px-14 lg:py-12">
                    <header className="flex items-baseline justify-between gap-4 font-type text-[13px] uppercase tracking-wide text-ink/70">
                        <span>Naskah opini &middot; Kopi TIMES</span>
                        <span>Hal. 1</span>
                    </header>
                    <div className="kt-rule mt-3 text-ink/30" />

                    <p className="mt-6 font-type text-[15px] text-ink/70">
                        Penulis: <span className="inline-block min-w-32 border-b border-ink/40 font-pen text-lg leading-none text-pen">nama Anda</span>
                    </p>

                    <h1 className="mt-6 text-balance font-print text-[2.6rem] font-black leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-[5.25rem]">
                        <span className="sr-only">Gagasan Anda layak dibaca Indonesia.</span>
                        <span aria-hidden="true">
                            Gagasan Anda{' '}
                            <span className="relative inline-block whitespace-nowrap font-type text-[0.5em] sm:text-[0.62em] font-normal tracking-normal text-ink/55">
                                cukup disimpan sendiri
                                <Strike className="text-pen" />
                            </span>
                            <span className="kt-insert mt-1 block -rotate-2 font-pen text-[0.9em] lg:text-[0.78em] font-bold leading-[1.05] tracking-normal text-pen">
                                layak dibaca Indonesia.
                            </span>
                        </span>
                    </h1>

                    <p className="mt-8 max-w-[58ch] font-type text-base leading-relaxed sm:text-[17px]">
                        Kopi TIMES adalah <span className="kt-mark">kolom opini TIMES Indonesia</span>. Sebagai anggota penulis, Anda mendapat akses CMS, kuota menulis, member card, dan tulisan yang terindeks Google.
                    </p>

                    <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <Link
                            href={route('register')}
                            className="group inline-flex items-center justify-center gap-3 rounded-[3px] bg-pen px-7 py-4 text-lg font-extrabold text-white shadow-[0_10px_20px_-10px_rgba(179,13,18,0.8)] transition-[background-color,transform] duration-200 hover:bg-desk active:translate-y-px"
                        >
                            Daftar jadi penulis
                            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>
                        <a href="#paket" className="px-2 py-3 text-center font-semibold underline decoration-pen decoration-2 underline-offset-[6px] hover:text-pen">
                            Lihat paket membership
                        </a>
                    </div>

                    <div className="kt-rule mt-10 text-ink/30" />
                    <dl className="mt-4 grid grid-cols-3 gap-3 font-type text-[13px] text-ink/75 sm:text-sm">
                        {[
                            ['10K+', 'artikel terbit'],
                            ['5K+', 'penulis'],
                            ['1M+', 'pembaca'],
                        ].map(([value, label], i) => (
                            <div key={label}>
                                <dt className="sr-only">{label}</dt>
                                <dd>
                                    <sup className="text-pen">{i + 1}</sup>
                                    <span className="font-print text-xl font-extrabold text-ink sm:text-2xl">{value}</span>
                                    <span className="block sm:inline sm:pl-2">{label}</span>
                                </dd>
                            </div>
                        ))}
                    </dl>

                    {/* Catatan pinggir editor */}
                    <p className="pointer-events-none absolute right-8 top-24 hidden max-w-40 rotate-6 font-pen text-xl leading-tight text-pen xl:block" aria-hidden="true">
                        judulnya kuat,
                        <br />
                        lanjutkan!
                    </p>
                </article>

                {/* Member card asli, dijepit di meja redaksi */}
                <aside className="relative mx-auto w-56 sm:w-64 lg:col-span-4 lg:mx-0 lg:mt-24 lg:w-auto lg:max-w-72">
                    <div className="absolute -top-3 left-1/2 z-10 h-7 w-24 -translate-x-1/2 rotate-[-4deg] bg-saffron/85" aria-hidden="true" />
                    <figure className="relative rotate-3 overflow-hidden rounded-xl bg-sheet shadow-[0_24px_40px_-16px_rgba(0,0,0,0.6)]">
                        <img src="/templates/card_bg.jpeg" alt="Member card penulis Kopi TIMES" className="block w-full" width="1009" height="1600" />
                        <figcaption className="absolute inset-x-0 top-[48%] text-center">
                            <span className="block font-print text-lg font-extrabold uppercase text-ink">Nama Anda</span>
                            <span className="mt-1 block font-type text-xs text-ink/70">Penulis Kopi TIMES</span>
                        </figcaption>
                    </figure>
                    <p className="mt-6 text-center font-pen text-lg text-white/90 lg:text-left">
                        Setiap anggota mendapat member card penulis.
                    </p>
                </aside>
            </div>
        </section>
    );
}

export default HeroSection;

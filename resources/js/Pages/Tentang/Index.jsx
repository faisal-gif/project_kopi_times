import LandingLayout from "@/Layouts/LandingLayout";
import { Head, Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import AboutSection from "../Welcome/Partials/AboutSection";

const stats = [
    ["10K+", "artikel terbit"],
    ["5K+", "penulis"],
    ["1M+", "pembaca"],
];

const values = ["Transparansi", "Integritas", "Inovasi", "Komunitas"];

const Tentang = () => (
    <>
        <Head title="Tentang Kami" />
        <LandingLayout>
            <main className="kt-landing bg-paper text-ink font-print">
                {/* Surat redaksi */}
                <section className="bg-desk px-4 pt-28 pb-16 md:pt-36 md:pb-24">
                    <article className="mx-auto max-w-4xl rounded-[3px] bg-sheet px-5 py-8 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)] sm:px-10 sm:py-12 lg:px-16 lg:py-14">
                        <header className="flex items-baseline justify-between gap-4 font-type text-[13px] uppercase tracking-wide text-ink/70">
                            <span>Dari meja redaksi</span>
                            <span>Malang</span>
                        </header>
                        <div className="kt-rule mt-3 text-ink/30" />

                        <h1 className="mt-8 text-balance text-[2.5rem] font-black leading-[1] tracking-[-0.03em] sm:text-6xl">
                            Klub penulis opini nasional di TIMES Indonesia.
                        </h1>

                        <p className="mt-8 font-type text-[15px] text-ink/70">Kepada calon penulis,</p>
                        <p className="mt-4 max-w-[62ch] font-type text-base leading-relaxed sm:text-[17px]">
                            Kopi TIMES adalah <span className="kt-mark">program keanggotaan bagi penulis</span> yang ingin terlibat aktif dalam ekosistem gagasan di TIMES Indonesia. Program ini dirancang bukan sekadar untuk memuat tulisan, tetapi sebagai kawah candradimuka bagi para intelektual untuk mengawal diskursus publik di skala nasional.
                        </p>

                        <p className="mt-8 -rotate-2 font-pen text-2xl font-bold text-pen">Tim Kopi TIMES</p>
                        <p className="font-type text-sm text-ink/70">TIMES Indonesia</p>

                        <div className="kt-rule mt-10 text-ink/30" />
                        <dl className="mt-4 grid grid-cols-3 gap-3 font-type text-[13px] text-ink/75 sm:text-sm">
                            {stats.map(([value, label], i) => (
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
                    </article>
                </section>

                {/* Misi */}
                <section className="px-4 py-20 md:py-28">
                    <figure className="mx-auto max-w-5xl">
                        <h2 className="font-pen text-2xl font-bold text-pen">Misi kami</h2>
                        <blockquote className="mt-4 text-balance text-3xl font-black leading-[1.08] tracking-[-0.025em] sm:text-5xl lg:text-6xl">
                            Kami percaya bahwa setiap opini dan pemikiran positif memiliki kekuatan untuk mengubah perspektif dan menginspirasi tindakan nyata.
                        </blockquote>
                        <figcaption className="mt-8 font-type text-sm text-ink/70">
                            Tim Kopi TIMES, TIMES Indonesia
                        </figcaption>
                    </figure>
                </section>

                {/* Visi */}
                <section className="border-t border-dashed border-ink/25 px-4 py-20 md:py-28">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
                        <div className="lg:col-span-6">
                            <h2 className="text-balance text-4xl font-black leading-[1.02] tracking-[-0.025em] md:text-5xl">
                                Masa depan jurnalisme Indonesia
                            </h2>
                            <p className="mt-6 max-w-[58ch] font-type leading-relaxed text-ink/85">
                                Kami ingin menjadi platform jurnalisme terdepan di Indonesia yang tidak hanya menyajikan berita, tetapi juga menginspirasi perubahan positif di masyarakat. Dengan teknologi dan komunitas yang kuat, kami yakin dapat mewujudkan ekosistem pengetahuan dan informasi yang sehat dan konstruktif.
                            </p>
                        </div>
                        {/* Nilai sebagai stempel redaksi */}
                        <ul className="grid grid-cols-2 content-center gap-6 lg:col-span-6">
                            {values.map((value, i) => (
                                <li
                                    key={value}
                                    className={`grid place-items-center rounded-md border-[3px] border-pen/85 px-3 py-5 text-center text-lg font-black uppercase tracking-[0.08em] text-pen/90 sm:text-2xl ${["-rotate-3", "rotate-2", "rotate-1", "-rotate-2"][i]}`}
                                >
                                    {value}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <AboutSection />

                {/* Penutup */}
                <section className="bg-desk px-4 py-20 text-white md:py-24">
                    <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <h2 className="max-w-3xl text-balance text-4xl font-black leading-[1.02] tracking-[-0.025em] md:text-6xl">
                            Punya gagasan? Tulis, kami yang membaca.
                        </h2>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <Link
                                href={route("register")}
                                className="group inline-flex items-center justify-center gap-3 rounded-[3px] bg-sheet px-7 py-4 text-lg font-extrabold text-ink transition-colors duration-200 hover:bg-saffron"
                            >
                                Daftar jadi penulis
                                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                            <Link href={route("harga")} className="px-2 py-3 text-center font-semibold underline decoration-saffron decoration-2 underline-offset-[6px] hover:text-saffron">
                                Lihat paket
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </LandingLayout>
    </>
);

export default Tentang;

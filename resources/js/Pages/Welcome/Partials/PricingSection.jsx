import { formatDuration, formatRupiah } from "@/Utils/formatter";
import { Link } from "@inertiajs/react";
import { ArrowRight, Check, Gift } from "lucide-react";

const defaultLevel1Features = [
    "Dapat member card penulis",
    "Dapat Akun CMS akses",
    "Mendapatkan Kouta menulis",
    "Jangkauan audience luas",
];

const steps = [
    "Daftar dan pilih paket membership",
    "Tulis naskah langsung di CMS",
    "Redaksi menyeleksi naskah",
    "Tulisan terbit di TIMES Indonesia",
];

function Feature({ icon: Icon = Check, children }) {
    return (
        <li className="flex items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-pen" strokeWidth={2.5} />
            <span>{children}</span>
        </li>
    );
}

const PricingSection = ({ newsPackages, as: Heading = "h2", title = "Siap mengirim naskah pertama Anda?", className = "py-20 md:py-28" }) => (
    <section id="paket" className={`scroll-mt-20 bg-desk text-white ${className}`}>
        <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-10 lg:grid-cols-12">
                <Heading className="text-balance text-4xl font-black leading-[1.02] tracking-[-0.025em] md:text-6xl lg:col-span-6">
                    {title}
                </Heading>
                <ol className="grid gap-4 font-type text-[15px] text-white/90 sm:grid-cols-2 lg:col-span-6 lg:pt-3">
                    {steps.map((step, i) => (
                        <li key={step} className="flex gap-3 border-t border-dashed border-white/35 pt-4">
                            <span className="font-pen text-2xl font-bold leading-none text-saffron">{i + 1}</span>
                            {step}
                        </li>
                    ))}
                </ol>
            </div>

            <div className={`mt-16 grid gap-8 ${newsPackages.length === 1 ? "justify-items-center" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
                {newsPackages.map((plan) => {
                    const level1Features = plan.feature?.keunggulan || defaultLevel1Features;
                    const popular = plan.popular === 1;

                    return (
                        <article
                            key={plan.id ?? plan.name}
                            className={`relative flex w-full flex-col rounded-[3px] bg-sheet p-7 text-ink shadow-[0_28px_50px_-24px_rgba(0,0,0,0.7)] ${newsPackages.length === 1 ? "max-w-md" : ""} ${popular ? "lg:-translate-y-3" : ""}`}
                        >
                            {popular && (
                                <p className="absolute -top-3 left-6 -rotate-2 bg-saffron px-3 py-1 text-sm font-extrabold">
                                    Paling populer
                                </p>
                            )}

                            <header className="border-b border-dashed border-ink/30 pb-5">
                                <h3 className="font-type text-sm uppercase tracking-wide text-ink/70">{plan.name}</h3>
                                <p className="mt-3 text-3xl font-black tracking-[-0.02em] tabular-nums">{formatRupiah(plan.price)}</p>
                                <p className="mt-1 font-type text-sm text-ink/70">per {plan.jenis_periode ? `${plan.period} ${plan.jenis_periode}` : formatDuration(plan.period)}</p>
                                {plan.description && <p className="mt-3 font-type text-sm leading-relaxed text-ink/80">{plan.description}</p>}
                            </header>

                            <ul className="mt-5 flex-1 space-y-3 font-type text-[15px]">
                                {plan.level === 1 ? (
                                    level1Features.map((feature, idx) => <Feature key={idx}>{feature}</Feature>)
                                ) : (
                                    <>
                                        {plan.quota > 0 && <Feature>Quota: {plan.quota}</Feature>}
                                        {plan.feed_instagram > 0 && <Feature>Feed Instagram: {plan.feed_instagram}x</Feature>}
                                        {plan.ekoran > 0 && <Feature>Ekoran: {plan.ekoran}</Feature>}
                                        {plan.wa_channel > 0 && <Feature>Whatsapp Channel: {plan.wa_channel}</Feature>}
                                        {plan.items_lainnya?.length > 0 && (
                                            <>
                                                <li className="pt-3 font-pen text-lg text-pen">Bonus & tambahan</li>
                                                {plan.items_lainnya.map((item) => (
                                                    <Feature key={item.id} icon={Gift}>
                                                        {item.qty > 1 && <strong>{item.qty}x </strong>}
                                                        {item.nama_item}
                                                    </Feature>
                                                ))}
                                            </>
                                        )}
                                    </>
                                )}
                            </ul>

                            <Link
                                href={plan.level === 2 ? `/checkout?package_id=${plan.id}` : "/register"}
                                className={`group mt-8 inline-flex items-center justify-center gap-2 rounded-[3px] px-5 py-3.5 font-extrabold transition-colors duration-200 ${popular ? "bg-pen text-white hover:bg-desk" : "bg-ink text-white hover:bg-pen"}`}
                            >
                                Pilih paket ini
                                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                        </article>
                    );
                })}
            </div>

            {newsPackages.length === 0 && (
                <Link href="/register" className="mt-16 inline-flex items-center gap-2 rounded-[3px] bg-sheet px-7 py-4 text-lg font-extrabold text-ink hover:bg-saffron">
                    Daftar jadi penulis <ArrowRight className="h-5 w-5" />
                </Link>
            )}

            <p className="mt-14 text-center font-type text-sm text-white/85">
                Punya pertanyaan? Tulis ke{" "}
                <a href="mailto:redaksi@timesindonesia.co.id" className="font-bold text-white underline decoration-saffron decoration-2 underline-offset-4 hover:text-saffron">
                    redaksi@timesindonesia.co.id
                </a>
            </p>
        </div>
    </section>
);

export default PricingSection;

import { ImageIcon } from 'lucide-react';

const benefits = [
    { title: 'Jangkauan nasional', body: 'Tulisan Anda terbit di TIMES Indonesia dan berpotensi dibaca jutaan pengunjungnya.' },
    { title: 'Personal branding', body: 'Profil Anda tumbuh sebagai pakar atau pemikir di bidang yang Anda tekuni.' },
    { title: 'Terindeks mesin pencari', body: 'Artikel opini terindeks Google dan Yahoo, mudah ditemukan saat nama Anda dicari.' },
    { title: 'Ruang diskusi intelektual', body: 'Gagasan yang konstruktif, kritis, dan solutif mendapat tempat di ruang publik.' },
];

const AboutSection = () => (
    <section className="border-y border-ink/10 bg-sheet py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 lg:grid-cols-12">
            <div className="lg:col-span-6">
                <figure className="relative -rotate-1">
                    <div className="absolute -top-3 left-10 z-10 h-7 w-24 rotate-[5deg] bg-saffron/85" aria-hidden="true" />
                    <div className="relative overflow-hidden rounded-[3px] bg-ink shadow-[0_24px_48px_-20px_rgba(0,0,0,0.5)]">
                        <div className="absolute inset-y-0 right-0 flex w-[58%] items-center justify-center text-white/60" aria-hidden="true">
                            <span className="flex flex-col items-center gap-2 font-type text-sm">
                                <ImageIcon className="h-8 w-8" />
                                foto Anda
                            </span>
                        </div>
                        <img src="/images/frame-kopitimes.png" alt="Bingkai foto penulis Kopi TIMES" className="relative block w-full" width="1200" height="800" loading="lazy" />
                    </div>
                    <figcaption className="mt-5 font-pen text-lg text-pen">
                        Bingkai foto resmi untuk mengumumkan tulisan Anda di media sosial.
                    </figcaption>
                </figure>
            </div>

            <div className="lg:col-span-6">
                <h2 className="text-balance text-4xl font-black leading-[1.02] tracking-[-0.025em] md:text-5xl">
                    Nama Anda, di media yang dibaca orang.
                </h2>
                <p className="mt-6 max-w-[52ch] font-type leading-relaxed text-ink/80">
                    Kopi TIMES (Kolom Opini) adalah kanal TIMES Indonesia untuk pemikiran segar, analisis tajam, dan sudut pandang baru dari masyarakat.
                </p>
                <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                    {benefits.map((item) => (
                        <div key={item.title}>
                            <dt className="text-lg font-extrabold">{item.title}</dt>
                            <dd className="mt-2 font-type text-[15px] leading-relaxed text-ink/80">{item.body}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </div>
    </section>
);

export default AboutSection;

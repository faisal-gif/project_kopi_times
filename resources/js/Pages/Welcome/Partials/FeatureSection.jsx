// Kriteria redaksi, ditulis sebagai catatan pena merah di pinggir naskah.
const criteria = [
    { title: 'Orisinal', body: 'Asli, bukan plagiasi, saduran, terjemahan, kompilasi, atau rangkuman pendapat dan buku orang lain.' },
    { title: 'Eksklusif', body: 'Belum pernah dimuat di media, penerbitan, atau blog lain, dan tidak dikirim bersamaan ke tempat lain.' },
    { title: 'Aktual & relevan', body: 'Membahas persoalan yang sedang terjadi dan dirasakan masyarakat.' },
    { title: 'Kepentingan umum', body: 'Substansinya menyangkut kepentingan publik, bukan kepentingan komunitas tertentu.' },
    { title: 'Perspektif baru', body: 'Membawa informasi, pandangan, pendekatan, saran, atau solusi yang belum dikemukakan penulis lain.' },
    { title: 'Bahasa populer', body: 'Luwes dan mudah ditangkap. Maksimal 4.000 karakter (sekitar 600 kata), ditulis satu orang.' },
];

function Underline() {
    return (
        <svg className="mt-0.5 h-2 w-full max-w-40 text-pen" viewBox="0 0 160 8" preserveAspectRatio="none" aria-hidden="true">
            <path d="M2 5 C 40 1, 90 7, 158 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

const FeaturesSection = () => (
    <section className="py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-12">
            <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
                <h2 className="text-balance text-4xl font-black leading-[1.02] tracking-[-0.025em] md:text-5xl">
                    Redaksi membaca setiap naskah. Ini yang kami cari.
                </h2>
                <p className="mt-6 max-w-[46ch] font-type leading-relaxed text-ink/80">
                    Seleksi inilah yang membuat nama Anda berdiri di samping penulis yang serius. Periksa naskah Anda sebelum mengirim.
                </p>
            </div>

            <ol className="grid gap-x-10 sm:grid-cols-2 lg:col-span-7">
                {criteria.map((item) => (
                    <li key={item.title} className="border-t border-dashed border-ink/25 py-7">
                        <h3 className="font-pen text-2xl font-bold leading-none text-pen">{item.title}</h3>
                        <Underline />
                        <p className="mt-3 font-type text-[15px] leading-relaxed text-ink/85">{item.body}</p>
                    </li>
                ))}
            </ol>
        </div>
    </section>
);

export default FeaturesSection;

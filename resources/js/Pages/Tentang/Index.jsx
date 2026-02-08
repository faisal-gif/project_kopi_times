import Card from "@/Components/Card";
import LandingLayout from "@/Layouts/LandingLayout";
import { Head } from "@inertiajs/react";
import { Globe, Users, Target, Award, TrendingUp, Newspaper } from "lucide-react";


const Tentang = () => {
    const values = [
        {
            icon: Globe,
            title: "Jangkauan Nasional",
            description:
                "Tulisan Anda berpotensi dibaca oleh jutaan pengunjung TIMES Indonesia.",
        },
        {
            icon: Users,
            title: "Membangun Personal Branding",
            description:
                "Perkuat profil profesional Anda sebagai pakar atau pemikir di bidang spesifik.",
        },
        {
            icon: Award,
            title: "Ruang Diskusi Intelektual",
            description:
                "Wadah bagi pemikiran yang konstruktif, kritis, dan solutif untuk kemajuan bangsa.",
        },
        {
            icon: Newspaper,
            title: "Indeks Search Engine",
            description:
                "Artikel opini terindeks beragam Search Engine seperti Google dan Yahoo.",
        },
    ];

    const stats = [
        { icon: Users, value: "10,000+", label: "Penulis Aktif" },
        { icon: Target, value: "50,000+", label: "Artikel Dipublikasikan" },
        { icon: Award, value: "100+", label: "Penghargaan" },
        { icon: TrendingUp, value: "1M+", label: "Pembaca Bulanan" },
    ];

    return (
        <>
            <Head title="Tentang Kamu" />


            <LandingLayout>
                <main className="pt-16 ">
                    {/* Hero Section */}
                    <section className="py-20 bg-primary/5">
                        <div className="max-w-7xl mx-auto px-4">
                            <div className="max-w-3xl mx-auto text-center">
                                <span className="text-sm font-medium text-primary uppercase tracking-wider">
                                    Tentang AJP
                                </span>
                                <h1 className="font-serif text-4xl md:text-5xl font-bold mt-3 mb-6">
                                    Platform Jurnalisme Positif Indonesia
                                </h1>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Membership Penulis Kopi TIMES adalah program keanggotaan bagi penulis yang ingin terlibat aktif dalam ekosistem gagasan di TIMES Indonesia. Program ini dirancang bukan sekadar untuk memuat tulisan, tetapi untuk menumbuhkan penulis, memperkuat kualitas gagasan, dan memperluas dampak pemikiran ke ruang publik.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Stats Section */}
                    <section className="py-16 border-b border-border">
                        <div className="max-w-7xl mx-auto px-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {stats.map((stat) => (
                                    <div key={stat.label} className="text-center">
                                        <div className="w-12 h-12 rounded-lg bg-linear-to-bl from-primary to-accent flex items-center justify-center mx-auto mb-4">
                                            <stat.icon className="w-6 h-6 text-primary-content" />
                                        </div>
                                        <div className="font-serif text-3xl font-bold mb-1">{stat.value}</div>
                                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Values Section */}
                    <section className="py-20">
                        <div className="max-w-7xl mx-auto px-4">
                            <div className="max-w-2xl mx-auto text-center mb-16">
                                <span className="text-sm font-medium text-primary uppercase tracking-wider">
                                    Nilai-Nilai Kami
                                </span>
                                <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 mb-6">
                                    Mengapa Memilih AJP?
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {values.map((value, index) => (
                                    <Card
                                        key={value.title}
                                        className="bg-card rounded-xl p-6 border border-border card-hover"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-linear-to-bl from-primary to-accent flex items-center justify-center mb-4">
                                            <value.icon className="w-6 h-6 text-primary-content" />
                                        </div>
                                        <h3 className="font-serif text-xl font-semibold mb-3">{value.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {value.description}
                                        </p>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Mission Section */}
                    <section className="py-20 bg-base-300">
                        <div className="container mx-auto px-4">
                            <div className="max-w-4xl mx-auto">
                                <Card className="relative bg-base-100 rounded-2xl p-8 md:p-12 border border-border overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-primary to-accent opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="relative z-10">
                                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-center mb-8">
                                            Misi Kami
                                        </h2>
                                        <blockquote className="font-serif text-xl md:text-2xl italic text-center leading-relaxed mb-6">
                                            "Kami percaya bahwa setiap cerita positif memiliki kekuatan untuk
                                            mengubah perspektif dan menginspirasi tindakan nyata."
                                        </blockquote>
                                        <div className="text-center">
                                            <div className="w-16 h-1 hero-gradient mx-auto rounded-full mb-4" />
                                            <p className="text-muted-foreground text-sm">
                                                Tim AJP - Aplikasi Jurnalisme Positif
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* Vision Section */}
                    <section className="py-20 bg-base-200">
                        <div className="max-w-7xl mx-auto px-4">
                            <div className="max-w-3xl mx-auto text-center">
                                <span className="text-sm font-medium text-primary uppercase tracking-wider">
                                    Visi Kami
                                </span>
                                <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 mb-6">
                                    Masa Depan Jurnalisme Indonesia
                                </h2>
                                <p className="text-muted-foreground leading-relaxed mb-8">
                                    Kami bermimpi menjadi platform jurnalisme terdepan di Indonesia yang
                                    tidak hanya menyajikan berita, tetapi juga menginspirasi perubahan positif
                                    di masyarakat. Dengan teknologi dan komunitas yang kuat, kami yakin dapat
                                    mewujudkan ekosistem media yang sehat dan konstruktif.
                                </p>
                                <div className="flex flex-wrap justify-center gap-4 text-sm">
                                    <span className="px-4 py-2 bg-primary/10 text-primary rounded-full">
                                        Transparansi
                                    </span>
                                    <span className="px-4 py-2 bg-primary/10 text-primary rounded-full">
                                        Integritas
                                    </span>
                                    <span className="px-4 py-2 bg-primary/10 text-primary rounded-full">
                                        Inovasi
                                    </span>
                                    <span className="px-4 py-2 bg-primary/10 text-primary rounded-full">
                                        Komunitas
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

            </LandingLayout>


        </>
    );
};

export default Tentang;

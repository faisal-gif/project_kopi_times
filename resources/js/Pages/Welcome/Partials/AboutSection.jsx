import Card from "@/Components/Card";
import { Heart, Shield, Lightbulb, Globe, Coffee, Award, Users, Newspaper } from "lucide-react";

const AboutSection = () => {
    const values = [
        {
            icon: Award,
            title: "Membangun Reputasi",
            description:
                "Tulisan Anda dimuat di media nasional terpercaya, membangun kredibilitas dan reputasi sebagai penulis profesional.",
        },
        {
            icon: Globe,
            title: "Jangkauan Nasional",
            description:
                "Gagasan Anda akan dibaca oleh jutaan pembaca dari seluruh Indonesia yang mencari konten berkualitas.",
        },
        {
            icon: Users,
            title: "Personal Branding",
            description:
                "Perkuat personal branding Anda sebagai pemikir dan kontributor dalam diskusi publik nasional.",
        },
        {
            icon: Newspaper,
            title: "Indeks Google Berita",
            description:
                "Artikel Anda terindeks di Google News, memperluas jangkauan dan visibilitas tulisan Anda.",
        },
    ];

    return (
        <section id="about" className="py-24 bg-base-200 ">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="max-w-2xl mx-auto text-center mb-16">
                    <span className="text-sm font-medium text-primary uppercase tracking-wider">
                        Tentang Kami
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 mb-6">
                        Apa Itu Kopi TIMES?
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Kopi TIMES (Kolom Opini) adalah kanal khusus di TIMES Indonesia yang menjadi ruang bagi pemikiran segar, analisis tajam, dan sudut pandang baru dari masyarakat.
                    </p>
                </div>

                {/* Why Write Section */}
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        <Coffee className="w-4 h-4" />
                        Mengapa Menulis di Kopi TIMES?
                    </div>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {values.map((value, index) => (
                        <Card className="card bg-base-100 ">
                            <div className="w-12 h-12 rounded-lg  bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                                <value.icon className="w-6 h-6 text-primary-content" />
                            </div>
                            <h3 className="font-serif text-xl font-semibold mb-3">{value.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {value.description}
                            </p>
                        </Card>
                    ))}
                </div>

                {/* Mission Statement */}
                <div className="mt-20 max-w-4xl mx-auto">
                    <Card className="relative bg-card rounded-2xl p-8 md:p-12 border border-border overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64  bg-gradient-to-br from-primary to-accent opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <Coffee className="w-6 h-6 text-primary" />
                                <span className="text-sm font-medium text-primary uppercase tracking-wider">
                                    Ruang Diskusi Intelektual
                                </span>
                            </div>
                            <blockquote className="font-serif text-xl md:text-2xl italic text-center leading-relaxed mb-6">
                                "Kopi TIMES hadir sebagai wadah bagi para pemikir Indonesia untuk menyuarakan
                                gagasan segar yang menginspirasi dan membangun bangsa."
                            </blockquote>
                            <div className="text-center">
                                <div className="w-16 h-1 hero-gradient mx-auto rounded-full mb-4" />
                                <p className="text-muted-foreground text-sm">
                                    Tim Kopi TIMES - TIMES Indonesia
                                </p>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </section>
    );
};

export default AboutSection;
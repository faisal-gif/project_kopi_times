import Card from "@/Components/Card";
import { Heart, Shield, Lightbulb, Globe } from "lucide-react";

const AboutSection = () => {
    const values = [
        {
            icon: Heart,
            title: "Jurnalisme Positif",
            description:
                "Kami percaya kekuatan kata-kata dapat menginspirasi perubahan. Setiap artikel di AJP harus membawa dampak positif bagi pembaca.",
        },
        {
            icon: Shield,
            title: "Kredibel & Terpercaya",
            description:
                "Setiap artikel melalui proses moderasi untuk memastikan kualitas dan kebenaran informasi yang disampaikan.",
        },
        {
            icon: Lightbulb,
            title: "Ide Tanpa Batas",
            description:
                "Platform terbuka bagi siapa saja yang ingin berbagi ide, cerita, dan pengetahuan yang bermanfaat.",
        },
        {
            icon: Globe,
            title: "Jangkauan Luas",
            description:
                "Tulisanmu akan dibaca oleh ribuan pembaca dari seluruh Indonesia yang mencari konten berkualitas.",
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
                        Mengapa Memilih AJP?
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        AJP hadir sebagai wadah bagi para penulis Indonesia untuk menyuarakan
                        cerita-cerita positif yang menginspirasi dan membangun bangsa.
                    </p>
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
    );
};

export default AboutSection;
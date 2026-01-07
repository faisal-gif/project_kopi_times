import { Edit3, Image, Tags, MessageCircle, BarChart3, Award } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Edit3,
      title: "Editor Intuitif",
      description: "Tulis artikel dengan editor yang mudah digunakan, mendukung format teks kaya dan pratinjau langsung.",
    },
    {
      icon: Image,
      title: "Gambar Cover",
      description: "Tambahkan gambar cover yang menarik untuk membuat artikelmu lebih menonjol dan memikat pembaca.",
    },
    {
      icon: Tags,
      title: "Kategori & Tags",
      description: "Organisir artikelmu dengan kategori dan tags agar mudah ditemukan oleh pembaca yang tepat.",
    },
    {
      icon: MessageCircle,
      title: "Sistem Komentar",
      description: "Berinteraksi dengan pembaca melalui kolom komentar yang dimoderasi untuk diskusi yang sehat.",
    },
    {
      icon: BarChart3,
      title: "Statistik Artikel",
      description: "Pantau performa artikelmu dengan data jumlah pembaca, likes, dan engagement.",
    },
    {
      icon: Award,
      title: "Badge Penulis",
      description: "Dapatkan badge eksklusif berdasarkan tier membership dan kontribusimu di platform.",
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Fitur Platform
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 mb-6">
            Semua yang Kamu Butuhkan
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Fitur lengkap untuk mendukung perjalanan menulismu, dari pembuatan 
            artikel hingga interaksi dengan pembaca.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

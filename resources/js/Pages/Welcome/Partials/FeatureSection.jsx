import { Pen, BookOpen, Users, Lightbulb, Clock, FileCheck } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: FileCheck,
      title: "Orisinal",
      description: "Asli, bukan plagiasi, bukan saduran, bukan terjemahan, bukan sekadar kompilasi, bukan rangkuman pendapat atau buku orang lain.",
    },
    {
      icon: Clock,
      title: "Eksklusif",
      description: "Belum pernah dimuat di media atau penerbitan lain termasuk Blog, dan juga tidak dikirim bersamaan ke media atau penerbitan lain.",
    },
    {
      icon: Lightbulb,
      title: "Aktual & Relevan",
      description: "Topik yang diuraikan adalah sesuatu yang aktual, relevan, dan menjadi persoalan dalam masyarakat.",
    },
    {
      icon: Users,
      title: "Kepentingan Umum",
      description: "Substansi yang dibahas menyangkut kepentingan umum, bukan kepentingan komunitas tertentu.",
    },
    {
      icon: BookOpen,
      title: "Perspektif Baru",
      description: "Artikel mengandung hal baru yang belum pernah dikemukakan penulis lain, baik informasi, pandangan, pencerahan, pendekatan, saran, maupun solusinya.",
    },
    {
      icon: Pen,
      title: "Bahasa Populer",
      description: "Penyajian tidak berkepanjangan, menggunakan bahasa populer/luwes yang mudah ditangkap. Maksimal 4.000 karakter atau sekitar 600 kata. Ditulis satu orang.",
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Kriteria Tulisan
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 mb-6">
            Kriteria Tulisan yang Kami Cari
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Pastikan tulisan Anda memenuhi kriteria berikut untuk dapat dimuat
            di Kopi TIMES.
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

import Card from "@/Components/Card";
import { formatDuration, formatRupiah } from "@/Utils/formatter";
import { Link, usePage } from "@inertiajs/react";
// Tambahkan icon Gift untuk mempresentasikan item tambahan
import { Check, Sparkles, Gift } from "lucide-react"; 

const PricingSection = ({ newsPackages }) => {

    return (
        <section id="pricing" className="py-24 bg-muted/50">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="max-w-2xl mx-auto text-center mb-16">
                    <span className="text-sm font-medium text-primary uppercase tracking-wider">
                        Langkah Mudah
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 mb-6">
                        Siap Menyeduh Ide Anda?
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Jangan biarkan gagasan cemerlang Anda menguap begitu saja. Jadilah bagian dari suara perubahan hari ini.
                    </p>
                </div>

                {/* Steps */}
                <div className="max-w-2xl mx-auto mb-16">
                    <div className="bg-card rounded-xl border border-border p-6 text-center">
                        <h3 className="font-serif text-xl font-semibold mb-3">Langkah Mudah Menjadi Penulis</h3>
                        <p className="text-muted-foreground">
                            Siapkan naskah, unggah dengan mendaftar sebagai membership penulis.
                        </p>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div
                    className={`grid gap-8 max-w-7xl mx-auto
                            ${newsPackages.length === 1
                            ? "grid-cols-1 justify-items-center"
                            : "grid-cols-1 md:grid-cols-4"
                        }
                `}>
                    {newsPackages.map((plan) => (
                        <Card
                            key={plan.name}
                            className={`relative bg-base-100 rounded-2xl border p-8 flex flex-col
                                    ${newsPackages.length === 1 ? "w-full max-w-md" : ""}
                                    ${plan.popular
                                    ? "border-primary shadow-lg scale-105 z-10"
                                    : "border-border"
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular ? (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <div className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-br from-primary to-accent text-primary-content text-sm font-medium">
                                        <Sparkles className="w-3 h-3" />
                                        Paling Populer
                                    </div>
                                </div>
                            ) : null}

                            {/* Plan Header */}
                            <div className="text-center mb-6">
                                <h3 className="font-serif text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="mb-2">
                                    <span className="font-serif text-xl font-bold">{formatRupiah(plan.price)}</span>
                                    <br />
                                    <span className="text-muted-foreground text-sm ml-1">/ {plan.period} {plan.jenis_periode}</span>
                                </div>
                                {/* Pastikan plan.feature.description ada, kalau tidak gunakan property lain */}
                                <p className="text-muted-foreground text-sm">{plan.description}</p>
                            </div>

                            {/* Features */}
                            <div className="flex-1 space-y-3 mb-8">
                                {/* Menampilkan Fasilitas Utama */}
                                {plan.feature && plan.feature.keunggulan && plan.feature.keunggulan.map((feature) => (
                                    <div key={feature} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <span className="text-sm">{feature}</span>
                                    </div>
                                ))}

                                {/* Menampilkan Items Lainnya (Bonus/Merchandise/Layanan Digital) */}
                                {plan.items_lainnya && plan.items_lainnya.length > 0 && (
                                    <>
                                        <div className="my-4 border-t border-border pt-4">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                                Bonus & Ekstra
                                            </p>
                                            <div className="space-y-3">
                                                {plan.items_lainnya.map((item) => (
                                                    <div key={item.id} className="flex items-start gap-3">
                                                        {/* Menggunakan icon Gift untuk item tambahan */}
                                                        <Gift className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                                        <span className="text-sm">
                                                            {/* Tampilkan qty jika lebih dari 1, contoh: 2x Tumbler */}
                                                            {item.qty > 1 ? <span className="font-semibold">{item.qty}x </span> : ""}
                                                            {item.nama_item}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* CTA */}
                            <Link 
                                className="btn btn-primary w-full" 
                                href={plan.level === 2 ? `/checkout?package_id=${plan.id}` : "/register"}
                            >
                                Pilih
                            </Link>
                        </Card>
                    ))}
                </div>

                {/* FAQ Hint */}
                <p className="text-center text-muted-foreground text-sm mt-12">
                    Punya pertanyaan? Hubungi tim kami di{" "}
                    <a href="mailto:redaksi@timesindonesia.co.id" className="text-primary hover:underline">
                        redaksi@timesindonesia.co.id
                    </a>
                </p>
            </div>
        </section>
    );
};

export default PricingSection;
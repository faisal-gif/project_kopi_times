import LandingLayout from '@/Layouts/LandingLayout'
import { Head } from '@inertiajs/react'
import React from 'react'
import Card from "@/Components/Card";
import { formatDuration, formatRupiah } from "@/Utils/formatter";
import { Link } from "@inertiajs/react";
import { Check, Sparkles, Gift } from "lucide-react"; // Jangan lupa import Gift

function Index({ newsPackages }) {

    // Fallback data untuk Level 1 jika data feature dari database kosong/tidak terbaca
    const defaultLevel1Features = [
        "Dapat member card penulis",
        "Dapat Akun CMS akses",
        "Mendapatkan Kouta menulis",
        "Jangkauan audience luas"
    ];

    return (
        <>
            <Head title='Harga' />
            <LandingLayout>
                <section id="pricing" className="py-24 bg-muted/50">
                    <div className="container mx-auto px-4">
                        {/* Header */}
                        <div className="max-w-2xl mx-auto text-center mb-16">
                            <span className="text-sm font-medium text-primary uppercase tracking-wider">
                                Harga
                            </span>
                            <h2 className="font-serif text-3xl md:text-4xl font-bold mt-3 mb-6">
                                Pilih Paket yang Tepat
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Mulai gratis dan upgrade kapan saja sesuai kebutuhanmu.
                                Semua paket termasuk akses penuh ke platform.
                            </p>
                        </div>

                        {/* Pricing Cards */}
                        <div
                            className={`grid gap-8 max-w-5xl mx-auto
                            ${newsPackages.length === 1
                                    ? "grid-cols-1 justify-items-center"
                                    : "grid-cols-1 md:grid-cols-3"
                                }
                `}>
                            {newsPackages.map((plan) => {
                                // Menyiapkan array keunggulan khusus untuk level 1
                                const level1Features = plan.feature?.keunggulan || defaultLevel1Features;

                                return (
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
                                        {plan.popular === 1 && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                                <div className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full  bg-gradient-to-br from-primary to-accent text-primary-content text-sm font-medium">
                                                    <Sparkles className="w-3 h-3" />
                                                    Paling Populer
                                                </div>
                                            </div>
                                        )}

                                        {/* Plan Header */}
                                        <div className="text-center mb-6">
                                            <h3 className="font-serif text-2xl font-bold mb-2">{plan.name}</h3>
                                            <div className="mb-2">
                                                <span className="font-serif text-2xl font-bold">{formatRupiah(plan.price)}</span>
                                                <span className="text-muted-foreground text-sm ml-1">/ {plan.jenis_periode ? `${plan.period} ${plan.jenis_periode}` : formatDuration(plan.period)}</span>
                                            </div>
                                            {plan.description && (
                                                <p className="text-muted-foreground text-sm">{plan.description}</p>
                                            )}
                                        </div>

                                        {/* Features List */}
                                        <div className="flex-1 space-y-3 mb-8">
                                            {plan.level === 1 ? (
                                                // TAMPILAN KHUSUS LEVEL 1
                                                <>
                                                    {level1Features.map((feature, idx) => (
                                                        <div key={idx} className="flex items-start gap-3">
                                                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                            <span className="text-sm">{feature}</span>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                // TAMPILAN UNTUK LEVEL 2 (Menarik data dari database real)
                                                <>
                                                    {plan.quota > 0 && (
                                                        <div className="flex items-start gap-3">
                                                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                            <span className="text-sm">Quota: {plan.quota}</span>
                                                        </div>
                                                    )}

                                                    {plan.feed_instagram > 0 && (
                                                        <div className="flex items-start gap-3">
                                                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                            <span className="text-sm">Feed Instagram: {plan.feed_instagram}x</span>
                                                        </div>
                                                    )}

                                                    {plan.ekoran > 0 && (
                                                        <div className="flex items-start gap-3">
                                                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                            <span className="text-sm">Ekoran: {plan.ekoran}</span>
                                                        </div>
                                                    )}

                                                    {plan.wa_channel > 0 && (
                                                        <div className="flex items-start gap-3">
                                                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                            <span className="text-sm">Whatsapp Channel: {plan.wa_channel}</span>
                                                        </div>
                                                    )}

                                                    {/* Menampilkan Items Tambahan dari Tabel items_lainnya */}
                                                    {plan.items_lainnya && plan.items_lainnya.length > 0 && (
                                                        <div className="my-4 border-t border-border pt-4">
                                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                                                Bonus & Tambahan
                                                            </p>
                                                            <div className="space-y-3">
                                                                {plan.items_lainnya.map((item) => (
                                                                    <div key={item.id} className="flex items-start gap-3">
                                                                        <Gift className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                                                        <span className="text-sm">
                                                                            {item.qty > 1 ? <span className="font-semibold">{item.qty}x </span> : ""}
                                                                            {item.nama_item}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* CTA */}
                                        <Link
                                            className="btn btn-primary w-full mt-auto"
                                            href={plan.level === 2 ? `/checkout?package_id=${plan.id}` : "/register"}
                                        >
                                            Pilih
                                        </Link>

                                    </Card>
                                );
                            })}
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
            </LandingLayout>
        </>
    )
}

export default Index
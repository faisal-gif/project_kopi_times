import LandingLayout from '@/Layouts/LandingLayout'
import { Head } from '@inertiajs/react'
import React from 'react'
import Card from "@/Components/Card";
import { formatDuration, formatRupiah } from "@/Utils/formatter";
import { Link } from "@inertiajs/react";
import { Check, Sparkles } from "lucide-react";

function Index({ newsPackages }) {
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
                                    {plan.popular && (
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
                                            <span className="text-muted-foreground text-sm ml-1">/ {formatDuration(plan.period)}</span>
                                        </div>
                                        <p className="text-muted-foreground text-sm">{plan.description}</p>
                                    </div>

                                    {/* Features */}
                                    <div className="flex-1 space-y-3 mb-8">
                                        {plan.feature.keunggulan.map((feature) => (
                                            <div key={feature} className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                <span className="text-sm">{feature}</span>
                                            </div>
                                        ))}
                                        {/* {plan.limitations.map((limitation) => (
                                    <div key={limitation} className="flex items-start gap-3 opacity-50">
                                        <Check className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                        <span className="text-sm">{limitation}</span>
                                    </div>
                                ))} */}
                                    </div>

                                    {/* CTA */}

                                    <Link className="btn btn-primary" href="/register">Pilih</Link>

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
            </LandingLayout>
        </>

    )
}

export default Index
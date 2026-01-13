import Alert from '@/Components/Alert';
import { Link } from '@inertiajs/react'
import { ArrowRight, PenLine, Users, TrendingUp } from "lucide-react";
import React from 'react'

function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center pt-6 overflow-hidden">

            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-10" />
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            <div className="container mx-auto px-4 py-20 relative z-10">



                <div className="max-w-4xl mx-auto text-center">
                    {/* <Alert className='mb-8' type='warning' title={'Pengumuman'} message={'Pengumuman sistem pembayaran sedang maintenance mohon maaf atas ketidaknyamanannya'} /> */}
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-200 text-primary text-sm font-medium mb-8 animate-fade-in">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Platform Jurnalisme Terdepan di Indonesia
                    </div>

                    {/* Headline */}
                    <h1
                        className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 animate-fade-in"
                        style={{ animationDelay: "0.1s" }}
                    >
                        Menulis untuk {" "}
                        <span className="text-primary">Indonesia</span>
                    </h1>

                    {/* Subheadline */}
                    <p
                        className="text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in"
                        style={{ animationDelay: "0.2s" }}
                    >
                        Membership Penulis Kopi TIMES adalah program keanggotaan bagi penulis yang ingin terlibat aktif dalam ekosistem gagasan di TIMES Indonesia. Program ini dirancang bukan sekadar untuk memuat tulisan, tetapi untuk menumbuhkan penulis, memperkuat kualitas gagasan, dan memperluas dampak pemikiran ke ruang publik.
                    </p>

                    {/* CTA Buttons */}
                    <div
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in"
                        style={{ animationDelay: "0.3s" }}
                    >

                        <Link href="/register" className="btn btn-primary rounded-lg flex items-center justify-center">
                            Mulai Menulis
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>

                    </div>

                    {/* Stats */}
                    <div
                        className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in"
                        style={{ animationDelay: "0.4s" }}
                    >
                        {[
                            { icon: PenLine, value: "10K+", label: "Artikel" },
                            { icon: Users, value: "5K+", label: "Penulis" },
                            { icon: TrendingUp, value: "1M+", label: "Pembaca" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <stat.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                                <div className="font-serif text-2xl md:text-3xl font-bold text-base-content">
                                    {stat.value}
                                </div>
                                <div className="text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>
    )
}

export default HeroSection
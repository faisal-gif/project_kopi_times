import Card from '@/Components/Card'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { formatDuration, formatRupiah } from '@/Utils/formatter'
import { Head, Link, usePage } from '@inertiajs/react'
import { Check, Sparkles } from 'lucide-react'
import React from 'react'

function Index({ newsPackages, newsSatuan, userPackage }) {
    const { auth } = usePage().props;
    const user = auth.user;
    return (
        <>
            <Head title='Membership' />
            <AuthenticatedLayout>
                <section id="pricing" className="py-6 bg-muted/50">

                    <div className="max-w-7xl mx-auto px-4">
                        {/* Title */}
                        <div className='flex flex-row justify-between items-center mb-6'>
                            {/* start Header */}
                            <div>
                                <h1 className="text-3xl font-bold text-foreground mb-2">Upgrade Membership</h1>
                                <p className='text-sm font-extralight text-base-content/60'>Pilih paket yang sesuai dengan kebutuhan Anda untuk mendapatkan lebih banyak fitur</p>
                            </div>
                            {/* end Header */}

                            {/* start breadcrumbs */}
                            <div className="breadcrumbs text-sm">
                                <ul>
                                    <li><a>Home</a></li>
                                    <li>Subscription</li>
                                </ul>
                            </div>
                            {/* end breadcrumbs */}

                        </div>

                        {/* My Plan */}
                        <Card className="border-primary/80 bg-primary/20 px-4 mb-14">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <div>
                                        <div className="font-extralight text-base-content/60">
                                            Paket Anda Saat Ini
                                        </div>
                                        <span className="text-lg font-bold">{userPackage.name}</span>
                                    </div>

                                    <span className="font-semibold text-primary">
                                        {
                                            user.status == 1 ? 'Aktif' : 'Non Aktif'
                                        }
                                    </span>
                                </div>
                            </div>

                        </Card>
                        <div className='flex flex-col max-w-5xl mx-auto gap-4'>
                            <h2 className='text-2xl font-bold'>Add Ons</h2>
                            {/* Pricing Cards */}
                            <div
                                className={`grid gap-8 grid-cols-1 md:grid-cols-3`}>
                                {newsSatuan.map((plan) => (
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
                                                <span className="font-serif text-xl font-bold">{formatRupiah(plan.price)}</span>
                                                <span className="text-muted-foreground text-sm ml-1">/ {plan.period} {plan.jenis_periode}</span>
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

                                        <Link className="btn btn-primary" href={"/checkout?package_id=" + plan.id}>Pilih</Link>

                                    </Card>



                                ))}
                            </div>
                        </div>

                        {/* Pricing Cards */}
                        <div className='flex flex-col gap-4  max-w-5xl mx-auto'>
                            <h2 className='text-2xl font-bold'>Paket</h2>
                            <div
                                className={`grid gap-8 
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
                                                <span className="font-serif text-xl font-bold">{formatRupiah(plan.price)}</span>
                                                <span className="text-muted-foreground text-sm ml-1">/ {plan.period} {plan.jenis_periode}</span>
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

                                        <Link className="btn btn-primary" href={"/checkout?package_id=" + plan.id}>Pilih</Link>

                                    </Card>



                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </AuthenticatedLayout>
        </>

    )
}

export default Index
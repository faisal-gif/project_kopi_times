import Card from '@/Components/Card'
import { formatDuration, formatRupiah } from '@/Utils/formatter';
import { Head, Link, useForm, usePage } from '@inertiajs/react'
import { Check, Clock, Mail, MessageCircle, Phone } from 'lucide-react'
import React from 'react'

export default function Index({ channel, newsPackage }) {

    const { auth } = usePage().props;
    const user = auth.user;

    const { data, setData, post, processing, errors } = useForm({
        paymentMethod: 'BRIVA',
        package_id: newsPackage.id,
    });

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     post(route('account.pending.payment'));
    // }
    return (
        <>
            <Head title='Konfirmasi Akun' />
            <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">

                <div className='max-w-3xl mx-auto space-y-6'>
                    {/* Success message */}
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <Check className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-foreground">Pendaftaran Berhasil!</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Akun Anda dengan email <span className="font-medium text-foreground">{user.email}</span> telah dibuat.
                                    Selesaikan pembayaran untuk mengaktifkan paket {newsPackage.name}.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Card */}
                    <Card className="w-full">

                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="p-6 border-b border-border">
                                <h3 className="text-xl font-bold mb-6">Ringkasan Pesanan</h3>

                                <div className="flex items-center justify-between p-4 bg-base-300/50 rounded-xl">
                                    <div>
                                        <span className="font-semibold">Paket {newsPackage.name}</span>
                                        {/* <p className="text-sm text-muted-foreground">{plan.description}</p> */}
                                    </div>
                                    <div className="text-right">
                                        <span className=" text-xl font-bold">{formatRupiah(newsPackage.price)}</span>
                                        <p className="text-xs text-muted-foreground">{formatDuration(newsPackage.period)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                    <span className="font-semibold">Total Pembayaran</span>
                                    <span className="text-2xl font-bold text-primary">{formatRupiah(newsPackage.price)}</span>
                                </div>
                            </div>


                            <div className="bg-base-100">
                                <div className="card-body">
                                    <h3 className="text-xl font-bold mb-6">Metode Pembayaran</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {channel.map(method => (
                                            <label key={method.code} className="cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="payment-method"
                                                    value={method.code}
                                                    onChange={(e) => setData('paymentMethod', e.target.value)}
                                                    className="sr-only"
                                                    checked={data.paymentMethod === method.code}
                                                />
                                                <div className={`border-2 rounded-lg p-4 transition-colors ${data.paymentMethod === method.code ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-primary/50'}`}>
                                                    <div className="flex flex-col items-center gap-2">
                                                        <img src={method.icon_url} className="w-16" alt={method.name} />
                                                        <span className="text-sm text-primary">{method.name}</span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <form
                                method="POST"
                                action={route('checkout.payment')}
                            >
                                <input
                                    type="hidden"
                                    name="_token"
                                    value={document
                                        .querySelector('meta[name="csrf-token"]')
                                        .getAttribute('content')}
                                />
                                <input type="hidden" name="paymentMethod" value={data.paymentMethod} />
                                <input type="hidden" name="package_id" value={data.package_id} />
                                <button type="submit" className="btn btn-primary w-full mt-6" disabled={processing}>
                                    Bayar Sekarang
                                </button>
                            </form>
                            <div className="bg-base-300 rounded-lg p-4 text-left space-y-3">
                                <p className="text-sm font-medium text-foreground">
                                    Hubungi admin untuk pertanyaan lebih lanjut mengenai pembayaran atau paket berlangganan.
                                </p>

                                <div className="space-y-2">
                                    <a
                                        href="mailto:admin@portalberita.com"
                                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Mail className="h-4 w-4" />
                                        admin@portalberita.com
                                    </a>

                                    <a
                                        href="tel:+6281234567890"
                                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <Phone className="h-4 w-4" />
                                        +62 812-3456-7890
                                    </a>

                                    <a
                                        href="https://wa.me/6281234567890"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        WhatsApp: +62 812-3456-7890
                                    </a>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground mt-8">
                                Setelah pembayaran dikonfirmasi, Anda akan dapat mengakses dashboard dan mulai menulis artikel.
                            </p>

                            <div className="pt-2">
                                <Link href="/" className='btn w-full'>Kembali ke Beranda</Link>
                            </div>
                        </div>
                    </Card>
                </div>

            </div>
        </>
    )
}

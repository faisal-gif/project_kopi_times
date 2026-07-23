import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate } from '@/Utils/formatter';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Boxes, CheckCircle, Clock, Copy, ExternalLink, MapPin,
    Package, PackageCheck, Receipt, Truck, XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { STATUS_META, StatusBadge } from './Index';

const TIMELINE = [
    { key: 'pending', label: 'Pesanan Dibuat', desc: 'Paket sedang menunggu diproses admin.', icon: Clock },
    { key: 'processing', label: 'Sedang Disiapkan', desc: 'Merchandise sedang dikemas.', icon: Boxes },
    { key: 'shipped', label: 'Dalam Pengiriman', desc: 'Paket sudah diserahkan ke kurir.', icon: Truck },
    { key: 'delivered', label: 'Sudah Diterima', desc: 'Paket sampai di alamat tujuan.', icon: PackageCheck },
];

export default function Show({ shipment }) {
    const [copied, setCopied] = useState(false);
    const isCancelled = shipment.status === 'cancelled';
    const currentIndex = TIMELINE.findIndex((t) => t.key === shipment.status);

    const copyResi = () => {
        navigator.clipboard.writeText(shipment.tracking_number);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const confirmReceived = () => {
        if (confirm('Konfirmasi bahwa paket sudah Anda terima?')) {
            router.patch(route('merchandise.received', shipment.id), {}, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Detail Pengiriman</h2>}
        >
            <Head title={`Paket — ${shipment.item_name}`} />

            <div className="space-y-6">

                <Link href={route('merchandise.index')} className="btn btn-ghost btn-sm gap-1">
                    <ArrowLeft size={15} /> Kembali
                </Link>

                <Card className="border-base-200 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Merchandise</p>
                            <h3 className="text-xl font-bold text-foreground">{shipment.item_name}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Dibuat {formatDate(shipment.created_at)}
                            </p>
                        </div>
                        <StatusBadge status={shipment.status} />
                    </div>

                    {shipment.tracking_number && (
                        <div className="mt-5 rounded-xl border border-base-200 bg-base-200/50 p-4">
                            <p className="text-xs text-muted-foreground">Nomor Resi {shipment.courier && `(${shipment.courier})`}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="font-mono text-lg font-bold tracking-wide text-foreground">
                                    {shipment.tracking_number}
                                </span>
                                <button onClick={copyResi} className="btn btn-ghost btn-xs gap-1">
                                    {copied ? <CheckCircle size={13} className="text-green-600" /> : <Copy size={13} />}
                                    {copied ? 'Tersalin' : 'Salin'}
                                </button>
                                <a href={shipment.tracking_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-xs gap-1">
                                    Lacak <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    )}

                    {shipment.shipping_address && (
                        <div className="mt-4 flex items-start gap-3 rounded-xl border border-base-200 p-4">
                            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                            <div>
                                <p className="text-sm font-semibold text-foreground">Alamat Pengiriman</p>
                                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                    {shipment.shipping_address}
                                </p>
                            </div>
                        </div>
                    )}

                    {shipment.payment && (
                        <div className="mt-4 rounded-xl border border-base-200 p-4">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-primary" />
                                <p className="text-sm font-semibold text-foreground">Pembayaran Terkait</p>
                            </div>
                            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <dt className="text-muted-foreground">Kode Transaksi</dt>
                                <dd className="text-right font-mono text-foreground">{shipment.payment.merchant_ref}</dd>

                                <dt className="text-muted-foreground">Metode</dt>
                                <dd className="text-right text-foreground">{shipment.payment.method ?? '-'}</dd>

                                <dt className="text-muted-foreground">Total</dt>
                                <dd className="text-right font-semibold text-foreground">
                                    Rp {Number(shipment.payment.total_amount ?? 0).toLocaleString('id-ID')}
                                </dd>

                                <dt className="text-muted-foreground">Dibayar</dt>
                                <dd className="text-right text-foreground">
                                    {shipment.payment.paid_at ? formatDate(shipment.payment.paid_at) : '-'}
                                </dd>
                            </dl>
                        </div>
                    )}

                    {shipment.note && (
                        <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">{shipment.note}</p>
                    )}
                </Card>

                <Card className="border-base-200 shadow-sm">
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                        <Package className="h-5 w-5 text-primary" /> Status Pengiriman
                    </h3>

                    {isCancelled ? (
                        <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-700">
                            <XCircle className="h-6 w-6 shrink-0" />
                            <div>
                                <p className="font-bold">Pengiriman Dibatalkan</p>
                                <p className="text-sm opacity-80">Hubungi admin untuk informasi lebih lanjut.</p>
                            </div>
                        </div>
                    ) : (
                        <ol className="relative space-y-6 border-l-2 border-base-200 pl-6">
                            {TIMELINE.map((step, i) => {
                                const done = i <= currentIndex;
                                const active = i === currentIndex;
                                const Icon = step.icon;
                                const time =
                                    step.key === 'shipped' ? shipment.shipped_at :
                                        step.key === 'delivered' ? shipment.delivered_at :
                                            step.key === 'pending' ? shipment.created_at : null;

                                return (
                                    <li key={step.key} className="relative">
                                        <span
                                            className={`absolute -left-[35px] grid h-8 w-8 place-items-center rounded-full ring-4 ring-base-100 ${done ? 'bg-primary text-primary-content' : 'bg-base-200 text-muted-foreground'
                                                }`}
                                        >
                                            <Icon size={15} />
                                        </span>
                                        <p className={`font-semibold ${done ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {step.label}
                                            {active && <span className="ml-2 badge badge-primary badge-xs">Saat ini</span>}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{step.desc}</p>
                                        {done && time && (
                                            <p className="mt-0.5 text-xs text-muted-foreground/70">{formatDate(time)}</p>
                                        )}
                                    </li>
                                );
                            })}
                        </ol>
                    )}

                    {shipment.status === 'shipped' && (
                        <button onClick={confirmReceived} className="btn btn-primary mt-6 w-full gap-2">
                            <PackageCheck size={16} /> Paket Sudah Saya Terima
                        </button>
                    )}

                    {shipment.status === 'delivered' && (
                        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-green-100 py-3 text-green-700">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-bold">
                                Paket diterima {shipment.delivered_at && formatDate(shipment.delivered_at)}
                            </span>
                        </div>
                    )}
                </Card>



            </div>
        </AuthenticatedLayout>
    );
}
import ApplicationLogo from '@/Components/ApplicationLogo';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDateTime, formatRupiah } from '@/Utils/formatter';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { StatusBadge } from '@/Pages/Payments/Index';

function Row({ label, value, strong = false }) {
    return (
        <div className="flex items-center justify-between py-1.5">
            <span className={strong ? 'font-semibold text-foreground' : 'text-muted-foreground'}>{label}</span>
            <span className={strong ? 'font-bold text-foreground' : 'text-foreground'}>{value}</span>
        </div>
    );
}

export default function Invoice({ payment }) {
    const pkg = payment.news_package ?? payment.newsPackage;
    const user = payment.user;
    const grandTotal = payment.total_amount ?? payment.amount;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Invoice</h2>}
        >
            <Head title={`Invoice ${payment.merchant_ref}`} />

            {/* Print: sembunyikan chrome layout, tampilkan hanya invoice */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #invoice, #invoice * { visibility: visible; }
                    #invoice { position: absolute; inset: 0; margin: 0; box-shadow: none; border: none; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="mx-auto max-w-2xl space-y-4">
                <div className="no-print flex items-center justify-between">
                    <Link href={route('payments.index')} className="btn btn-ghost btn-sm gap-2">
                        <ArrowLeft size={16} /> Kembali
                    </Link>
                    <button onClick={() => window.print()} className="btn btn-primary btn-sm gap-2">
                        <Printer size={16} /> Cetak / Simpan PDF
                    </button>
                </div>

                <div id="invoice" className="rounded-2xl border border-base-200 bg-white p-8 shadow-sm">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-base-200 pb-6">
                        <div>
                            <ApplicationLogo className="mb-2 h-8" />
                            <p className="text-xs text-muted-foreground">Kopi TIMES · TIMES Indonesia</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-2xl font-bold text-primary">INVOICE</h3>
                            <p className="text-sm font-medium text-foreground">{payment.merchant_ref}</p>
                            <div className="mt-1"><StatusBadge status={payment.status} /></div>
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-4 py-6 text-sm">
                        <div>
                            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Ditagihkan kepada</p>
                            <p className="font-semibold text-foreground">{user?.nama ?? '-'}</p>
                            <p className="text-muted-foreground">{user?.email}</p>
                        </div>
                        <div className="text-right">
                            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Tanggal</p>
                            <p className="text-foreground">{formatDateTime(payment.created_at)}</p>
                            {payment.paid_at && (
                                <>
                                    <p className="mb-1 mt-2 text-xs uppercase tracking-wide text-muted-foreground">Dibayar</p>
                                    <p className="text-foreground">{formatDateTime(payment.paid_at)}</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Item */}
                    <div className="rounded-xl bg-base-200/50 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-foreground">{pkg?.name ?? 'Paket'}</p>
                                {pkg?.period && (
                                    <p className="text-xs text-muted-foreground">
                                        Periode: {pkg.period} {pkg.jenis_periode}
                                    </p>
                                )}
                            </div>
                            <span className="font-semibold text-foreground">{formatRupiah(payment.amount)}</span>
                        </div>
                    </div>

                    {/* Rincian */}
                    <div className="mt-4 border-t border-base-200 pt-4 text-sm">
                        <Row label="Subtotal" value={formatRupiah(payment.amount)} />
                        {payment.fee_customer != null && (
                            <Row label="Biaya Admin" value={formatRupiah(payment.fee_customer)} />
                        )}
                        <div className="mt-2 border-t border-base-200 pt-2">
                            <Row label="Total" value={formatRupiah(grandTotal)} strong />
                        </div>
                    </div>

                    {/* Info pembayaran */}
                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-base-200 pt-4 text-sm">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Metode</p>
                            <p className="font-medium text-foreground">{payment.method ?? '-'}</p>
                        </div>
                        {payment.reference && (
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Referensi</p>
                                <p className="font-medium text-foreground">{payment.reference}</p>
                            </div>
                        )}
                    </div>

                    <p className="mt-8 text-center text-xs text-muted-foreground">
                        Terima kasih atas pembayaran Anda. Invoice ini sah dan diproses otomatis oleh sistem.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatRupiah } from '@/Utils/formatter';
import { Head, Link } from '@inertiajs/react';
import {
    Receipt, CheckCircle2, Clock, XCircle, RotateCcw, ChevronRight, ListChecks,
} from 'lucide-react';

export const STATUS_META = {
    pending: { label: 'Menunggu Pembayaran', icon: Clock, badge: 'badge-warning', tone: 'bg-orange-100 text-orange-700' },
    paid: { label: 'Lunas', icon: CheckCircle2, badge: 'badge-success', tone: 'bg-green-100 text-green-700' },
    failed: { label: 'Gagal', icon: XCircle, badge: 'badge-error', tone: 'bg-red-100 text-red-700' },
    expired: { label: 'Kedaluwarsa', icon: XCircle, badge: 'badge-ghost', tone: 'bg-base-200 text-foreground' },
    refunded: { label: 'Dikembalikan', icon: RotateCcw, badge: 'badge-info', tone: 'bg-blue-100 text-blue-700' },
};

export function StatusBadge({ status }) {
    const meta = STATUS_META[status] ?? STATUS_META.pending;
    const Icon = meta.icon;
    return (
        <span className={`badge ${meta.badge} badge-sm gap-1 whitespace-nowrap`}>
            <Icon size={11} /> {meta.label}
        </span>
    );
}

function StatCard({ icon: Icon, label, value, tone }) {
    return (
        <Card className="border-base-200 shadow-sm">
            <div className="flex items-center gap-4">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tone}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                    <p className="text-2xl font-bold leading-none text-foreground">{value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                </div>
            </div>
        </Card>
    );
}

export default function Index({ payments = [], summary }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Riwayat Transaksi</h2>}
        >
            <Head title="Riwayat Transaksi" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard icon={ListChecks} label="Total Transaksi" value={summary.total} tone="bg-primary/10 text-primary" />
                    <StatCard icon={CheckCircle2} label="Lunas" value={summary.paid} tone="bg-green-100 text-green-700" />
                    <StatCard icon={Clock} label="Menunggu Bayar" value={summary.pending} tone="bg-orange-100 text-orange-700" />
                </div>

                <Card className="border-base-200 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                        <Receipt className="h-5 w-5 text-primary" /> Daftar Transaksi
                    </h3>

                    {payments.length > 0 ? (
                        <div className="divide-y divide-base-200">
                            {payments.map((p) => {
                                const meta = STATUS_META[p.status] ?? STATUS_META.pending;
                                const Icon = meta.icon;
                                return (
                                    <Link
                                        key={p.id}
                                        href={route('payments.show', p.id)}
                                        className="flex items-center gap-4 py-4 transition hover:bg-base-200/40"
                                    >
                                        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${meta.tone}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-foreground">
                                                {p.package_name ?? 'Paket'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(p.created_at)}
                                                {p.merchant_ref && ` • ${p.merchant_ref}`}
                                                {p.method && ` • ${p.method}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-foreground">
                                                {formatRupiah(p.total_amount ?? p.amount)}
                                            </p>
                                            <StatusBadge status={p.status} />
                                        </div>
                                        <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Receipt className="mb-3 h-10 w-10 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">
                                Belum ada transaksi. Riwayat pembayaran paket Anda akan muncul di sini.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

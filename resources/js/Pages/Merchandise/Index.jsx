import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate } from '@/Utils/formatter';
import { Head, Link } from '@inertiajs/react';
import {
    Package, PackageCheck, Truck, ChevronRight, Clock, XCircle, Boxes,
} from 'lucide-react';

export const STATUS_META = {
    pending: { label: 'Menunggu Diproses', icon: Clock, badge: 'badge-ghost', tone: 'bg-base-200 text-foreground' },
    processing: { label: 'Sedang Disiapkan', icon: Boxes, badge: 'badge-warning', tone: 'bg-orange-100 text-orange-700' },
    shipped: { label: 'Dalam Pengiriman', icon: Truck, badge: 'badge-info', tone: 'bg-blue-100 text-blue-700' },
    delivered: { label: 'Sudah Diterima', icon: PackageCheck, badge: 'badge-success', tone: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Dibatalkan', icon: XCircle, badge: 'badge-error', tone: 'bg-red-100 text-red-700' },
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

export default function Index({ shipments = [], summary }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Pengiriman Merchandise</h2>}
        >
            <Head title="Pengiriman Merchandise" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard icon={Package} label="Total Paket" value={summary.total} tone="bg-primary/10 text-primary" />
                    <StatCard icon={Truck} label="Dalam Proses" value={summary.on_going} tone="bg-blue-100 text-blue-700" />
                    <StatCard icon={PackageCheck} label="Sudah Diterima" value={summary.delivered} tone="bg-green-100 text-green-700" />
                </div>

                <Card className="border-base-200 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                        <Package className="h-5 w-5 text-primary" /> Daftar Paket Saya
                    </h3>

                    {shipments.length > 0 ? (
                        <div className="divide-y divide-base-200">
                            {shipments.map((s) => {
                                const meta = STATUS_META[s.status] ?? STATUS_META.pending;
                                const Icon = meta.icon;
                                return (
                                    <Link
                                        key={s.id}
                                        href={route('merchandise.show', s.id)}
                                        className="flex items-center gap-4 py-4 transition hover:bg-base-200/40"
                                    >
                                        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${meta.tone}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-foreground">{s.item_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(s.created_at)}
                                                {s.payment?.merchant_ref && ` • ${s.payment.merchant_ref}`}
                                                {s.tracking_number && ` • Resi: ${s.tracking_number}`}
                                            </p>
                                        </div>
                                        <StatusBadge status={s.status} />
                                        <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Package className="mb-3 h-10 w-10 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">
                                Belum ada paket merchandise. Paket akan muncul di sini setelah dikirim oleh admin.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
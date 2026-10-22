import Card from '@/Components/Card';
import PaginationDaisy from '@/Components/PaginationDaisy';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate, formatRupiah } from '@/Utils/formatter';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle, Banknote, Check, Clock, Copy, Share2, UserPlus, Users, Wallet, XCircle,
} from 'lucide-react';
import { useState } from 'react';

const STATUS_META = {
    accrued: { label: 'Tertahan', badge: 'badge-warning', tone: 'bg-orange-100 text-orange-700', icon: Clock },
    unassigned: { label: 'Tertahan', badge: 'badge-warning', tone: 'bg-orange-100 text-orange-700', icon: Clock },
    approved: { label: 'Siap Dicairkan', badge: 'badge-info', tone: 'bg-blue-100 text-blue-700', icon: Wallet },
    paid: { label: 'Sudah Dibayar', badge: 'badge-success', tone: 'bg-green-100 text-green-700', icon: Check },
    rejected: { label: 'Ditolak', badge: 'badge-ghost', tone: 'bg-base-200 text-foreground', icon: XCircle },
    reversed: { label: 'Dibatalkan', badge: 'badge-ghost', tone: 'bg-base-200 text-foreground', icon: XCircle },
};

const PAYOUT_BADGE = {
    pending: 'badge-warning',
    paid: 'badge-success',
    cancelled: 'badge-ghost',
};

function StatusBadge({ status, label }) {
    const meta = STATUS_META[status] ?? STATUS_META.accrued;
    const Icon = meta.icon;
    return (
        <span className={`badge ${meta.badge} badge-sm gap-1 whitespace-nowrap`}>
            <Icon size={11} /> {label ?? meta.label}
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

function ReferralLink({ url }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="flex-1 truncate rounded-lg bg-base-200 px-4 py-3 text-sm">{url}</code>
            <button type="button" onClick={copy} className="btn btn-primary gap-2">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Tersalin' : 'Salin Link'}
            </button>
        </div>
    );
}

function PendingState({ affiliate }) {
    return (
        <AuthenticatedLayout>
            <Head title="Afiliasi" />

            <Card className="border-base-200 shadow-sm">
                <div className="flex flex-col items-center py-10 text-center">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-100 text-orange-700">
                        <Clock className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold">Pengajuan sedang ditinjau</h3>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                        Terima kasih, {affiliate.name}. Tim kami sedang meninjau pengajuan Anda yang dikirim pada{' '}
                        {formatDate(affiliate.applied_at)}. Link referral dan komisi muncul di halaman ini setelah
                        pengajuan disetujui.
                    </p>
                </div>
            </Card>
        </AuthenticatedLayout>
    );
}

export default function Index({ affiliate, summary, commissions, payouts = [], min_payout }) {
    if (affiliate.status === 'pending') {
        return <PendingState affiliate={affiliate} />;
    }

    const suspended = affiliate.status !== 'active';

    return (
        <AuthenticatedLayout>
            <Head title="Afiliasi" />

            <div className="space-y-6">
                {suspended && (
                    <div className="alert alert-warning">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <span>
                            Status afiliasi Anda: <strong>{affiliate.status_label}</strong>. Komisi baru tidak dicatat
                            selama status ini berlaku. Hubungi tim kami bila ada pertanyaan.
                        </span>
                    </div>
                )}
                <Card className="border-base-200 shadow-sm">
                    <h3 className="mb-1 flex items-center gap-2 text-lg font-bold">
                        <Share2 className="h-5 w-5 text-primary" /> Link Referral Anda
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Bagikan link ini. Pendaftar yang masuk lewat link Anda tercatat selama 30 hari sejak kliknya.
                        Kode Anda: <span className="font-semibold text-foreground">{affiliate.code}</span>
                    </p>
                    <ReferralLink url={affiliate.referral_url} />
                    <p className="mt-3 text-sm text-muted-foreground">
                        Belum yakin cara memakainya?{' '}
                        <Link href="/panduan-afiliasi" className="link link-primary">Baca panduan afiliasi</Link>.
                    </p>
                </Card>

                {affiliate.invite_url && (
                    <Card className="border-base-200 shadow-sm">
                        <h3 className="mb-1 flex items-center gap-2 text-lg font-bold">
                            <UserPlus className="h-5 w-5 text-primary" /> Undang Jadi Afiliator
                        </h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Bagikan tautan ini ke member yang ingin jadi afiliator. Begitu pengajuannya disetujui,
                            Anda menerima komisi tingkat 2 dari setiap pendaftar yang ia bawa dengan kodenya sendiri.
                        </p>
                        <ReferralLink url={affiliate.invite_url} />
                    </Card>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={Users} label="Member Direkrut" value={summary.referrals} tone="bg-primary/10 text-primary" />
                    <StatCard icon={Clock} label="Komisi Tertahan" value={formatRupiah(summary.held)} tone="bg-orange-100 text-orange-700" />
                    <StatCard icon={Wallet} label="Siap Dicairkan" value={formatRupiah(summary.payable)} tone="bg-blue-100 text-blue-700" />
                    <StatCard icon={Banknote} label="Sudah Dibayar" value={formatRupiah(summary.paid)} tone="bg-green-100 text-green-700" />
                </div>

                <p className="text-sm text-muted-foreground">
                    Komisi bisa dicairkan setelah melewati masa tahan dan saldo mencapai {formatRupiah(min_payout)}.
                </p>

                <Card className="border-base-200 shadow-sm">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                        <Wallet className="h-5 w-5 text-primary" /> Riwayat Komisi
                    </h3>

                    {commissions.data.length === 0 ? (
                        <div className="flex flex-col items-center py-10 text-center">
                            <Users className="h-10 w-10 text-muted-foreground/40" />
                            <p className="mt-3 text-sm text-muted-foreground">
                                Belum ada komisi. Komisi muncul setelah pendaftar dari link Anda menyelesaikan pembayaran.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-base-200">
                                {commissions.data.map((item) => {
                                    const meta = STATUS_META[item.status] ?? STATUS_META.accrued;
                                    const Icon = meta.icon;
                                    return (
                                        <div key={item.id} className="flex items-center gap-4 py-4">
                                            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${meta.tone}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold text-foreground">{item.member}</p>
                                                <p className="truncate text-sm text-muted-foreground">
                                                    {item.role_label} • {formatDate(item.date)}
                                                    {item.status === 'accrued' && ` • bisa dicairkan ${formatDate(item.available_at)}`}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-foreground">{formatRupiah(item.amount)}</p>
                                                <StatusBadge status={item.status} label={item.status_label} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4">
                                <PaginationDaisy data={commissions} />
                            </div>
                        </>
                    )}
                </Card>

                {payouts.length > 0 && (
                    <Card className="border-base-200 shadow-sm">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                            <Banknote className="h-5 w-5 text-primary" /> Riwayat Pencairan
                        </h3>
                        <div className="divide-y divide-base-200">
                            {payouts.map((payout) => (
                                <div key={payout.id} className="flex items-center gap-4 py-4">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-foreground">{formatRupiah(payout.amount)}</p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {formatDate(payout.date)}
                                            {payout.reference && ` • Ref ${payout.reference}`}
                                        </p>
                                    </div>
                                    <span className={`badge ${PAYOUT_BADGE[payout.status] ?? 'badge-ghost'} badge-sm`}>
                                        {payout.status_label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

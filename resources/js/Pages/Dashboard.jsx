import ApplicationLogo from '@/Components/ApplicationLogo';
import AvatarCrop from '@/Components/AvatarCrop';
import Card from '@/Components/Card';
import MemberCard from '@/Components/MemberCard';
import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate } from '@/Utils/formatter';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle, Info, X, CheckCircle, Clock, Crown, ExternalLink, FileText,
    Info, MessageCircle, NewspaperIcon, TrendingUp, Camera, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

// ---- Kartu statistik kecil ----
function StatCard({ icon: Icon, label, value, tone = 'primary', hint, href }) {
    const tones = {
        primary: 'bg-primary/10 text-primary',
        green: 'bg-green-100 text-green-700',
        orange: 'bg-orange-100 text-orange-700',
        blue: 'bg-blue-100 text-blue-700',
    };

    const inner = (
        <div className="flex items-center gap-4">
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
                <p className="text-2xl font-bold leading-none text-foreground">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
            </div>
        </div>
    );

    return (
        <Card className={`border-base-200 shadow-sm ${href ? 'transition hover:shadow-md hover:border-primary/30' : ''}`}>
            {href ? <Link href={href} className="block">{inner}</Link> : inner}
        </Card>
    );
}

// ---- Badge status berita ----
function StatusBadge({ status }) {
    // 0 = pending review, 1 = publish (sesuaikan bila ada status lain)
    if (status === 1) {
        return <span className="badge badge-success badge-sm gap-1 text-white"><CheckCircle size={11} /> Terbit</span>;
    }
    return <span className="badge badge-warning badge-sm gap-1"><Clock size={11} /> Review</span>;
}

function AnnouncementItem({ item }) {
    const [open, setOpen] = useState(false);
    const isUrgent = item.type === 'urgent';

    // Ambil ~180 karakter pertama sebagai teaser
    const teaser = item.content.length > 180
        ? item.content.slice(0, 180).trim() + '…'
        : item.content;

    const Icon = isUrgent ? AlertTriangle : Info;
    const tone = isUrgent
        ? 'border-red-200 bg-red-50 text-red-900'
        : 'border-blue-200 bg-blue-50 text-blue-900';
    const iconColor = isUrgent ? 'text-red-600' : 'text-blue-600';

    return (
        <>
            <div className={`flex items-start gap-4 rounded-xl border p-4 shadow-sm ${tone}`}>
                <div className="mt-0.5 shrink-0">
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="mb-1.5 text-lg font-bold leading-tight">{item.title}</h3>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed opacity-90">{teaser}</p>
                    {item.content.length > 180 && (
                        <button
                            onClick={() => setOpen(true)}
                            className="mt-2 text-sm font-semibold underline underline-offset-2 hover:opacity-70"
                        >
                            Baca Selengkapnya
                        </button>
                    )}
                </div>
            </div>

            {/* Modal detail */}
            {open && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-base-100 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header modal */}
                        <div className="flex items-start justify-between gap-4 border-b border-base-200 p-5">
                            <div className="flex items-start gap-3">
                                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${isUrgent ? 'bg-red-100' : 'bg-blue-100'}`}>
                                    <Icon className={`h-5 w-5 ${iconColor}`} />
                                </div>
                                <h3 className="text-xl font-bold leading-tight text-foreground">{item.title}</h3>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="btn btn-circle btn-ghost btn-sm shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Isi lengkap (scrollable) */}
                        <div className="overflow-y-auto p-6">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                                {item.content}
                            </p>
                        </div>

                        <div className="border-t border-base-200 p-4 text-right">
                            <button onClick={() => setOpen(false)} className="btn btn-primary btn-sm">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default function Dashboard({
    auth_user, total_news, paket_terdaftar, pending_news, publish_news, pengumuman, recent_news = [],
}) {
    const { auth } = usePage().props;
    const user = auth.user;

    const [profilePhoto] = useState(auth_user.avatar);

    // Sisa masa aktif
    const today = new Date();
    const endDate = new Date(user.dateexp);
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;
    const isExpired = daysRemaining <= 0;

    // Kuota
    const isUnlimited = paket_terdaftar.quota === null;
    const quotaPercentage = isUnlimited ? 100 : (user.quota_news / paket_terdaftar.quota) * 100;
    const isQuotaExhausted = isUnlimited ? false : user.quota_news <= 0;

    const handleAvatarComplete = (blob) => {
        const formData = new FormData();
        formData.append('avatar', blob, 'avatar.png');
        router.post('/profile/avatar', formData, { forceFormData: true });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="space-y-6">

                {/* ================= PENGUMUMAN ================= */}
                {pengumuman && pengumuman.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {pengumuman.map((item) => (
                            <AnnouncementItem key={item.id} item={item} />
                        ))}
                    </div>
                )}

                {/* ================= STATISTIK ================= */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard icon={NewspaperIcon} label="Total Opini" value={total_news} tone="blue" />
                    <StatCard
                        icon={CheckCircle} label="Terbit" value={publish_news} tone="green"
                        href={route('news.index')}
                    />
                    <StatCard
                        icon={Clock} label="Menunggu Review" value={pending_news} tone="orange"
                        href={route('news.index')}
                    />
                    <StatCard
                        icon={TrendingUp} label="Sisa Kuota"
                        value={isUnlimited ? '∞' : user.quota_news} tone="primary"
                        hint={isUnlimited ? 'Tanpa batas' : `dari ${paket_terdaftar.quota}`}
                    />
                </div>

                {/* ================= GRID PROFIL & STATUS ================= */}
                <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">

                    {/* Kolom Kiri */}
                    <div className="flex flex-col gap-6">

                        {profilePhoto ? (
                            // Foto sudah ada → ringkas, member card yang menonjol
                            <>
                                <Card className="border-base-200 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            <div className="avatar">
                                                <div className="h-16 w-16 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                                                    <img src={'storage/' + auth_user.avatar} alt="Avatar" className="object-cover" />
                                                </div>
                                            </div>
                                            <AvatarCrop onComplete={handleAvatarComplete}>
                                                <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-content shadow-md ring-2 ring-base-100 transition hover:brightness-110" title="Ganti foto">
                                                    <Camera size={13} />
                                                </span>
                                            </AvatarCrop>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-bold text-foreground">{user.nama}</p>
                                            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                        <Link href={route('profile.edit')} className="btn btn-ghost btn-sm">
                                            Profil <ChevronRight size={15} />
                                        </Link>
                                    </div>
                                </Card>

                                <MemberCard user={user} paket_terdaftar={paket_terdaftar} />
                            </>
                        ) : (
                            // Belum ada foto → ajakan yang menonjol
                            <Card className="border-2 border-orange-500/50 bg-orange-50/50">
                                <div className="mb-4 border-b border-black/5 pb-3">
                                    <div className="flex items-center gap-2 text-lg font-bold text-orange-700">
                                        <AlertTriangle className="h-5 w-5" /> Lengkapi Foto Profil Anda
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                                    <div className="avatar shrink-0">
                                        <div className="h-24 w-24 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                                            <img src={'placeholder.svg'} alt="Placeholder" className="object-cover" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4 text-center sm:text-left">
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            Tambahkan foto profil untuk melengkapi identitas Anda sebagai penulis Kopi TIMES.
                                            Foto akan tampil di artikel dan kartu member Anda.
                                        </p>
                                        <div className="flex justify-center sm:justify-start">
                                            <AvatarCrop onComplete={handleAvatarComplete} />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Kolom Kanan */}
                    <div className="flex flex-col gap-6">

                        {/* Status Membership */}
                        <Card className="border-primary/20 shadow-sm">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-lg font-bold">
                                    <Crown className="h-5 w-5 text-primary" /> Status Membership
                                </h3>
                                <div className="badge badge-primary badge-outline font-semibold">
                                    Level {paket_terdaftar.level}
                                </div>
                            </div>

                            <div className="space-y-4 rounded-xl border border-base-200 bg-base-200/50 p-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Mulai Bergabung</span>
                                    <span className="font-medium text-foreground">{formatDate(user.created)}</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-base-300 pt-3 text-sm">
                                    <span className="text-muted-foreground">Berakhir Pada</span>
                                    <span className="font-medium text-foreground">{formatDate(user.dateexp)}</span>
                                </div>
                                <div className="pt-2">
                                    {isExpired ? (
                                        <div className="flex items-center justify-center gap-2 rounded-lg bg-destructive/10 py-2 text-destructive">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span className="text-sm font-bold">Paket Sudah Berakhir!</span>
                                        </div>
                                    ) : isExpiringSoon ? (
                                        <div className="flex items-center justify-center gap-2 rounded-lg bg-orange-100 py-2 text-orange-600">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span className="text-sm font-bold">Sisa {daysRemaining} hari lagi</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 rounded-lg bg-green-100 py-2 text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="text-sm font-bold">Status Aktif (Sisa {daysRemaining} hari)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Kuota */}
                            <div className="mt-6 border-t border-border pt-6">
                                {paket_terdaftar.level != 1 && (
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="flex items-center gap-2 text-sm font-bold">
                                            <TrendingUp className={`h-4 w-4 ${isQuotaExhausted ? 'text-destructive' : 'text-primary'}`} />
                                            Sisa Kuota Artikel Bulan Ini
                                        </p>
                                        <span className={`rounded-md px-2 py-1 text-sm font-bold ${isQuotaExhausted ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                            {isUnlimited ? 'Unlimited (Tanpa Batas)' : `${user.quota_news} / ${paket_terdaftar.quota}`}
                                        </span>
                                    </div>
                                )}

                                {isQuotaExhausted && !isUnlimited && (
                                    <div className="mt-4 space-y-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                                        <div className="flex items-start gap-2 text-destructive">
                                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                                            <p className="text-sm leading-tight">
                                                <span className="mb-1 block font-bold">Kuota Habis!</span>
                                                Anda tidak dapat mengirim artikel baru. Silakan perpanjang paket Anda.
                                            </p>
                                        </div>
                                        <Link className="btn btn-primary w-full" href={route('subscription.index')}>
                                            <Crown className="mr-2 h-4 w-4" /> Perpanjang Member
                                        </Link>
                                    </div>
                                )}

                                {paket_terdaftar.level != 1 && !isQuotaExhausted && !isUnlimited && quotaPercentage <= 20 && (
                                    <p className="mt-2 rounded bg-orange-50 p-2 text-xs font-semibold text-orange-600">
                                        ⚠️ Peringatan: Kuota artikel Anda hampir habis!
                                    </p>
                                )}
                            </div>
                        </Card>

                        {/* Komunitas WA */}
                        <Card className="relative overflow-hidden border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50/30 shadow-sm">
                            <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row">
                                <div className="shrink-0 rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
                                    <ApplicationLogo className="h-auto w-20" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="mb-2 text-xl font-bold text-green-900">Komunitas Penulis</h3>
                                    <p className="mb-4 text-sm leading-relaxed text-green-800/80">
                                        Bergabunglah dengan grup WhatsApp Kopi TIMES untuk berdiskusi, berbagi ilmu, dan mendapat update terbaru!
                                    </p>
                                    <Button asChild className="w-full bg-green-600 text-white shadow-md shadow-green-600/20 hover:bg-green-700 md:w-auto">
                                        <a href="https://chat.whatsapp.com/Lgq2lmuD9wHH7Rh2Udj2M0" target="_blank" rel="noopener noreferrer">
                                            <MessageCircle className="mr-2 h-4 w-4" /> Gabung Grup WA
                                            <ExternalLink className="ml-2 h-3.5 w-3.5 opacity-70" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* ================= OPINI TERBARU ================= */}
                <Card className="border-base-200 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-bold">
                            <FileText className="h-5 w-5 text-primary" /> Opini Terbaru
                        </h3>
                        <Link href={route('news.index')} className="btn btn-ghost btn-sm gap-1">
                            Lihat Semua <ChevronRight size={15} />
                        </Link>
                    </div>

                    {recent_news.length > 0 ? (
                        <div className="divide-y divide-base-200">
                            {recent_news.map((news) => (
                                <div key={news.id} className="flex items-center justify-between gap-3 py-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-foreground">{news.title}</p>
                                        <p className="text-xs text-muted-foreground">{formatDate(news.datetime)}</p>
                                    </div>
                                    <StatusBadge status={news.status} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <NewspaperIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">Belum ada opini. Mulai tulis opini pertama Anda!</p>
                            <Link href={route('news.create')} className="btn btn-primary btn-sm mt-4">
                                Tulis Opini
                            </Link>
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
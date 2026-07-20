import ApplicationLogo from '@/Components/ApplicationLogo';
import AvatarCrop from '@/Components/AvatarCrop';
import Card from '@/Components/Card';
import MemberCard from '@/Components/MemberCard';
import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate } from '@/Utils/formatter';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, Crown, ExternalLink, Info, MessageCircle, TrendingUp } from 'lucide-react';
import { useState } from 'react';

// Tambahkan pengumuman di parameter props
export default function Dashboard({ auth_user, total_news, paket_terdaftar, pending_news, publish_news, pengumuman }) {

    const { auth } = usePage().props;
    const user = auth.user;

    const [profilePhoto, setProfilePhoto] = useState(auth_user.avatar);

    // Calculate days remaining
    const today = new Date();
    const endDate = new Date(user.dateexp);
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;
    const isExpired = daysRemaining <= 0;

    const isUnlimited = paket_terdaftar.quota === null;
    const quotaPercentage = isUnlimited ? 100 : (user.quota_news / paket_terdaftar.quota) * 100;
    const quotaRemaining = paket_terdaftar.quota - user.quota_news;
    const isQuotaExhausted = isUnlimited ? false : user.quota_news <= 0;

    const handleAvatarComplete = (blob) => {
        const formData = new FormData();
        formData.append("avatar", blob, "avatar.png");

        router.post("/profile/avatar", formData, {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-6">

                {/* ================= SECTION PENGUMUMAN ================= */}
                {pengumuman && pengumuman.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {pengumuman.map((item) => (
                            <div
                                key={item.id}
                                className={`flex items-start gap-4 p-4 rounded-xl border shadow-sm ${item.type === 'urgent'
                                    ? 'bg-red-50 border-red-200 text-red-900'
                                    : 'bg-blue-50 border-blue-200 text-blue-900'
                                    }`}
                            >
                                <div className="mt-0.5 shrink-0">
                                    {item.type === 'urgent'
                                        ? <AlertTriangle className="w-6 h-6 text-red-600" />
                                        : <Info className="w-6 h-6 text-blue-600" />
                                    }
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg leading-none mb-2">{item.title}</h3>
                                    {/* whitespace-pre-wrap agar enter/baris baru dari textarea tetap terbaca */}
                                    <p className="text-sm opacity-90 whitespace-pre-wrap">{item.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* ================= END SECTION PENGUMUMAN ================= */}

                <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6">

                    {/* Kolom Kiri: Profil & Member Card */}
                    <div className="flex flex-col gap-6">

                        <Card className={`border-2 ${profilePhoto ? 'border-green-500/50 bg-green-50/50' : 'border-orange-500/50 bg-orange-50/50'}`}>
                            <div className="pb-3 border-b border-black/5 mb-4">
                                <div className={`flex items-center gap-2 text-lg font-bold ${profilePhoto ? 'text-green-700' : 'text-orange-700'}`}>
                                    {profilePhoto ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                    {profilePhoto ? 'Foto Profil Anda' : 'Lengkapi Foto Profil Anda'}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                <div className="avatar shrink-0">
                                    <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                        {auth_user.avatar ? (
                                            <img src={'storage/' + auth_user.avatar} alt="Avatar" className="object-cover" />
                                        ) : (
                                            <img src={'placeholder.svg'} alt="Placeholder" className="object-cover" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4 text-center sm:text-left">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {profilePhoto
                                            ? 'Foto profil Anda sudah terpasang. Klik tombol di bawah jika ingin menggantinya dengan yang baru.'
                                            : 'Tambahkan foto profil untuk melengkapi identitas Anda sebagai penulis Kopi TIMES. Foto akan ditampilkan di artikel dan kartu member Anda.'
                                        }
                                    </p>
                                    <div className="flex justify-center sm:justify-start">
                                        <AvatarCrop onComplete={handleAvatarComplete} />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {auth_user.avatar && (
                            <MemberCard user={user} paket_terdaftar={paket_terdaftar} />
                        )}
                    </div>

                    {/* Kolom Kanan: Status & Komunitas */}
                    <div className='flex flex-col gap-6'>

                        {/* Status Membership Card */}
                        <Card className="border-primary/20 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Crown className="w-5 h-5 text-primary" />
                                    Status Membership
                                </h3>
                                <div className='badge badge-primary badge-outline font-semibold'>
                                    Level {paket_terdaftar.level}
                                </div>
                            </div>

                            <div className="space-y-4 bg-base-200/50 p-4 rounded-xl border border-base-200">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Mulai Bergabung</span>
                                    <span className="font-medium text-foreground">{formatDate(user.created)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-t border-base-300 pt-3">
                                    <span className="text-muted-foreground">Berakhir Pada</span>
                                    <span className="font-medium text-foreground">{formatDate(user.dateexp)}</span>
                                </div>

                                <div className="pt-2">
                                    {isExpired ? (
                                        <div className="flex items-center justify-center gap-2 text-destructive bg-destructive/10 py-2 rounded-lg">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span className="font-bold text-sm">Paket Sudah Berakhir!</span>
                                        </div>
                                    ) : isExpiringSoon ? (
                                        <div className="flex items-center justify-center gap-2 text-orange-600 bg-orange-100 py-2 rounded-lg">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span className="font-bold text-sm">Sisa {daysRemaining} hari lagi</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 text-green-600 bg-green-100 py-2 rounded-lg">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="font-bold text-sm">Status Aktif (Sisa {daysRemaining} hari)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section Kuota Artikel */}
                            <div className="mt-6 pt-6 border-t border-border">
                                {paket_terdaftar.level != 1 && (
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm font-bold flex items-center gap-2">
                                            <TrendingUp className={`w-4 h-4 ${isQuotaExhausted ? 'text-destructive' : 'text-primary'}`} />
                                            Sisa Kuota Artikel Bulan Ini
                                        </p>
                                        <span className={`font-bold text-sm px-2 py-1 rounded-md ${isQuotaExhausted ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                            {/* Jika unlimited, tampilkan teks khusus */}
                                            {isUnlimited ? 'Unlimited (Tanpa Batas)' : `${user.quota_news} / ${paket_terdaftar.quota}`}
                                        </span>
                                    </div>
                                )}

                                {/* Tampil jika kuota habis & BUKAN unlimited */}
                                {isQuotaExhausted && !isUnlimited && (
                                    <div className="space-y-4 mt-4 bg-destructive/5 p-4 rounded-xl border border-destructive/20">
                                        <div className="flex items-start gap-2 text-destructive">
                                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                            <p className="text-sm leading-tight">
                                                <span className="font-bold block mb-1">Kuota Habis!</span>
                                                Anda tidak dapat mengirim artikel baru. Silakan perpanjang paket Anda.
                                            </p>
                                        </div>
                                        <Link className="btn btn-primary w-full" href={route('subscription.index')} >
                                            <Crown className="w-4 h-4 mr-2" />
                                            Perpanjang Member
                                        </Link>
                                    </div>
                                )}

                                {/* Warning kuota menipis (Sisa <= 20%) - Tampil jika BUKAN unlimited */}
                                {paket_terdaftar.level != 1 && !isQuotaExhausted && !isUnlimited && quotaPercentage <= 20 && (
                                    <p className="text-xs font-semibold text-orange-600 mt-2 bg-orange-50 p-2 rounded">
                                        ⚠️ Peringatan: Kuota artikel Anda hampir habis!
                                    </p>
                                )}
                            </div>
                        </Card>

                        {/* Join WhatsApp Community */}
                        <Card className="border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50/30 shadow-sm overflow-hidden relative">
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                                <div className="shrink-0 p-4 bg-white rounded-2xl shadow-sm border border-green-100">
                                    <ApplicationLogo className="w-20 h-auto" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-green-900 mb-2">Komunitas Penulis</h3>
                                    <p className="text-sm text-green-800/80 mb-4 leading-relaxed">
                                        Mari bergabung dengan grup WhatsApp Kopi TIMES untuk berdiskusi, berbagi ilmu, dan mendapat update terbaru!
                                    </p>
                                    <Button
                                        asChild
                                        className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto shadow-md shadow-green-600/20"
                                    >
                                        <a href="https://chat.whatsapp.com/Lgq2lmuD9wHH7Rh2Udj2M0" target="_blank" rel="noopener noreferrer">
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Gabung Grup WA
                                            <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-70" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </Card>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
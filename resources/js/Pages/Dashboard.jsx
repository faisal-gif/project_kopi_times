import AvatarCrop from '@/Components/AvatarCrop';
import Card from '@/Components/Card';
import MemberCard from '@/Components/MemberCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate } from '@/Utils/formatter';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Badge, Calendar, CheckCircle, CreditCard, Crown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function Dashboard({ auth_user, total_news, paket_terdaftar, pending_news, publish_news }) {

    const { auth } = usePage().props;
    const user = auth.user;

    const [profilePhoto, setProfilePhoto] = useState(auth_user.avatar);

    // Calculate days remaining
    const today = new Date();
    const endDate = new Date(user.dateexp);
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;
    const isExpired = daysRemaining <= 0;

    const quotaPercentage = (user.quota_news / paket_terdaftar.quota) * 100;
    const quotaRemaining = paket_terdaftar.quota - user.quota_news;
    const isQuotaExhausted = user.quota_news <= 0;


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

            <div className="">
                <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4 ">

                    <Card className={`md:col-span-2 border-2 ${profilePhoto ? 'border-green-500/50 bg-green-50/50 ' : 'border-orange-500/50 bg-orange-50/50 '}`}>
                        <div className="pb-3">
                            <div className={`flex items-center gap-2 text-lg ${profilePhoto ? 'text-green-700 ' : 'text-orange-700 '}`}>
                                {profilePhoto ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                {profilePhoto ? 'Foto Profil Anda' : 'Lengkapi Foto Profil Anda'}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-6">
                                <div className="avatar">
                                    {auth_user.avatar ? (
                                        <div className="w-24 rounded-full">
                                            <img src={'storage/' + auth_user.avatar} />
                                        </div>
                                    ) : (
                                        <div className="w-24 rounded-full">
                                            <img src={'placeholder.svg'} />
                                        </div>
                                    )}

                                </div>
                                <div className="flex-1 space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        {profilePhoto
                                            ? 'Foto profil Anda sudah terpasang. Klik tombol di bawah jika ingin menggantinya.'
                                            : 'Tambahkan foto profil untuk melengkapi identitas Anda sebagai penulis Kopi TIMES. Foto akan ditampilkan di artikel dan kartu member Anda.'
                                        }
                                    </p>
                                    <AvatarCrop />
                                </div>
                            </div>
                        </div>
                    </Card>
                    {/* Subscription Card */}
                    <Card className=" border-primary/20">

                        <div className="flex items-center justify-between text-lg">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Status Membership
                            </div>
                            <div className='badge badge-outline badge-primary'>
                                Level {paket_terdaftar.level}
                            </div>
                        </div>

                        <div className="space-y-4 mt-4">
                            <p className="text-sm font-medium text-muted-foreground mb-6">Masa Berlaku Paket</p>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Mulai</span>
                                <span className="font-medium text-foreground">
                                    {formatDate(user.created)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Berakhir</span>
                                <span className="font-medium text-foreground">
                                    {formatDate(user.dateexp)}
                                </span>
                            </div>
                            <div>
                                {isExpired ? (
                                    <div className="flex items-center gap-2 text-primary">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span className="font-semibold text-sm">Paket sudah berakhir!</span>
                                    </div>
                                ) : isExpiringSoon ? (
                                    <div className="flex items-center gap-2 text-orange-600">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span className="font-semibold text-sm">Sisa {daysRemaining} hari lagi</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="font-semibold text-sm">Aktif - Sisa {daysRemaining} hari</span>
                                    </div>
                                )}
                            </div>
                        </div>


                        <div className="border-t border-border" />

                        {/* Kuota Artikel */}
                        <div className="space-y-3">
                            {paket_terdaftar.level != 1 && (
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <TrendingUp className={`w-4 h-4 ${isQuotaExhausted ? 'text-destructive' : 'text-primary'}`} />
                                        Kuota Artikel Bulan Ini
                                    </p>
                                    <span className="font-semibold text-foreground text-sm">
                                        {user.quota_news} / {paket_terdaftar.quota}
                                    </span>
                                </div>
                            )}
                            {/* <Progress value={quotaPercentage} className="h-2" /> */}
                            {isQuotaExhausted && (
                                <div className="space-y-3 mt-10">
                                    <div className="flex items-center gap-2 text-destructive">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span className="font-semibold text-sm">Kuota artikel sudah habis!</span>
                                    </div>
                                    <Link className="btn btn-outline btn-primary w-full" href={route('subscription.index')} >
                                        <Crown className="w-4 h-4 mr-2" />
                                        Perpanjang / Upgrade Member
                                    </Link>
                                </div>
                            )}

                            {paket_terdaftar.level != 1 && (
                                <p className="text-xs text-muted-foreground">
                                    Sisa {user.quota_news} artikel untuk bulan ini.
                                    {quotaPercentage >= 80 && (
                                        <span className="text-orange-600 font-medium"> Kuota hampir habis!</span>
                                    )}
                                </p>)}

                        </div>




                    </Card>
                    {
                        profilePhoto && (<MemberCard user={user} paket_terdaftar={paket_terdaftar} />)
                    }


                    {/* Quota Card */}

                </div>
            </div>

        </AuthenticatedLayout>
    );
}

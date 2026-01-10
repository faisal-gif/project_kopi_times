import Card from '@/Components/Card';
import MemberCard from '@/Components/MemberCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate } from '@/Utils/formatter';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, Badge, Calendar, CheckCircle, CreditCard, Crown, TrendingUp } from 'lucide-react';

export default function Dashboard({ total_news, paket_terdaftar, pending_news, publish_news }) {

    const { auth } = usePage().props;
    const user = auth.user;

    // Calculate days remaining
    const today = new Date();
    const endDate = new Date(user.dateexp);
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;
    const isExpired = daysRemaining <= 0;

    const quotaPercentage = (user.quota_news / paket_terdaftar.quota) * 100;
    const quotaRemaining = paket_terdaftar.quota - user.quota_news;
    const isQuotaExhausted = user.quota_news <= 0;


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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
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

                    <MemberCard user={user} paket_terdaftar={paket_terdaftar} />

                    {/* Quota Card */}

                </div>
            </div>

        </AuthenticatedLayout>
    );
}

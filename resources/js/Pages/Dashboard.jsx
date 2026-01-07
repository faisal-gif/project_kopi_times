import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate } from '@/Utils/formatter';
import { Head, usePage } from '@inertiajs/react';
import { Badge, Calendar, TrendingUp } from 'lucide-react';

export default function Dashboard({ total_news, pending_news, publish_news }) {

    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Subscription Card */}
                    <Card className=" border-primary/20">

                        <div className="flex items-center justify-between text-lg">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Masa Berlaku Paket
                            </div>
                        </div>

                        <div className="space-y-4">

                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Berakhir</span>
                                <span className="font-medium text-foreground">
                                    {formatDate(user.dateexp)}
                                </span>
                            </div>

                        </div>

                    </Card>

                    {/* Quota Card */}
                    <Card className="border-primary/20 bg-linear-to-bl from-primary/10 to-accent/20">

                        <div className="card-title flex items-center gap-2 text-lg">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Kuota Artikel Bulan Ini
                        </div>


                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Terpakai</span>
                                <span className="font-semibold text-foreground">
                                    {/* {writerData.quotaUsed} / {writerData.quotaLimit}  */}
                                    {user.quota_news} artikel
                                </span>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Sisa {user.quota_news} artikel sampai {formatDate(user.dateexp)}.
                                {/* {quotaPercentage >= 80 && (
                                    <span className="text-orange-600 font-medium"> Kuota hampir habis!</span>
                                )} */}
                            </p>
                        </div>

                    </Card>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}

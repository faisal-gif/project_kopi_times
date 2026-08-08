import Alert from '@/Components/Alert';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { CalendarClock } from 'lucide-react';

export default function Closed({ reason, flash }) {
    const isQuotaFull = reason === 'quota_full';

    return (
        <GuestLayout>
            <Head title="Kirim Berita" />

            {flash?.success && (
                <div className="mb-4">
                    <Alert type="success" message={flash.success} dismissible />
                </div>
            )}

            <div className="text-center py-8">
                <CalendarClock className="w-14 h-14 mx-auto text-primary mb-4" />
                <h1 className="text-2xl font-bold mb-2">
                    {isQuotaFull ? 'Kuota Kiriman Sudah Penuh' : 'Event Sedang Tidak Dibuka'}
                </h1>
                <p className="opacity-70 mb-6">
                    {isQuotaFull
                        ? 'Terima kasih atas antusiasmenya. Kuota kiriman untuk event ini sudah terpenuhi.'
                        : 'Event ini sedang tidak menerima kiriman (belum dibuka atau sudah berakhir). Silakan cek kembali nanti.'}
                </p>
                <Link href="/" className="btn btn-primary">
                    Kembali ke Beranda
                </Link>
            </div>
        </GuestLayout>
    );
}

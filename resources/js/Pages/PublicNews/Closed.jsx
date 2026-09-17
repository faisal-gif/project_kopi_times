import Alert from '@/Components/Alert';
import GuestLayout, { GuestHeading } from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export default function Closed({ reason, flash }) {
    const isQuotaFull = reason === 'quota_full';

    return (
        <GuestLayout>
            <Head title="Kirim Berita" />

            {flash?.success && (
                <div className="mb-8">
                    <Alert type="success" message={flash.success} dismissible />
                </div>
            )}

            <GuestHeading
                title={isQuotaFull ? 'Kuota kiriman sudah penuh.' : 'Event sedang tidak dibuka.'}
            >
                {isQuotaFull
                    ? 'Terima kasih atas antusiasmenya. Kuota kiriman untuk event ini sudah terpenuhi.'
                    : 'Event ini sedang tidak menerima kiriman (belum dibuka atau sudah berakhir). Silakan cek kembali nanti.'}
            </GuestHeading>

            <Link href="/" className="btn btn-primary mt-10 px-6">
                Kembali ke beranda
                <ArrowRight className="h-5 w-5" />
            </Link>
        </GuestLayout>
    );
}

import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout, { GuestHeading, Notice } from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <GuestHeading title="Cek kotak masuk email Anda.">
                Terima kasih sudah mendaftar. Klik tautan verifikasi yang kami kirim ke email Anda sebelum mulai. Tidak menerima email? Periksa folder spam, atau kirim ulang.
            </GuestHeading>

            {status === 'verification-link-sent' && (
                <Notice>Tautan verifikasi baru sudah dikirim ke email yang Anda daftarkan.</Notice>
            )}

            <form onSubmit={submit} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <PrimaryButton className="px-6" disabled={processing}>
                    {processing ? 'Mengirim...' : 'Kirim ulang email verifikasi'}
                </PrimaryButton>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="font-type text-sm text-ink/75 underline underline-offset-4 hover:text-pen"
                >
                    Keluar
                </Link>
            </form>
        </GuestLayout>
    );
}

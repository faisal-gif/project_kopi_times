import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout, { Field, GuestHeading, Notice, textLinkClass } from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Password" />

            <GuestHeading title="Lupa password?">
                Masukkan email akun Anda. Kami akan mengirim tautan untuk membuat password baru.
            </GuestHeading>

            {status && <Notice>{status}</Notice>}

            <form onSubmit={submit} className="mt-10 space-y-6">
                <Field id="email" label="Email" error={errors.email}>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full"
                        autoComplete="email"
                        placeholder="nama@email.com"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                </Field>

                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? 'Mengirim...' : 'Kirim tautan reset password'}
                </PrimaryButton>
            </form>

            <div className="kt-rule mt-10 text-ink/25" />
            <p className="mt-6 font-type text-sm text-ink/80">
                Sudah ingat?{' '}
                <Link href={route('login')} className={textLinkClass}>Kembali ke halaman masuk</Link>
            </p>
        </GuestLayout>
    );
}

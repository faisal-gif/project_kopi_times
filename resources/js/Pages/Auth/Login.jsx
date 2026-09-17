import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import InputPassword from '@/Components/InputPassword';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const labelClass = 'mb-2 font-type text-sm text-ink/80';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <Link href="/" className="inline-flex items-center gap-2 font-type text-sm text-ink/70 transition-colors hover:text-pen">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke beranda
            </Link>

            <h1 className="mt-8 text-balance text-4xl font-black leading-[1.02] tracking-[-0.025em] sm:text-5xl">
                Masuk, lanjutkan tulisan Anda.
            </h1>
            <p className="mt-4 font-type text-ink/75">Gunakan username atau email yang Anda daftarkan.</p>

            {status && (
                <p className="mt-6 rounded-[3px] bg-saffron/25 px-4 py-3 font-type text-sm">{status}</p>
            )}

            <form onSubmit={submit} className="mt-10 space-y-6">
                <div>
                    <InputLabel htmlFor="email" value="Username atau email" className={labelClass} />
                    <TextInput
                        id="email"
                        type="text"
                        name="email"
                        value={data.email}
                        className="block w-full"
                        autoComplete="username"
                        placeholder="nama@email.com"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex items-baseline justify-between gap-4">
                        <InputLabel htmlFor="password" value="Password" className={labelClass} />
                        {canResetPassword && (
                            <Link href={route('password.request')} className="font-type text-sm text-pen underline underline-offset-4 hover:text-desk">
                                Lupa password?
                            </Link>
                        )}
                    </div>
                    <InputPassword
                        id="password"
                        name="password"
                        value={data.password}
                        className="w-full"
                        autoComplete="current-password"
                        placeholder="Password Anda"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <label className="flex items-center gap-3 font-type text-sm text-ink/80">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        className="checkbox-sm"
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    Ingat saya di perangkat ini
                </label>

                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? 'Memproses...' : 'Masuk'}
                </PrimaryButton>
            </form>

            <div className="kt-rule mt-10 text-ink/25" />
            <p className="mt-6 font-type text-sm text-ink/80">
                Belum jadi anggota?{' '}
                <Link href={route('register')} className="font-print font-extrabold text-pen underline decoration-2 underline-offset-4 hover:text-desk">
                    Daftar jadi penulis
                </Link>
            </p>
        </GuestLayout>
    );
}

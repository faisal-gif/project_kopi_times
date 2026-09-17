import InputPassword from '@/Components/InputPassword';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout, { Field, GuestHeading } from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Buat Password Baru" />

            <GuestHeading title="Buat password baru.">
                Setelah disimpan, masuk kembali dengan password ini.
            </GuestHeading>

            <form onSubmit={submit} className="mt-10 space-y-6">
                <Field id="email" label="Email" error={errors.email}>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                </Field>

                <Field id="password" label="Password baru" error={errors.password}>
                    <InputPassword
                        id="password"
                        name="password"
                        value={data.password}
                        className="w-full"
                        autoComplete="new-password"
                        placeholder="Buat password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                </Field>

                <Field id="password_confirmation" label="Ulangi password baru" error={errors.password_confirmation}>
                    <InputPassword
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="w-full"
                        autoComplete="new-password"
                        placeholder="Ketik ulang password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                </Field>

                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? 'Menyimpan...' : 'Simpan password baru'}
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}

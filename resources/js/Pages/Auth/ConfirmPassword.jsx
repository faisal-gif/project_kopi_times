import InputPassword from '@/Components/InputPassword';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout, { Field, GuestHeading } from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Konfirmasi Password" />

            <GuestHeading title="Konfirmasi password Anda.">
                Bagian ini dilindungi. Masukkan password sekali lagi untuk melanjutkan.
            </GuestHeading>

            <form onSubmit={submit} className="mt-10 space-y-6">
                <Field id="password" label="Password" error={errors.password}>
                    <InputPassword
                        id="password"
                        name="password"
                        value={data.password}
                        className="w-full"
                        autoComplete="current-password"
                        placeholder="Password Anda"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                </Field>

                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? 'Memeriksa...' : 'Konfirmasi'}
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}

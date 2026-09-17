import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout, { Field, GuestHeading, textLinkClass } from '@/Layouts/GuestLayout';
import { ArrowRight } from "lucide-react";
import TextInput from '@/Components/TextInput';
import InputPassword from '@/Components/InputPassword';
import InputTextarea from '@/Components/InputTextarea';
import InputPhoneNumber from '@/Components/InputPhoneNumber';

export default function RegisterAJP() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        prov: '',
        city: '',
        contact: '',
        address: '',
        password: '',
        password_confirmation: '',
    });

    const handleRegister = (e) => {
        e.preventDefault();
        post(route('register-ajp'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar AJP" />

            <GuestHeading title="Isi data penulis." />

            <form onSubmit={handleRegister} className="mt-10 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                    <Field id="name" label="Nama lengkap" error={errors.name}>
                        <TextInput id="name" name="name" value={data.name} className="block w-full" autoComplete="name"
                            placeholder="Nama sesuai identitas" isFocused={true} onChange={(e) => setData('name', e.target.value)} />
                    </Field>
                    <Field id="email" label="Email" error={errors.email}>
                        <TextInput id="email" type="email" name="email" value={data.email} className="block w-full" autoComplete="email"
                            placeholder="nama@email.com" onChange={(e) => setData('email', e.target.value)} />
                    </Field>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    <Field id="prov" label="Provinsi" error={errors.prov}>
                        <TextInput id="prov" name="prov" value={data.prov} className="block w-full" autoComplete="address-level1"
                            placeholder="Jawa Timur" onChange={(e) => setData('prov', e.target.value)} />
                    </Field>
                    <Field id="city" label="Kota / kabupaten" error={errors.city}>
                        <TextInput id="city" name="city" value={data.city} className="block w-full" autoComplete="address-level2"
                            placeholder="Kota Malang" onChange={(e) => setData('city', e.target.value)} />
                    </Field>
                </div>

                <Field id="contact" label="Nomor kontak (WhatsApp aktif)" error={errors.contact}>
                    <InputPhoneNumber id="contact" value={data.contact} onChange={(e) => setData('contact', e.target.value)}
                        placeholder="81234567890" autoComplete="tel-national" />
                </Field>

                <Field id="address" label="Alamat lengkap" error={errors.address}>
                    <InputTextarea id="address" value={data.address} onChange={(e) => setData('address', e.target.value)}
                        placeholder="Nama jalan, nomor, kelurahan, kecamatan" maxLength={255} autoComplete="street-address" />
                </Field>

                <div className="grid gap-5 md:grid-cols-2">
                    <Field id="password" label="Password" error={errors.password}>
                        <InputPassword id="password" name="password" value={data.password} className="w-full"
                            autoComplete="new-password" placeholder="Buat password" onChange={(e) => setData('password', e.target.value)} />
                    </Field>
                    <Field id="password_confirmation" label="Ulangi password" error={errors.password_confirmation}>
                        <InputPassword id="password_confirmation" name="password_confirmation" value={data.password_confirmation} className="w-full"
                            autoComplete="new-password" placeholder="Ketik ulang password" onChange={(e) => setData('password_confirmation', e.target.value)} />
                    </Field>
                </div>

                <label htmlFor="terms" className="flex items-start gap-3 pt-2 font-type text-sm text-ink/80">
                    <input id="terms" type="checkbox" className="checkbox checkbox-sm mt-0.5" required />
                    <span>
                        Saya setuju dengan{' '}
                        <Link href="/syarat-ketentuan" className="text-pen underline underline-offset-4 hover:text-desk">Syarat & Ketentuan</Link>
                    </span>
                </label>

                <button type="submit" disabled={processing} className="btn btn-primary w-full disabled:opacity-60">
                    {processing ? "Memproses..." : "Daftar & berlangganan"}
                    {!processing && <ArrowRight className="h-5 w-5" />}
                </button>

                <p className="text-center font-type text-sm text-ink/80">
                    Sudah punya akun?{' '}
                    <Link href={route('login')} className={textLinkClass}>Masuk di sini</Link>
                </p>
            </form>
        </GuestLayout>
    );
}

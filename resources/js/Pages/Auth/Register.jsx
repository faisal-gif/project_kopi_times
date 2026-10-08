import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout, { Field, Notice } from '@/Layouts/GuestLayout';
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { formatDuration, formatRupiah } from '@/Utils/formatter';
import TextInput from '@/Components/TextInput';
import InputPassword from '@/Components/InputPassword';
import InputTextarea from '@/Components/InputTextarea';
import InputPhoneNumber from '@/Components/InputPhoneNumber';
import InputSelect from '@/Components/InputSelect';

function StepLabel({ step }) {
    return <p className="font-pen text-xl font-bold text-pen">Langkah {step} dari 2</p>;
}

export default function Register({ newsPackages, kategoriKt, referral = null }) {
    const [registerStep, setRegisterStep] = useState("plan");
    const [selectedPlan, setSelectedPlan] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        profesi: '',
        prov: '',
        city: '',
        contact: '',
        address: '',
        password: '',
        password_confirmation: '',
        plan_id: '',
        ref: referral?.code ?? '',
        referral_code: '',
    });

    const handlePlanSelect = (planId) => {
        setSelectedPlan(planId);
        setData('plan_id', planId);
        setRegisterStep("register");
        window.scrollTo({ top: 0 });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const plan = newsPackages.find(p => p.id === selectedPlan);

    return (
        <GuestLayout>
            <Head title="Daftar Jadi Penulis" />

            {registerStep === "plan" ? (
                <>
                    <Link href="/" className="inline-flex items-center gap-2 font-type text-sm text-ink/70 transition-colors hover:text-pen">
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke beranda
                    </Link>

                    <div className="mt-8">
                        <StepLabel step={1} />
                        <h1 className="mt-2 text-balance text-4xl font-black leading-[1.02] tracking-[-0.025em] sm:text-5xl">
                            Pilih paket membership Anda.
                        </h1>
                    </div>

                    <ul className="mt-10 space-y-6">
                        {newsPackages.map((plan) => (
                            <li key={plan.id} className="relative">
                                {plan.popular === 1 && (
                                    <span className="absolute -top-3 left-6 z-10 -rotate-2 bg-saffron px-3 py-1 text-sm font-extrabold">
                                        Paling populer
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handlePlanSelect(plan.id)}
                                    className="group block w-full rounded-[3px] border border-ink/15 bg-sheet p-6 text-left shadow-[0_18px_36px_-24px_rgba(0,0,0,0.45)] transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-pen"
                                >
                                    <span className="flex flex-wrap items-baseline justify-between gap-3 border-b border-dashed border-ink/30 pb-4">
                                        <span className="font-type text-sm uppercase tracking-wide text-ink/70">{plan.name}</span>
                                        <span>
                                            <span className="text-3xl font-black tracking-[-0.02em] tabular-nums">{formatRupiah(plan.price)}</span>
                                            <span className="pl-1 font-type text-sm text-ink/70">/ {formatDuration(plan.period)}</span>
                                        </span>
                                    </span>

                                    {(plan.feature?.keunggulan || []).slice(3).length > 0 && (
                                        <span className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-type text-sm">
                                            {plan.feature.keunggulan.slice(3).map((feature) => (
                                                <span key={feature} className="inline-flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-pen" strokeWidth={2.5} />
                                                    {feature}
                                                </span>
                                            ))}
                                        </span>
                                    )}

                                    <span className="mt-5 inline-flex items-center gap-2 font-extrabold text-pen">
                                        Pilih paket ini
                                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    <p className="mt-10 font-type text-sm text-ink/80">
                        Sudah punya akun?{' '}
                        <Link href={route('login')} className="font-print font-extrabold text-pen underline decoration-2 underline-offset-4 hover:text-desk">
                            Masuk di sini
                        </Link>
                    </p>
                </>
            ) : (
                <>
                    <button
                        type="button"
                        onClick={() => setRegisterStep("plan")}
                        className="inline-flex items-center gap-2 font-type text-sm text-ink/70 transition-colors hover:text-pen"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Ganti paket
                    </button>

                    <div className="mt-8">
                        <StepLabel step={2} />
                        <h1 className="mt-2 text-balance text-4xl font-black leading-[1.02] tracking-[-0.025em] sm:text-5xl">
                            Isi data penulis.
                        </h1>
                        {plan && (
                            <p className="mt-4 font-type text-ink/80">
                                Paket: <span className="kt-mark font-bold text-ink">{plan.name}</span> &middot; {formatRupiah(plan.price)} / {formatDuration(plan.period)}
                            </p>
                        )}
                        {referral && (
                            <Notice>Anda mendaftar atas ajakan <strong>{referral.name}</strong>.</Notice>
                        )}
                    </div>

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

                        <Field id="profesi" label="Profesi" error={errors.profesi}>
                            <InputSelect
                                id="profesi"
                                value={data.profesi}
                                onChange={(e) => setData('profesi', e.target.value)}
                                options={kategoriKt.map(k => ({ value: k.kategori_id, label: k.name }))}
                            />
                        </Field>

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
                            <InputPhoneNumber
                                id="contact"
                                value={data.contact}
                                onChange={(e) => setData('contact', e.target.value)}
                                placeholder="81234567890"
                                autoComplete="tel-national"
                            />
                        </Field>

                        <Field id="address" label="Alamat lengkap" error={errors.address}>
                            <InputTextarea
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Nama jalan, nomor, kelurahan, kecamatan"
                                maxLength={255}
                                autoComplete="street-address"
                            />
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

                        {!referral && (
                            <Field id="referral_code" label="Kode referral (jika ada)" error={errors.referral_code}>
                                <TextInput
                                    id="referral_code"
                                    name="referral_code"
                                    value={data.referral_code}
                                    className="block w-full uppercase"
                                    placeholder="Mis. DOSEN01"
                                    onChange={(e) => setData('referral_code', e.target.value.toUpperCase())}
                                />
                            </Field>
                        )}

                        <label htmlFor="terms" className="flex items-start gap-3 pt-2 font-type text-sm text-ink/80">
                            <input id="terms" type="checkbox" className="checkbox checkbox-sm mt-0.5" required />
                            <span>
                                Saya setuju dengan{' '}
                                <Link href="/syarat-ketentuan" className="text-pen underline underline-offset-4 hover:text-desk">Syarat & Ketentuan</Link>
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="btn btn-primary w-full disabled:opacity-60"
                        >
                            {processing ? "Memproses..." : "Daftar & berlangganan"}
                            {!processing && <ArrowRight className="h-5 w-5" />}
                        </button>

                        <p className="text-center font-type text-sm text-ink/80">
                            Sudah punya akun?{' '}
                            <Link href={route('login')} className="font-print font-extrabold text-pen underline decoration-2 underline-offset-4 hover:text-desk">
                                Masuk di sini
                            </Link>
                        </p>
                    </form>
                </>
            )}
        </GuestLayout>
    );
}

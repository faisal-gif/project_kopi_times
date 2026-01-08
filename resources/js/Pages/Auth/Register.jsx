import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import {
    Sparkles, Check, ArrowRight, ArrowLeft,
    User, Mail, Lock, Eye, EyeOff
} from "lucide-react";
import { formatDuration, formatRupiah } from '@/Utils/formatter';
import Card from '@/Components/Card';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputPassword from '@/Components/InputPassword';
import InputTextarea from '@/Components/InputTextarea';
import InputPhoneNumber from '@/Components/InputPhoneNumber';
import InputSelect from '@/Components/InputSelect';

export default function Register({ newsPackages, kategoriKt }) {
    // 1. State Alur
    const [registerStep, setRegisterStep] = useState("plan");
    const [selectedPlan, setSelectedPlan] = useState(null);


    // 3. Inertia Form
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
    });

    // 4. Handlers
    const handlePlanSelect = (planId) => {
        setSelectedPlan(planId);
        setData('plan_id', planId);
        setRegisterStep("register");
    };

    const handleRegister = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            {registerStep === "plan" ? (
                /* === STEP 1: PILIH PAKET === */
                <>
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pilih Paket</h1>
                        <p className="text-gray-600 text-sm">
                            Pilih paket yang sesuai dengan kebutuhanmu
                        </p>
                    </div>

                    <div className="space-y-4">
                        {newsPackages.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => handlePlanSelect(plan.id)}
                                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${plan.popular
                                    ? "border-primary bg-primary/10"
                                    : "border-gray-200 bg-white"
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-4">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
                                            <Sparkles className="w-3 h-3" />
                                            Paling Populer
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{plan.name}</h3>
                                        {/* <p className="text-sm text-gray-500">{plan.description}</p> */}
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-lg text-primary">{formatRupiah(plan.price)}</span>
                                        <span className="text-xs text-gray-600">/ {formatDuration(plan.period)}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-4">
                                    {plan.feature.keunggulan.slice(3).map((feature) => (
                                        <span
                                            key={feature}
                                            className="inline-flex items-center gap-1 text-[11px] bg-white border border-gray-50 px-2 py-1 rounded-md text-gray-600"
                                        >
                                            <Check className="w-3 h-3 text-green-500" />
                                            {feature}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex justify-end mt-2">
                                    <ArrowRight className="w-5 h-5 text-primary" />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                /* === STEP 2: FORM REGISTRASI === */
                <>
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={() => setRegisterStep("plan")}
                            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary cursor-pointer mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali pilih paket
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Buat Akun Baru</h1>
                        <p className="text-sm text-gray-600">
                            Mendaftar untuk paket: <span className="font-bold text-primary">{newsPackages.find(p => p.id === selectedPlan)?.name}</span>
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {/* Nama */}
                            <div className='space-y-2 floating-label'>
                                <span className='text-lg'>Nama Lengkap</span>
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="block w-full"
                                    autoComplete="name"
                                    placeholder="Masukkan nama lengkap"
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>
                            {/* Email */}
                            <div className="space-y-2  floating-label">
                                <span className='text-lg'>Email</span>
                                <TextInput
                                    id="email"
                                    type="text"
                                    name="email"
                                    value={data.email}
                                    className="block w-full"
                                    autoComplete="email"
                                    placeholder="Masukan Email"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                />

                                <InputError message={errors.email} className="mt-2" />
                            </div>
                        </div>
                        <div className="space-y-2 floating-label">
                            <span className='text-lg'>Profesi</span>
                            <InputSelect
                                value={data.profesi}
                                onChange={(e) => setData('profesi', e.target.value)}
                                options={kategoriKt.map(k => ({ value: k.kategori_id, label: k.name }))}
                            />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className="space-y-2 floating-label">
                                <span className='text-lg'>Nama Provinsi</span>
                                <TextInput
                                    id="prov"
                                    type="text"
                                    name="prov"
                                    value={data.prov}
                                    className="block w-full"
                                    autoComplete="prov"
                                    placeholder="Masukkan nama provinsi"
                                    isFocused={true}
                                    onChange={(e) => setData('prov', e.target.value)}
                                />
                                <InputError message={errors.prov} className="mt-1" />
                            </div>
                            <div className="space-y-2 floating-label">
                                <span className='text-lg'>Kota</span>
                                <TextInput
                                    id="city"
                                    type="text"
                                    name="city"
                                    value={data.city}
                                    className="block w-full"
                                    autoComplete="city"
                                    placeholder="Masukkan nama Kota atau Kabupaten"
                                    isFocused={true}
                                    onChange={(e) => setData('city', e.target.value)}
                                />
                                <InputError message={errors.city} className="mt-1" />
                            </div>
                        </div>

                        <div className='space-y-2 floating-label'>
                            <span className='text-lg'>Nomor Kontak</span>
                            <InputPhoneNumber
                                label={'Nomor Kontak'}
                                value={data.contact}
                                onChange={(e) => setData('contact', e.target.value)}
                                placeholder="Masukkan nomor kontak aktif"
                            />
                            <InputError message={errors.contact} className="mt-1"
                            />
                        </div>


                        <div className='space-y-2 floating-label'>
                            <span className='text-lg'>Alamat</span>
                            <InputTextarea
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Masukkan alamat lengkap"
                                maxLength={255}
                            />
                            <InputError message={errors.address} className="mt-1"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2 floating-label">
                            <span className='text-lg'>Password</span>

                            <InputPassword
                                id="password"
                                name="password"
                                value={data.password}
                                className=" w-full"
                                autoComplete="current-password"
                                placeholder="Masukan password"
                                onChange={(e) => setData('password', e.target.value)}
                            />

                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        {/* Konfirmasi Password */}
                        <div className='space-y-2 floating-label'>
                            <span className='text-lg'>Konfirmasi Password</span>

                            <InputPassword
                                id="password_confirmation"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className=" w-full"
                                autoComplete="current-password"
                                placeholder="Masukan password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />


                        </div>

                        <div className="flex items-center pt-2">
                            <input id="terms" type="checkbox" className="checkbox checkbox-sm checkbox-primary" required />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                                Saya setuju dengan <Link href="/syarat-ketentuan" className="link link-primary link-hover">Syarat & Ketentuan</Link>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className={`btn btn-primary w-full ${processing ? "btn-disabled cursor-not-allowed" : ""
                                }`}
                        >
                            {processing ? "Memproses..." : "Daftar & Berlangganan"}
                        </button>

                        <div className="text-center mt-4">
                            <Link href={route('login')} className="text-sm link link-primary link-hover">
                                Sudah punya akun? Masuk di sini
                            </Link>
                        </div>
                    </form>
                </>
            )}
        </GuestLayout>
    );
}
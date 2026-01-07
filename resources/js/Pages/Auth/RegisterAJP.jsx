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
            <Head title="RegisterAJP" />


                <>
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
           
        </GuestLayout>
    );
}
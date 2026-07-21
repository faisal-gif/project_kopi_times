import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Key, Trash2, User } from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout>
            <Head title="Profile Settings" />

            <div className="py-8 md:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Header & Back Button */}
                    <div className="flex items-center gap-4 mb-2">
                        <Link href={route('dashboard')} className="btn btn-circle btn-sm btn-ghost bg-base-200 hover:bg-base-300">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground leading-tight">Pengaturan Profil</h2>
                            <p className="text-sm text-muted-foreground">Kelola informasi data diri dan keamanan akun Anda.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                        
                        {/* Kiri: Update Info & Instansi (Lebih Besar) */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="shadow-sm border-base-200 p-0 overflow-hidden">
                                <div className="border-b border-base-200 bg-base-100/50 p-6 flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Informasi Profil</h3>
                                        <p className="text-sm text-muted-foreground">Perbarui nama, kontak, dan alamat email Anda.</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                        className="w-full"
                                    />
                                </div>
                            </Card>
                        </div>

                        {/* Kanan: Keamanan & Danger Zone */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="shadow-sm border-base-200 p-0 overflow-hidden">
                                <div className="border-b border-base-200 bg-base-100/50 p-5 flex items-center gap-3">
                                    <div className="p-2 bg-warning/10 text-warning-content rounded-lg">
                                        <Key size={18} />
                                    </div>
                                    <h3 className="font-bold text-base">Ubah Password</h3>
                                </div>
                                <div className="p-5">
                                    <UpdatePasswordForm className="w-full" />
                                </div>
                            </Card>

                            {/* <Card className="shadow-sm border-red-200 p-0 overflow-hidden bg-red-50/30">
                                <div className="border-b border-red-100 bg-red-50 p-5 flex items-center gap-3">
                                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                        <Trash2 size={18} />
                                    </div>
                                    <h3 className="font-bold text-base text-red-700">Danger Zone</h3>
                                </div>
                                <div className="p-5">
                                    <DeleteUserForm className="w-full" />
                                </div>
                            </Card> */}
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
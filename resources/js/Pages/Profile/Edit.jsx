import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Key, Trash2, User, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

// Import komponen yang dipakai di Dashboard
import AvatarCrop from '@/Components/AvatarCrop';
import MemberCard from '@/Components/MemberCard';

export default function Edit({ mustVerifyEmail, status, paket_terdaftar }) {
    const { auth } = usePage().props;
    const user = auth.user;

    // Fungsi untuk menghandle upload foto (sama persis dengan di Dashboard)
    const handleAvatarComplete = (blob) => {
        const formData = new FormData();
        formData.append("avatar", blob, "avatar.png");

        router.post("/profile/avatar", formData, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

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
                        
                        {/* KOLOM KIRI (Besar) */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* SECTION BARU: Foto Profil & Kartu Member */}
                            <Card className="shadow-sm border-base-200 p-0 overflow-hidden">
                                <div className="border-b border-base-200 bg-base-100/50 p-6 flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                        <ImageIcon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Foto Profil & ID Card</h3>
                                        <p className="text-sm text-muted-foreground">Foto ini akan tampil di artikel publik dan kartu keanggotaan Anda.</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                                        
                                        {/* Bagian Upload Avatar */}
                                        <div className="flex flex-col items-center gap-4 shrink-0">
                                            <div className="avatar">
                                                <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 shadow-md">
                                                    {user.avatar ? (
                                                        <img src={'/storage/' + user.avatar} alt="Avatar" className="object-cover" />
                                                    ) : (
                                                        <img src={'/placeholder.svg'} alt="Placeholder" className="object-cover" />
                                                    )}
                                                </div>
                                            </div>
                                            <AvatarCrop onComplete={handleAvatarComplete} />
                                        </div>

                                        {/* Bagian Preview Member Card */}
                                        <div className="flex-1 w-full flex flex-col justify-center">
                                            {user.avatar ? (
                                                <div className="w-full">
                                                    <MemberCard user={user} paket_terdaftar={paket_terdaftar} />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-base-300 rounded-2xl bg-base-200/30 text-center h-full min-h-[200px]">
                                                    <AlertTriangle className="w-10 h-10 text-warning mb-3 opacity-80" />
                                                    <p className="font-bold text-foreground text-lg mb-1">Kartu Member Belum Tersedia</p>
                                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                                        Silakan pasang foto profil Anda terlebih dahulu di sebelah kiri untuk men-generate ID Card otomatis.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            </Card>

                            {/* Informasi Profil (Form Teks) */}
                            <Card className="shadow-sm border-base-200 p-0 overflow-hidden">
                                <div className="border-b border-base-200 bg-base-100/50 p-6 flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Informasi Data Diri</h3>
                                        <p className="text-sm text-muted-foreground">Perbarui nama, kontak, dan alamat Anda.</p>
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

                        {/* KOLOM KANAN (Kecil) */}
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
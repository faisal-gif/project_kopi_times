import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft, Key, User, Image as ImageIcon,
    AlertTriangle, BadgeCheck, MailWarning, Building2, MapPin,
} from 'lucide-react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import AvatarCrop from '@/Components/AvatarCrop';
import MemberCard from '@/Components/MemberCard';
import ThumbnailCrop from '@/Components/ThumbnailCrop';

// Header card yang konsisten dipakai ulang di tiap section
function SectionHeader({ icon: Icon, title, subtitle, tone = 'primary' }) {
    const tones = {
        primary: 'bg-primary/10 text-primary',
        warning: 'bg-warning/10 text-warning',
    };


    return (
        <div className="flex items-start gap-3 border-b border-base-200 bg-base-100/50 p-5 md:p-6">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tones[tone]}`}>
                <Icon size={20} />
            </div>
            <div className="min-w-0">
                <h3 className="font-bold leading-tight">{title}</h3>
                {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
        </div>
    );
}

export default function Edit({ mustVerifyEmail, status, paket_terdaftar, thumbnail }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const isVerified = user.email_verified_at !== null;
    const avatarSrc = user.avatar ? '/storage/' + user.avatar : '/placeholder.svg';

    const handleAvatarComplete = (blob) => {
        const formData = new FormData();
        formData.append('avatar', blob, 'avatar.png');
        router.post('/profile/avatar', formData, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleThumbnailComplete = (file) => {
        const formData = new FormData();
        formData.append('image', file);
        router.post(route('profile.thumbnail'), formData, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pengaturan Profil" />

            <div className="py-8 md:py-12">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Back + breadcrumb */}
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('dashboard')}
                            className="btn btn-circle btn-sm btn-ghost bg-base-200 hover:bg-base-300"
                        >
                            <ArrowLeft size={18} />
                        </Link>
                        <span className="text-sm text-muted-foreground">
                            Dashboard <span className="mx-1 opacity-40">/</span>
                            <span className="font-medium text-foreground">Pengaturan Profil</span>
                        </span>
                    </div>

                    {/* HERO */}
                    <Card className="overflow-hidden border-base-200 p-0 shadow-sm">
                        <div className="h-24 bg-gradient-to-r from-primary/80 via-primary to-primary/70 md:h-28" />
                        <div className="px-6 pb-6">
                            <div className="-mt-12 flex flex-col items-center gap-4 md:flex-row md:items-end">
                                <div className="avatar">
                                    <div className="h-24 w-24 rounded-full ring ring-base-100 shadow-lg">
                                        <img src={avatarSrc} alt="Avatar" className="object-cover" />
                                    </div>
                                </div>
                                <div className="flex-1 text-center md:pb-1 md:text-left">
                                    <h1 className="text-2xl font-bold leading-tight text-foreground">
                                        {user.nama}
                                    </h1>
                                    <div className="mt-1 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                                        <span className="text-sm text-muted-foreground">{user.email}</span>
                                        {isVerified ? (
                                            <span className="badge badge-success badge-sm gap-1 text-white">
                                                <BadgeCheck size={12} /> Terverifikasi
                                            </span>
                                        ) : (
                                            <span className="badge badge-warning badge-sm gap-1">
                                                <MailWarning size={12} /> Belum verifikasi
                                            </span>
                                        )}
                                    </div>
                                    {(user.instansi || user.city) && (
                                        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground md:justify-start">
                                            {user.instansi && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Building2 size={13} /> {user.instansi}
                                                </span>
                                            )}
                                            {user.city && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin size={13} /> {user.city}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* GRID */}
                    <div className="grid grid-cols-1 items-start gap-6 md:gap-8 lg:grid-cols-3">

                        {/* KOLOM KIRI */}
                        <div className="space-y-6 lg:col-span-2">

                            {/* Foto Profil & ID Card */}
                            <Card className="overflow-hidden border-base-200 p-0 shadow-sm">
                                <SectionHeader
                                    icon={ImageIcon}
                                    title="Foto Profil & ID Card"
                                    subtitle="Foto ini tampil di artikel publik dan kartu keanggotaan Anda."
                                />
                                <div className="p-6">
                                    <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
                                        {/* Upload */}
                                        <div className="flex shrink-0 flex-col items-center gap-4">
                                            <div className="avatar">
                                                <div className="h-32 w-32 rounded-full shadow-md ring ring-primary ring-offset-2 ring-offset-base-100">
                                                    <img src={avatarSrc} alt="Avatar" className="object-cover" />
                                                </div>
                                            </div>
                                            <AvatarCrop onComplete={handleAvatarComplete} />
                                        </div>

                                        {/* Preview Member Card */}
                                        <div className="flex w-full flex-1 flex-col justify-center">
                                            {user.avatar ? (
                                                <MemberCard user={user} paket_terdaftar={paket_terdaftar} />
                                            ) : (
                                                <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-base-300 bg-base-200/30 p-6 text-center">
                                                    <AlertTriangle className="mb-3 h-10 w-10 text-warning opacity-80" />
                                                    <p className="mb-1 text-lg font-bold text-foreground">
                                                        Kartu Member Belum Tersedia
                                                    </p>
                                                    <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                                                        Pasang foto profil di sebelah kiri untuk men-generate ID Card otomatis.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Foto Thumbnail Berita */}
                            <Card className="overflow-hidden border-base-200 p-0 shadow-sm">
                                <SectionHeader
                                    icon={Newspaper}
                                    title="Foto Thumbnail Berita"
                                    subtitle="Foto berframe yang dipakai otomatis di setiap opini Anda."
                                />
                                <div className="p-6">
                                    <ThumbnailCrop
                                        currentThumbnail={thumbnail}
                                        onComplete={handleThumbnailComplete}
                                    />
                                </div>
                            </Card>

                            {/* Informasi Data Diri */}
                            <Card className="overflow-hidden border-base-200 p-0 shadow-sm">
                                <SectionHeader
                                    icon={User}
                                    title="Informasi Data Diri"
                                    subtitle="Perbarui nama, kontak, dan alamat Anda."
                                />
                                <div className="p-6">
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                        className="w-full"
                                    />
                                </div>
                            </Card>
                        </div>

                        {/* KOLOM KANAN (sticky) */}
                        <div className="space-y-6 lg:sticky lg:top-6 lg:col-span-1">
                            <Card className="overflow-hidden border-base-200 p-0 shadow-sm">
                                <SectionHeader
                                    icon={Key}
                                    title="Keamanan Akun"
                                    subtitle="Ubah kata sandi Anda secara berkala."
                                    tone="warning"
                                />
                                <div className="p-5">
                                    <UpdatePasswordForm className="w-full" />
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
import Alert from '@/Components/Alert';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { NotebookPen } from 'lucide-react';

export default function Create({ event, flash }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        narsum: '',
        city: '',
        contact: '',
        website: '', // honeypot — biarkan kosong
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('public-news.store', event.slug), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <GuestLayout>
            <Head title="Kirim Berita" />

            <div className="mb-6">
                <div className="flex items-center gap-2 text-primary mb-2">
                    <NotebookPen className="w-6 h-6" />
                    <h1 className="text-2xl font-bold">Kirim Berita</h1>
                    {event.category === 'lomba' && <span className="badge badge-secondary">Lomba</span>}
                </div>
                <p className="text-sm opacity-70">
                    Event: <span className="font-semibold">{event.name}</span> · sisa kuota{' '}
                    <span className="font-semibold">{event.quota_left}</span> kiriman
                </p>
                {event.description && (
                    <p className="mt-3 text-sm bg-base-200 rounded-lg p-3 whitespace-pre-line">
                        {event.description}
                    </p>
                )}
            </div>

            {flash?.success && (
                <div className="mb-4">
                    <Alert type="success" message={flash.success} dismissible />
                </div>
            )}
            {flash?.error && (
                <div className="mb-4">
                    <Alert type="error" message={flash.error} dismissible />
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="title" value="Judul Berita" />
                    <TextInput
                        id="title"
                        className="w-full"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="Judul berita"
                    />
                    <InputError message={errors.title} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="content" value="Isi Berita" />
                    <textarea
                        id="content"
                        className="textarea textarea-bordered w-full"
                        rows={8}
                        value={data.content}
                        onChange={(e) => setData('content', e.target.value)}
                        placeholder="Tulis isi berita di sini..."
                    />
                    <InputError message={errors.content} className="mt-1" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="narsum" value="Nama Anda" />
                        <TextInput
                            id="narsum"
                            className="w-full"
                            value={data.narsum}
                            onChange={(e) => setData('narsum', e.target.value)}
                            placeholder="Nama lengkap"
                        />
                        <InputError message={errors.narsum} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel htmlFor="city" value="Kota" />
                        <TextInput
                            id="city"
                            className="w-full"
                            value={data.city}
                            onChange={(e) => setData('city', e.target.value)}
                            placeholder="Kota asal"
                        />
                        <InputError message={errors.city} className="mt-1" />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="contact" value="Kontak (No. HP / Email)" />
                    <TextInput
                        id="contact"
                        className="w-full"
                        value={data.contact}
                        onChange={(e) => setData('contact', e.target.value)}
                        placeholder="Nomor HP atau email yang bisa dihubungi"
                    />
                    <InputError message={errors.contact} className="mt-1" />
                </div>

                {/* Honeypot: tersembunyi dari user, hanya bot yang mengisi */}
                <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={data.website}
                    onChange={(e) => setData('website', e.target.value)}
                    className="hidden"
                    aria-hidden="true"
                />

                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? 'Mengirim...' : 'Kirim Berita'}
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}

import Alert from '@/Components/Alert';
import InputError from '@/Components/InputError';
import InputImageUpload from '@/Components/InputImageUpload';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { NotebookPen } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

import { Cropper } from 'react-cropper';
import 'react-cropper/node_modules/cropperjs/dist/cropper.css';

const FRAME_SRC = '/images/frame-kopitimes.png';

export default function Create({ event, professions = [], flash }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        narsum: '',
        city: '',
        contact: '',
        profesi: '',
        image: null,
        website: '', // honeypot — biarkan kosong
    });

    // Cropper + frame (mekanisme sama dengan form penulis)
    const [imageToCrop, setImageToCrop] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const cropperRef = useRef(null);
    const [frameSize, setFrameSize] = useState(null);

    useEffect(() => {
        const img = new window.Image();
        img.src = FRAME_SRC;
        img.onload = () => setFrameSize({ width: img.naturalWidth, height: img.naturalHeight });
    }, []);

    const frameRatio = frameSize ? frameSize.width / frameSize.height : 16 / 9;

    const handleImageSelect = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setImageToCrop(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleCropperReady = () => {
        const cropper = cropperRef.current;
        if (!cropper) return;
        const container = cropper.getContainerData();
        cropper.setCropBoxData({ left: 0, top: 0, width: container.width, height: container.height });
    };

    const handleSaveCrop = () => {
        const cropper = cropperRef.current;
        if (!cropper || !frameSize) return;

        const croppedCanvas = cropper.getCroppedCanvas({
            width: frameSize.width,
            height: frameSize.height,
            fillColor: '#FFFFFF',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        });

        const frameImage = new window.Image();
        frameImage.src = FRAME_SRC;
        frameImage.onload = () => {
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = frameSize.width;
            finalCanvas.height = frameSize.height;
            const ctx = finalCanvas.getContext('2d');
            ctx.drawImage(croppedCanvas, 0, 0);
            ctx.drawImage(frameImage, 0, 0, finalCanvas.width, finalCanvas.height);

            finalCanvas.toBlob((blob) => {
                const file = new File([blob], 'thumbnail_kopitimes.jpg', {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                setData('image', file);
                setPreviewUrl(URL.createObjectURL(blob));
                setImageToCrop(null);
            }, 'image/jpeg', 0.85);
        };
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('public-news.store', event.slug), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setPreviewUrl(null);
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="Kirim Berita" />

            <div className="mb-6">
                <div className="flex items-center gap-2 text-primary mb-2">
                    <NotebookPen className="w-6 h-6" />
                    <h1 className="text-2xl font-bold">Kirim Berita</h1>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="profesi" value="Profesi" />
                        <select
                            id="profesi"
                            className="select select-bordered w-full"
                            value={data.profesi}
                            onChange={(e) => setData('profesi', e.target.value)}
                        >
                            <option value="" disabled>Pilih profesi</option>
                            {professions.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.profesi} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel htmlFor="contact" value="Kontak (No. HP / Email)" />
                        <TextInput
                            id="contact"
                            className="w-full"
                            value={data.contact}
                            onChange={(e) => setData('contact', e.target.value)}
                            placeholder="No. HP / email"
                        />
                        <InputError message={errors.contact} className="mt-1" />
                    </div>
                </div>

                <div>
                    <InputLabel value="Foto" />
                    {previewUrl ? (
                        <div className="space-y-2">
                            <img src={previewUrl} alt="Preview" className="w-full rounded-lg border border-base-200" />
                            <button
                                type="button"
                                className="btn btn-sm btn-ghost bg-base-200"
                                onClick={() => { setPreviewUrl(null); setData('image', null); }}
                            >
                                Ganti Foto
                            </button>
                        </div>
                    ) : (
                        <InputImageUpload
                            label="Unggah foto terbaik Anda"
                            value={data.image}
                            onChange={(file) => handleImageSelect(file)}
                        />
                    )}
                    <InputError message={errors.image} className="mt-1" />
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

            {/* Modal Cropper + Frame */}
            {imageToCrop && frameSize && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
                    <style>{`
                        .custom-cropper .cropper-point,
                        .custom-cropper .cropper-line,
                        .custom-cropper .cropper-center,
                        .custom-cropper .cropper-dashed { display: none !important; }
                        .custom-cropper .cropper-view-box { outline: none !important; }
                    `}</style>

                    <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-4xl">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Sesuaikan Posisi Foto</h2>

                        <div
                            className="relative mx-auto bg-gray-200 overflow-hidden"
                            style={{
                                aspectRatio: `${frameSize.width} / ${frameSize.height}`,
                                width: `min(100%, calc(60vh * ${frameRatio}))`,
                            }}
                        >
                            <Cropper
                                className="custom-cropper"
                                src={imageToCrop}
                                style={{ height: '100%', width: '100%', position: 'absolute' }}
                                aspectRatio={frameRatio}
                                viewMode={0}
                                autoCropArea={1}
                                dragMode="move"
                                cropBoxMovable={false}
                                cropBoxResizable={false}
                                toggleDragModeOnDblclick={false}
                                modal={false}
                                highlight={false}
                                guides={false}
                                center={false}
                                background={false}
                                checkOrientation={true}
                                ready={handleCropperReady}
                                onInitialized={(instance) => { cropperRef.current = instance; }}
                            />
                            <img
                                src={FRAME_SRC}
                                alt="Frame Overlay"
                                className="absolute inset-0 w-full h-full pointer-events-none z-50"
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button type="button" className="btn btn-ghost bg-gray-200" onClick={() => setImageToCrop(null)}>
                                Batal
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleSaveCrop}>
                                Potong & Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </GuestLayout>
    );
}

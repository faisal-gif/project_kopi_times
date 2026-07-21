import Card from '@/Components/Card'
import InputEditor from '@/Components/InputEditor'
import InputError from '@/Components/InputError'
import InputImageUpload from '@/Components/InputImageUpload'
import InputLabel from '@/Components/InputLabel'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm, usePage, Link } from '@inertiajs/react'
import { NotebookPenIcon, Settings2, ImageIcon, Lock, PencilLine } from 'lucide-react'
import React, { useState, useRef, useEffect } from 'react'

// Import React Cropper
import { Cropper } from 'react-cropper';
import 'react-cropper/node_modules/cropperjs/dist/cropper.css';

const FRAME_SRC = '/images/frame-kopitimes.png';

function Create({ narsum_detail, thumbnail }) {
    // thumbnail = URL foto jadi dari images_thumbnail (null jika user belum pernah upload)
    const { auth } = usePage().props;
    const user = auth.user;

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        city: narsum_detail?.city ? narsum_detail.city : '',
        narsum: narsum_detail?.narsum ? narsum_detail.narsum : '',
        profesi: narsum_detail?.profesi ? narsum_detail.profesi : '',
        contact: narsum_detail?.contact ? narsum_detail.contact : '',
        image: null,
        caption: '',
    });

    // State untuk Cropper
    const [imageToCrop, setImageToCrop] = useState(null);
    const cropperRef = useRef(null);

    // Ukuran asli frame PNG (dipakai sebagai acuan rasio & resolusi output)
    const [frameSize, setFrameSize] = useState(null);

    useEffect(() => {
        const img = new window.Image();
        img.src = FRAME_SRC;
        img.onload = () => setFrameSize({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => alert('Gagal memuat frame. Pastikan path file benar.');
    }, []);

    // Rasio mengikuti frame asli, BUKAN hardcode 16:9
    const frameRatio = frameSize ? frameSize.width / frameSize.height : 16 / 9;

    // Fungsi untuk mencegat file gambar yang diupload
    const handleImageSelect = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setImageToCrop(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // KUNCI PERBAIKAN #1:
    // Paksa crop box menutupi SELURUH container, sehingga area yang di-crop
    // = persis area yang terlihat user di bawah frame (WYSIWYG).
    const handleCropperReady = () => {
        const cropper = cropperRef.current;
        if (!cropper) return;
        const container = cropper.getContainerData();
        cropper.setCropBoxData({
            left: 0,
            top: 0,
            width: container.width,
            height: container.height,
        });
    };

    // KUNCI PERBAIKAN #2:
    // getCroppedCanvas diberi width/height sesuai resolusi frame + fillColor,
    // jadi hasil yang dikirim ke BE identik dengan preview.
    const handleSaveCrop = () => {
        const cropper = cropperRef.current;
        if (!cropper || !frameSize) return;

        const croppedCanvas = cropper.getCroppedCanvas({
            width: frameSize.width,
            height: frameSize.height,
            fillColor: '#FFFFFF', // area kosong (foto tidak menutupi frame) jadi putih
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

            // Foto user (sudah 1:1 dengan resolusi frame, tanpa stretch/distorsi)
            ctx.drawImage(croppedCanvas, 0, 0);
            // Frame di atasnya
            ctx.drawImage(frameImage, 0, 0, finalCanvas.width, finalCanvas.height);

            finalCanvas.toBlob((blob) => {
                const finalDataFile = new File([blob], 'thumbnail_kopitimes.jpg', {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                setData('image', finalDataFile);
                setImageToCrop(null);
            }, 'image/jpeg', 0.85);
        };

        frameImage.onerror = () => {
            alert('Gagal memuat frame. Pastikan path file benar.');
        };
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('news.store'));
    };

    return (
        <div>
            <Head title="Add News" />
            <AuthenticatedLayout>
                <div className="py-12">
                    <div className="mx-auto px-2 md:px-6">

                        <div className=" space-y-6">
                            <div className='flex flex-col md:flex-row justify-between md:items-center gap-2'>
                                {/* start Header */}
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Add News</h1>
                                </div>
                                {/* end Header */}

                                {/* start breadcrumbs */}
                                <div className="breadcrumbs text-sm">
                                    <ul>
                                        <li><a>Home</a></li>
                                        <li>Opini</li>
                                        <li>Tambah Opini</li>
                                    </ul>
                                </div>
                                {/* end breadcrumbs */}
                            </div>

                            <form onSubmit={submit} className='space-y-6'>

                                {/* Card Konten Berita */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <NotebookPenIcon className='w-6 h-6' /> Kopi TIMES
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-6'>
                                            <InputLabel
                                                htmlFor="title"
                                                value="Judul Opini"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <TextInput
                                                id="title"
                                                name="title"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                autoComplete="title"
                                            />
                                            <InputError message={errors.title} className="mt-2" />
                                        </div>
                                        <div className='lg:col-span-6'>
                                            <InputLabel
                                                htmlFor="content"
                                                value="Konten Opini"
                                                className='mb-2 label-text font-bold'
                                            />
                                            <InputEditor
                                                value={data.content}
                                                onChange={(e) => setData('content', e)}
                                            />
                                            <InputError message={errors.content} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                {/* Card Narasumber & Lokasi */}
                                {
                                    user.type != 4 ? (
                                        <Card
                                            title={
                                                <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                                    <Settings2 className='w-6 h-6' /> Narasumber & Lokasi
                                                </span>
                                            }
                                        >
                                            <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                                <div className='lg:col-span-6'>
                                                    <InputLabel
                                                        htmlFor="city"
                                                        value="Kota"
                                                        className='mb-2 label-text font-bold'
                                                    />
                                                    <TextInput
                                                        id="city"
                                                        name="Kota"
                                                        type="text"
                                                        className="mt-1 block w-full"
                                                        value={data.city}
                                                        onChange={(e) => setData('city', e.target.value)}
                                                        autoComplete="city"
                                                    />
                                                    <InputError message={errors.city} className="mt-2" />
                                                </div>
                                                <div className='lg:col-span-6'>
                                                    <InputLabel
                                                        htmlFor="narsum"
                                                        value="Narasumber"
                                                        className='mb-2 label-text font-bold'
                                                    />
                                                    <TextInput
                                                        id="narsum"
                                                        name="Narasumber"
                                                        type="text"
                                                        className="mt-1 block w-full"
                                                        value={data.narsum}
                                                        onChange={(e) => setData('narsum', e.target.value)}
                                                        autoComplete="narsum"
                                                    />
                                                    <InputError message={errors.narsum} className="mt-2" />
                                                </div>
                                                <div className='lg:col-span-6'>
                                                    <InputLabel
                                                        htmlFor="profesi"
                                                        value="Profesi"
                                                        className='mb-2 label-text font-bold'
                                                    />
                                                    <TextInput
                                                        id="profesi"
                                                        name="Profesi"
                                                        type="text"
                                                        className="mt-1 block w-full"
                                                        value={data.profesi}
                                                        onChange={(e) => setData('profesi', e.target.value)}
                                                        autoComplete="profesi"
                                                    />
                                                    <InputError message={errors.profesi} className="mt-2" />
                                                </div>
                                                <div className='lg:col-span-6'>
                                                    <InputLabel
                                                        htmlFor="contact"
                                                        value="Kontak"
                                                        className='mb-2 label-text font-bold'
                                                    />
                                                    <TextInput
                                                        id="contact"
                                                        name="contact"
                                                        type="text"
                                                        className="mt-1 block w-full"
                                                        value={data.contact}
                                                        onChange={(e) => setData('contact', e.target.value)}
                                                        autoComplete="contact"
                                                    />
                                                    <InputError message={errors.contact} className="mt-2" />
                                                </div>
                                            </div>
                                        </Card>
                                    ) : ''
                                }

                                {/* Card Publish (Upload & Crop) */}
                                <Card
                                    title={
                                        <span className="flex flex-row gap-2 items-center text-2xl font-semibold text-foreground ">
                                            <ImageIcon className='w-6 h-6' /> Foto
                                        </span>
                                    }
                                >
                                    <div className='grid grid-cols-1 lg:grid-cols-6 gap-4 mt-8'>
                                        <div className='lg:col-span-2'>
                                            {thumbnail ? (
                                                // Sudah punya thumbnail: terkunci, hanya bisa diganti dari profil
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <span className="label-text font-bold">Foto Anda</span>
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                                            <Lock size={11} /> Terkunci
                                                        </span>
                                                    </div>

                                                    <div className="relative">
                                                        <img
                                                            src={thumbnail}
                                                            alt="Thumbnail"
                                                            className="w-full rounded-lg border border-base-200"
                                                        />
                                                    </div>

                                                    <div className="mt-3 rounded-lg border border-base-200 bg-base-100 p-3">
                                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                                            Foto ini otomatis dipakai untuk setiap opini Anda. Untuk menggantinya,
                                                            buka pengaturan profil — perubahan hanya berlaku untuk opini berikutnya.
                                                        </p>
                                                        <Link
                                                            href={route('profile.edit')}
                                                            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline underline-offset-2 hover:opacity-80"
                                                        >
                                                            <PencilLine size={14} /> Ganti Foto Thumbnail
                                                        </Link>
                                                    </div>
                                                </div>
                                            ) : (
                                                <InputImageUpload
                                                    label="Foto Terbaik Anda (hanya bisa diunggah sekali)"
                                                    value={data.image}
                                                    onChange={(file) => handleImageSelect(file)}
                                                />
                                            )}
                                            <InputError message={errors.image} className="mt-2" />
                                        </div>

                                        <div className='lg:col-span-6'>
                                            <InputTextarea
                                                id="caption"
                                                name="Caption Image"
                                                label={"Caption Image"}
                                                value={data.caption}
                                                onChange={(e) => setData('caption', e.target.value)}
                                                autoComplete="caption"
                                                maxLength={255}
                                            />
                                            <InputError message={errors.caption} className="mt-2" />
                                        </div>
                                    </div>
                                </Card>

                                <div className='flex flex-row justify-end mt-4'>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={processing}
                                    >
                                        Kirim untuk Review
                                    </button>
                                </div>

                            </form>
                        </div>

                    </div>
                </div>
            </AuthenticatedLayout>

            {/* Modal / Tampilan Cropper */}
            {imageToCrop && frameSize && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
                    {/* CSS untuk menyembunyikan garis/titik crop box (prop cropBox={false} tidak ada di cropperjs) */}
                    <style>{`
                        .custom-cropper .cropper-point,
                        .custom-cropper .cropper-line,
                        .custom-cropper .cropper-center,
                        .custom-cropper .cropper-dashed { display: none !important; }
                        .custom-cropper .cropper-view-box { outline: none !important; }
                    `}</style>

                    <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-4xl">
                        <h2 className="text-xl font-bold mb-4">Sesuaikan Posisi Foto</h2>

                        {/* KUNCI PERBAIKAN #3:
                            Container dipaksa punya rasio PERSIS sama dengan frame,
                            sehingga preview frame tidak terpotong/terdistorsi (bukan object-cover) */}
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
                                style={{ height: "100%", width: "100%", position: "absolute" }}
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
                                onInitialized={(instance) => {
                                    cropperRef.current = instance;
                                }}
                            />

                            {/* Layer Frame PNG — object-fill karena rasio container sudah = rasio frame */}
                            <img
                                src={FRAME_SRC}
                                alt="Frame Overlay"
                                className="absolute inset-0 w-full h-full pointer-events-none z-50"
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                className="btn btn-ghost bg-gray-200"
                                onClick={() => setImageToCrop(null)}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSaveCrop}
                            >
                                Potong & Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Create
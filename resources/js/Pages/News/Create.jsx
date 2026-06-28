import Card from '@/Components/Card'
import InputEditor from '@/Components/InputEditor'
import InputError from '@/Components/InputError'
import InputImageUpload from '@/Components/InputImageUpload'
import InputLabel from '@/Components/InputLabel'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm, usePage } from '@inertiajs/react'
import { NotebookPenIcon, Settings2, ImageIcon } from 'lucide-react'
import React, { useState } from 'react'

// Import React Cropper
import { Cropper } from 'react-cropper';
import 'react-cropper/node_modules/cropperjs/dist/cropper.css';

function Create({ narsum_detail }) {
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
    const [cropper, setCropper] = useState(null);

    // Fungsi untuk mencegat file gambar yang diupload
    const handleImageSelect = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result); // Set base64 gambar ke cropper
            };
            reader.readAsDataURL(file);
        }
    };

    // Fungsi untuk mengeksekusi Crop & Compress
    const handleSaveCrop = () => {
        if (cropper) {
            // 1. Dapatkan kanvas asli dari cropper
            const canvas = cropper.getCroppedCanvas();

            // 2. Hitung rasio untuk membatasi ukuran (maksimal 1200px)
            let width = canvas.width;
            let height = canvas.height;
            const maxSize = 1200;

            if (width > maxSize || height > maxSize) {
                if (width > height) {
                    height = Math.round((height * maxSize) / width);
                    width = maxSize;
                } else {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
                }
            }

            // 3. Buat kanvas baru yang ukurannya sudah diperkecil
            const resizedCanvas = document.createElement("canvas");
            resizedCanvas.width = width;
            resizedCanvas.height = height;
            const ctx = resizedCanvas.getContext("2d");

            // (Opsional) Beri background putih agar gambar transparan (PNG asli) tidak jadi hitam di JPEG
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);

            // Gambar ulang hasil crop ke kanvas yang lebih kecil
            ctx.drawImage(canvas, 0, 0, width, height);

            // 4. Ubah ke format JPEG (Dijamin terkompresi di semua browser)
            resizedCanvas.toBlob((blob) => {

                // Cek ukuran file di console browser Anda (Tekan F12 -> Console)
                console.log("Ukuran file siap kirim:", (blob.size / 1024).toFixed(2), "KB");

                const croppedFile = new File([blob], "image_cropped.jpg", {
                    type: "image/jpeg",
                    lastModified: Date.now()
                });

                setData("image", croppedFile); // Masukkan ke form Inertia
                setImageToCrop(null); // Tutup modal

            }, 'image/jpeg', 0.8); // 0.8 = Kualitas JPEG 80%
        }
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
                                            <InputImageUpload
                                                label="Foto Terbaik Anda"
                                                value={data.image}
                                                // Mencegat file yang dipilih untuk ditampilkan di Cropper terlebih dahulu
                                                onChange={(file) => handleImageSelect(file)}
                                            />
                                        </div>

                                        {/* Jika butuh Image 2 dan 3, Anda bisa menambahkan fungsi handleImageSelect yang dinamis untuk state yang berbeda, namun di contoh ini saya hide sesuai aslinya */}

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
            {imageToCrop && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-2xl">
                        <h2 className="text-xl font-bold mb-4">Crop Gambar (Portrait)</h2>

                        <div className="w-full h-[60vh] md:h-[400px]">
                            <Cropper
                                src={imageToCrop}
                                style={{ height: "100%", width: "100%" }}
                                // Rasio 3:4 untuk portrait
                                initialAspectRatio={3 / 4}
                                // Mengunci aspek rasio agar user tidak bisa mengubah kotaknya menjadi landscape
                                aspectRatio={3 / 4}
                                guides={true}
                                onInitialized={(instance) => {
                                    setCropper(instance);
                                }}
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
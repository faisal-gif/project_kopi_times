import Card from '@/Components/Card'
import InputEditor from '@/Components/InputEditor'
import InputError from '@/Components/InputError'
import InputImageUpload from '@/Components/InputImageUpload'
import InputLabel from '@/Components/InputLabel'
import InputTextarea from '@/Components/InputTextarea'
import TextInput from '@/Components/TextInput'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head, useForm, usePage } from '@inertiajs/react'
import { Calendar1Icon, CaptionsIcon, CopyIcon, DollarSignIcon, EyeIcon, GalleryThumbnails, GlobeIcon, ImageIcon, ImagesIcon, InfoIcon, NotebookPenIcon, Settings2 } from 'lucide-react'
import React from 'react'


function Create({narsum_detail}) {
  const { auth } = usePage().props;
    const user = auth.user;
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        city:  narsum_detail.city ? narsum_detail.city : '',
        narsum: narsum_detail.narsum ? narsum_detail.narsum : '',
        profesi: narsum_detail.profesi ? narsum_detail.profesi : '',
        contact: narsum_detail.contact ? narsum_detail.contact : '',
        image: null,
        image_2: null,
        image_3: null,
        caption: '',

    });

  


    const submit = (e) => {
        e.preventDefault();
        post(route('news.store'));
    };


    return (
        <div>
            <Head title="Add News" />
            <AuthenticatedLayout >
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
                                        <li>News</li>
                                        <li>Add News</li>
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

                                {/* Card laninnya */}
                                {
                                    user.type != 4 ? (<Card
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

                                    </Card>) :
                                        ''
                                }

                                {/* Card Publish */}
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
                                                onChange={(file) => setData("image", file)}
                                            />
                                        </div>
                                        {/* <div className='lg:col-span-2'>
                                            <InputImageUpload
                                                label="Gambar B"
                                                value={data.image_2}
                                                onChange={(file) => setData("image_2", file)}
                                            />
                                        </div>
                                        <div className='lg:col-span-2'>
                                            <InputImageUpload
                                                label="Gambar C"
                                                value={data.image_3}
                                                onChange={(file) => setData("image_3", file)}
                                            />
                                        </div> */}
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
                                        Simpan
                                    </button>
                                </div>

                            </form>

                        </div>

                    </div>
                </div>
            </AuthenticatedLayout>
        </div>
    )
}

export default Create
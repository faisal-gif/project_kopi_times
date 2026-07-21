import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Save } from 'lucide-react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        nama: user.nama || '', // Menggunakan 'nama' sesuai DB
        email: user.email || '',
        contact: user.contact || '',
        instansi: user.instansi || '',
        prov: user.prov || '',
        city: user.city || '',
        address: user.address || '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nama */}
                    <div className="md:col-span-2">
                        <InputLabel htmlFor="nama" value="Nama Lengkap" className="font-bold mb-1.5" />
                        <TextInput
                            id="nama"
                            className="block w-full"
                            value={data.nama}
                            onChange={(e) => setData('nama', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />
                        <InputError className="mt-2" message={errors.nama} />
                    </div>

                    {/* Email */}
                    <div>
                        <InputLabel htmlFor="email" value="Alamat Email" className="font-bold mb-1.5" />
                        <TextInput
                            id="email"
                            type="email"
                            className="block w-full bg-base-200/50"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>

                    {/* Contact WA */}
                    <div>
                        <InputLabel htmlFor="contact" value="No. WhatsApp / HP" className="font-bold mb-1.5" />
                        <TextInput
                            id="contact"
                            type="text"
                            className="block w-full"
                            value={data.contact}
                            onChange={(e) => setData('contact', e.target.value)}
                            placeholder="Contoh: 08123456789"
                        />
                        <InputError className="mt-2" message={errors.contact} />
                    </div>

                    {/* Instansi */}
                    <div className="md:col-span-2 border-t border-base-200 pt-6">
                        <InputLabel htmlFor="instansi" value="Instansi / Organisasi" className="font-bold mb-1.5" />
                        <TextInput
                            id="instansi"
                            type="text"
                            className="block w-full"
                            value={data.instansi}
                            onChange={(e) => setData('instansi', e.target.value)}
                            placeholder="Nama perusahaan atau media tempat Anda bernaung"
                        />
                        <InputError className="mt-2" message={errors.instansi} />
                    </div>

                    {/* Provinsi */}
                    <div>
                        <InputLabel htmlFor="prov" value="Provinsi" className="font-bold mb-1.5" />
                        <TextInput
                            id="prov"
                            type="text"
                            className="block w-full"
                            value={data.prov}
                            onChange={(e) => setData('prov', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.prov} />
                    </div>

                    {/* Kota */}
                    <div>
                        <InputLabel htmlFor="city" value="Kota / Kabupaten" className="font-bold mb-1.5" />
                        <TextInput
                            id="city"
                            type="text"
                            className="block w-full"
                            value={data.city}
                            onChange={(e) => setData('city', e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.city} />
                    </div>

                    {/* Alamat Lengkap */}
                    <div className="md:col-span-2">
                        <InputLabel htmlFor="address" value="Alamat Lengkap" className="font-bold mb-1.5" />
                        <textarea
                            id="address"
                            className="textarea textarea-bordered w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            rows="3"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                        />
                        <InputError className="mt-2" message={errors.address} />
                    </div>
                </div>

                {/* Email Verification Banner */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                        <p className="text-sm text-warning-content">
                            Alamat email Anda belum diverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-2 underline font-semibold hover:text-warning"
                            >
                                Klik di sini untuk mengirim ulang email verifikasi.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-bold text-success">
                                Tautan verifikasi baru telah dikirim ke alamat email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 border-t border-base-200 pt-6">
                    <button disabled={processing} className="btn btn-primary gap-2">
                        <Save size={18} /> Simpan Perubahan
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-y-2"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in-out duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-md">
                            Berhasil disimpan!
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
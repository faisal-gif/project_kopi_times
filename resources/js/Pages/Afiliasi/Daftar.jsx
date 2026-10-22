import Card from '@/Components/Card';
import InputError from '@/Components/InputError';
import InputSelect from '@/Components/InputSelect';
import InputTextarea from '@/Components/InputTextarea';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatRupiah } from '@/Utils/formatter';
import { Head, Link, useForm } from '@inertiajs/react';
import { Banknote, Share2, Users, Wallet } from 'lucide-react';

function Field({ id, label, error, hint, children }) {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground">{label}</label>
            {children}
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
            <InputError message={error} className="mt-1" />
        </div>
    );
}

export default function Daftar({ profile, pengundang = null, terms_url, min_payout }) {
    const { data, setData, post, processing, errors } = useForm({
        name: profile.name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        payout_method: 'bank',
        bank_name: '',
        bank_account_number: '',
        bank_account_name: profile.name ?? '',
        applicant_note: '',
        terms: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('afiliasi.daftar'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Ajukan Jadi Afiliator" />

            <div className="space-y-6">
                {pengundang && (
                    <div className="alert alert-info">
                        <span>
                            Anda diundang oleh <strong>{pengundang.name}</strong> untuk jadi afiliator.
                        </span>
                    </div>
                )}

                <Card className="border-base-200 shadow-sm">
                    <h3 className="flex items-center gap-2 text-lg font-bold">
                        <Share2 className="h-5 w-5 text-primary" /> Jadi Afiliator Kopi TIMES
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Ajak penulis lain bergabung lewat link referral Anda, dan dapatkan komisi untuk setiap
                        pendaftar baru yang menyelesaikan pembayaran.
                    </p>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[
                            { icon: Users, title: 'Link referral sendiri', body: 'Pendaftar yang masuk lewat link Anda tercatat otomatis.' },
                            { icon: Wallet, title: 'Komisi dua tingkat', body: '20% dari harga paket untuk rekrutan Anda, plus komisi dari jaringan di bawahnya.' },
                            { icon: Banknote, title: 'Transfer ke rekening', body: `Pencairan mulai ${formatRupiah(min_payout)}.` },
                        ].map((item) => (
                            <div key={item.title} className="rounded-xl bg-base-200/60 p-4">
                                <item.icon className="h-5 w-5 text-primary" />
                                <p className="mt-2 font-semibold text-foreground">{item.title}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="border-base-200 shadow-sm">
                    <h3 className="mb-1 text-lg font-bold">Formulir Pengajuan</h3>
                    <p className="mb-5 text-sm text-muted-foreground">
                        Pengajuan ditinjau tim kami lebih dulu. Anda akan melihat statusnya di halaman Afiliasi.
                    </p>

                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Field id="name" label="Nama" error={errors.name}>
                                <TextInput id="name" className="w-full" value={data.name}
                                    onChange={(e) => setData('name', e.target.value)} />
                            </Field>
                            <Field id="email" label="Email" error={errors.email}>
                                <TextInput id="email" type="email" className="w-full" value={data.email}
                                    onChange={(e) => setData('email', e.target.value)} />
                            </Field>
                        </div>

                        <Field id="phone" label="Nomor WhatsApp" error={errors.phone}
                            hint="Dipakai tim kami untuk mengabari status pengajuan dan pencairan.">
                            <TextInput id="phone" className="w-full" value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)} />
                        </Field>

                        <div className="border-t border-base-200 pt-5">
                            <p className="mb-4 font-semibold text-foreground">Rekening Pencairan</p>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <Field id="payout_method" label="Metode" error={errors.payout_method}>
                                    <InputSelect
                                        id="payout_method"
                                        value={data.payout_method}
                                        onChange={(e) => setData('payout_method', e.target.value)}
                                        options={[
                                            { value: 'bank', label: 'Transfer Bank' },
                                            { value: 'ewallet', label: 'E-Wallet' },
                                        ]}
                                    />
                                </Field>
                                <Field id="bank_name" label={data.payout_method === 'bank' ? 'Nama Bank' : 'Nama E-Wallet'} error={errors.bank_name}>
                                    <TextInput id="bank_name" className="w-full" value={data.bank_name}
                                        placeholder={data.payout_method === 'bank' ? 'BCA' : 'DANA'}
                                        onChange={(e) => setData('bank_name', e.target.value)} />
                                </Field>
                                <Field id="bank_account_number" label="Nomor Rekening" error={errors.bank_account_number}>
                                    <TextInput id="bank_account_number" className="w-full" value={data.bank_account_number}
                                        onChange={(e) => setData('bank_account_number', e.target.value)} />
                                </Field>
                                <Field id="bank_account_name" label="Nama Pemilik Rekening" error={errors.bank_account_name}>
                                    <TextInput id="bank_account_name" className="w-full" value={data.bank_account_name}
                                        onChange={(e) => setData('bank_account_name', e.target.value)} />
                                </Field>
                            </div>
                        </div>

                        <Field id="applicant_note" label="Siapa yang akan Anda ajak? (opsional)" error={errors.applicant_note}
                            hint="Misalnya: mahasiswa di kampus tempat saya mengajar, anggota organisasi profesi, komunitas menulis.">
                            <InputTextarea
                                id="applicant_note"
                                value={data.applicant_note}
                                onChange={(e) => setData('applicant_note', e.target.value)}
                                maxLength={1000}
                                placeholder="Ceritakan singkat audiens yang akan Anda jangkau"
                            />
                        </Field>

                        <div className="border-t border-base-200 pt-5">
                            <label htmlFor="terms" className="flex items-start gap-3 text-sm">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    className="checkbox checkbox-sm checkbox-primary mt-0.5"
                                    checked={data.terms}
                                    onChange={(e) => setData('terms', e.target.checked)}
                                />
                                <span className="text-muted-foreground">
                                    Saya telah membaca dan menyetujui{' '}
                                    <Link href={terms_url} className="link link-primary font-medium">
                                        Syarat &amp; Ketentuan Afiliasi
                                    </Link>
                                    .
                                </span>
                            </label>
                            <InputError message={errors.terms} className="mt-2" />
                        </div>

                        <PrimaryButton className="w-full sm:w-auto" disabled={processing}>
                            {processing ? 'Mengirim...' : 'Kirim Pengajuan'}
                        </PrimaryButton>
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

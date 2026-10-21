import Card from '@/Components/Card'
import { formatRupiah } from '@/Utils/formatter'
import { Head, Link, router, usePage } from '@inertiajs/react'
import { AlertTriangle, Check, Clock, Copy, ExternalLink, RefreshCw } from 'lucide-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Halaman pembayaran milik sendiri — pengganti halaman checkout Tripay.
 *
 * Semua yang ditampilkan di sini datang dari respons /transaction/create yang
 * sekarang disimpan: nomor VA, QRIS, deeplink, dan langkah-langkahnya.
 *
 * instructions[] dirender sebagai TEKS, bukan dangerouslySetInnerHTML. Isinya
 * memang dari Tripay dan bukan dari user, tapi ini halaman uang.
 */

function sisaWaktu(expiredAt) {
    if (!expiredAt) return null
    const detik = Math.floor((new Date(expiredAt).getTime() - Date.now()) / 1000)
    if (detik <= 0) return null

    const jam = Math.floor(detik / 3600)
    const menit = Math.floor((detik % 3600) / 60)
    const sisa = detik % 60

    return `${String(jam).padStart(2, '0')}:${String(menit).padStart(2, '0')}:${String(sisa).padStart(2, '0')}`
}

export default function Instruksi({ payment }) {
    const { flash } = usePage().props
    const [hitungan, setHitungan] = useState(() => sisaWaktu(payment.expired_at))
    const [disalin, setDisalin] = useState(false)
    const [mengecek, setMengecek] = useState(false)

    const menunggu = payment.status === 'pending'
    const lunas = payment.status === 'paid'
    const habis = !menunggu && !lunas

    // Tidak ada alat bayar sama sekali: baris lama sebelum kolomnya ada, atau channel
    // yang bentuknya tak terduga. Jatuhkan ke halaman Tripay daripada halaman kosong.
    const tanpaAlatBayar = !payment.qr_url && !payment.pay_code && !payment.pay_url

    useEffect(() => {
        if (!menunggu) return
        const t = setInterval(() => setHitungan(sisaWaktu(payment.expired_at)), 1000)
        return () => clearInterval(t)
    }, [menunggu, payment.expired_at])

    // Polling ringan selama halaman terbuka dan pembayaran masih menunggu, supaya
    // user tidak perlu menekan tombol untuk tahu pembayarannya sudah masuk.
    const pollRef = useRef(null)
    useEffect(() => {
        if (!menunggu) return
        pollRef.current = setInterval(() => {
            router.post(route('pembayaran.cek', payment.merchant_ref), {}, {
                preserveScroll: true,
                preserveState: true,
                only: ['payment', 'flash'],
            })
        }, 15000)
        return () => clearInterval(pollRef.current)
    }, [menunggu, payment.merchant_ref])

    const cekSekarang = () => {
        setMengecek(true)
        router.post(route('pembayaran.cek', payment.merchant_ref), {}, {
            preserveScroll: true,
            onFinish: () => setMengecek(false),
        })
    }

    const salin = () => {
        navigator.clipboard.writeText(payment.pay_code)
        setDisalin(true)
        setTimeout(() => setDisalin(false), 2000)
    }

    const langkah = useMemo(() => payment.instructions || [], [payment.instructions])

    return (
        <>
            <Head title="Pembayaran" />
            <div className="min-h-screen bg-base-200 p-4">
                <div className="mx-auto max-w-2xl space-y-5 py-8">

                    {lunas && (
                        <Card>
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                                    <Check className="h-5 w-5 text-green-700" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold">Pembayaran berhasil</h1>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Akun Anda sudah aktif. Selamat menulis di Kopi TIMES.
                                    </p>
                                    <Link href={route('dashboard')} className="btn btn-primary mt-4">
                                        Buka Dashboard
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    )}

                    {habis && (
                        <Card>
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                                    <Clock className="h-5 w-5 text-amber-700" />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-lg font-bold">Pembayaran {payment.status_label?.toLowerCase()}</h1>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Batas waktunya sudah lewat dan nomor pembayarannya tidak berlaku lagi.
                                        Buat ulang dengan cara yang sama, atau pilih cara lain.
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => router.post(route('pembayaran.ulang', payment.merchant_ref))}
                                        >
                                            <RefreshCw className="mr-1 h-4 w-4" />
                                            Buat ulang pembayaran {payment.payment_name}
                                        </button>
                                        <Link href={route('checkout')} className="btn btn-ghost">
                                            Pilih cara lain
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {menunggu && (
                        <>
                            <Card>
                                <div className="text-center">
                                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                        Jumlah yang harus dibayar
                                    </p>
                                    <p className="mt-1 text-4xl font-bold">{formatRupiah(payment.total_amount)}</p>

                                    <div className="mx-auto mt-4 max-w-xs space-y-1 text-sm">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>{payment.package_name}</span>
                                            <span>{formatRupiah(payment.amount)}</span>
                                        </div>
                                        {payment.fee_customer > 0 && (
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Biaya admin</span>
                                                <span>{formatRupiah(payment.fee_customer)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="mt-4 text-sm">
                                        lewat <strong>{payment.payment_name}</strong>
                                    </p>

                                    {hitungan && (
                                        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-base-300 px-3 py-1 text-sm">
                                            <Clock className="h-4 w-4" />
                                            Bayar dalam <span className="font-mono font-bold">{hitungan}</span>
                                        </p>
                                    )}
                                </div>
                            </Card>

                            {tanpaAlatBayar ? (
                                <Card>
                                    <div className="flex items-start gap-3 text-sm">
                                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                        <div>
                                            <p className="font-semibold">Rincian pembayaran tidak tersedia di halaman ini.</p>
                                            <p className="mt-1 text-muted-foreground">
                                                Lanjutkan di halaman penyedia pembayaran.
                                            </p>
                                            {payment.checkout_url && (
                                                <a
                                                    href={payment.checkout_url}
                                                    className="btn btn-primary mt-3"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <ExternalLink className="mr-1 h-4 w-4" /> Buka halaman pembayaran
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ) : (
                                <Card>
                                    {payment.qr_url && (
                                        <div className="text-center">
                                            <p className="mb-3 text-sm font-semibold">Pindai QR ini</p>
                                            <img
                                                src={payment.qr_url}
                                                alt="Kode QR pembayaran"
                                                className="mx-auto h-64 w-64 rounded-lg border bg-white p-2"
                                            />
                                        </div>
                                    )}

                                    {payment.pay_code && (
                                        <div className="text-center">
                                            <p className="mb-2 text-sm font-semibold">Nomor pembayaran</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <code className="rounded-lg bg-base-300 px-4 py-3 font-mono text-2xl tracking-wider">
                                                    {payment.pay_code}
                                                </code>
                                                <button type="button" className="btn btn-ghost btn-sm" onClick={salin}>
                                                    {disalin ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            {disalin && <p className="mt-1 text-xs text-green-700">Nomor disalin.</p>}
                                        </div>
                                    )}

                                    {payment.pay_url && (
                                        <div className="mt-4 text-center">
                                            <a href={payment.pay_url} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="mr-1 h-4 w-4" /> Buka aplikasi pembayaran
                                            </a>
                                        </div>
                                    )}
                                </Card>
                            )}

                            <Card>
                                <button
                                    type="button"
                                    className="btn btn-primary w-full"
                                    onClick={cekSekarang}
                                    disabled={mengecek}
                                >
                                    <RefreshCw className={`mr-1 h-4 w-4 ${mengecek ? 'animate-spin' : ''}`} />
                                    {mengecek ? 'Memeriksa...' : 'Saya sudah bayar, cek status'}
                                </button>
                                <p className="mt-2 text-center text-xs text-muted-foreground">
                                    Status juga diperiksa otomatis selama halaman ini terbuka.
                                </p>
                                {flash?.error && <p className="mt-2 text-center text-xs text-red-700">{flash.error}</p>}
                                {flash?.info && <p className="mt-2 text-center text-xs text-muted-foreground">{flash.info}</p>}
                            </Card>

                            {langkah.length > 0 && (
                                <Card title={<span className="text-lg font-semibold">Cara membayar</span>}>
                                    <div className="mt-3 space-y-4">
                                        {langkah.map((bagian, i) => (
                                            <div key={i}>
                                                <p className="text-sm font-semibold">{bagian.title}</p>
                                                <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                                                    {(bagian.steps || []).map((s, j) => (
                                                        // Sengaja teks, bukan innerHTML.
                                                        <li key={j}>{String(s).replace(/<[^>]*>/g, '')}</li>
                                                    ))}
                                                </ol>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </>
                    )}

                    <p className="text-center text-xs text-muted-foreground">
                        Kode transaksi: <span className="font-mono">{payment.merchant_ref}</span>
                    </p>
                </div>
            </div>
        </>
    )
}

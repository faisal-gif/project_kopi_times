import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDate } from '@/Utils/formatter'
import { Head, Link } from '@inertiajs/react'
import { 
    Briefcase, Calendar, Clock, Link2Icon, MapPin, Phone, User,
    Instagram, FileText, CheckCircle, AlertCircle, ExternalLink, ArrowLeft, 
    Layers
} from 'lucide-react';
import React from 'react'

function Show({ news }) {

    function getStatusBadge(status) {
        switch (status) {
            case "pending":
            case '0':
            case 0:
                return <span className="badge badge-secondary border-none bg-secondary/20 text-secondary-content">Pending</span>;
            case "Review":
            case '2':
            case 2:
                return <span className="badge badge-warning border-none bg-warning/20 text-warning-content">Review</span>;
            case "On Pro":
            case '3':
            case 3:
                return <span className="badge badge-error border-none bg-error/20 text-error-content">OnPro</span>;
            case "Publish":
            case '1':
            case 1:
                return <span className="badge badge-success border-none bg-success/20 text-success-content">Publish</span>;
            default:
                return <span className="badge badge-neutral">{status}</span>;
        }
    }

    // Helper untuk merender Info Addon
    function renderAddonDetail(req) {
        const config = {
            feed_instagram: { icon: <Instagram className="w-4 h-4 text-pink-500" />, label: 'Feed IG', color: 'border-pink-200 bg-pink-50/50' },
            ekoran: { icon: <FileText className="w-4 h-4 text-blue-500" />, label: 'Ekoran', color: 'border-blue-200 bg-blue-50/50' },
            wa_channel: { icon: <Phone className="w-4 h-4 text-green-500" />, label: 'WA Channel', color: 'border-green-200 bg-green-50/50' },
        }[req.jenis_request] || { icon: <Layers className="w-4 h-4" />, label: req.jenis_request, color: 'border-base-300 bg-base-200/50' };

        return (
            <div key={req.id} className={`p-4 rounded-xl border ${config.color} flex flex-col justify-between shadow-sm transition-all hover:shadow-md`}>
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                            {config.icon} {config.label}
                        </div>
                        {/* Status Badge Addon */}
                        {req.status === 'pending' && <span className="badge badge-sm badge-neutral">Antre</span>}
                        {req.status === 'processing' && <span className="badge badge-sm badge-warning">Diproses</span>}
                        {req.status === 'completed' && <span className="badge badge-sm badge-success text-white">Selesai</span>}
                        {req.status === 'rejected' && <span className="badge badge-sm badge-error text-white">Ditolak</span>}
                    </div>

                    <div className="text-sm">
                        <p className="text-muted-foreground text-xs mb-1">
                            Diminta: <span className="font-medium text-foreground">{formatDate(req.created_at)}</span>
                        </p>
                        
                        {req.status === 'rejected' && (
                            <div className="mt-3 p-2.5 bg-red-100/80 text-red-800 rounded-lg text-xs flex gap-2 items-start border border-red-200">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold block mb-0.5">Alasan Penolakan:</span>
                                    <span className="leading-tight block">{req.keterangan_admin || 'Tidak ada keterangan tambahan.'}</span>
                                </div>
                            </div>
                        )}
                        
                        {(req.status === 'pending' || req.status === 'processing') && (
                            <p className="mt-2 text-xs text-muted-foreground italic flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Tim redaksi sedang memproses...
                            </p>
                        )}
                    </div>
                </div>

                {req.status === 'completed' && req.url_hasil && (
                    <div className="mt-4 pt-3 border-t border-black/10">
                        <a 
                            href={req.url_hasil} 
                            target="_blank" 
                            rel="noreferrer"
                            className="btn btn-sm btn-primary w-full flex items-center justify-center gap-2 shadow-sm"
                        >
                            <CheckCircle className="w-4 h-4" /> Lihat Hasil <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            <Head title={news.title} />
            <AuthenticatedLayout>
                <div className="py-8 md:py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        
                        {/* Breadcrumb & Back Button */}
                        <div className="flex items-center gap-4 mb-6">
                            <Link href={route('news.index')} className="btn btn-circle btn-sm btn-ghost bg-base-200 hover:bg-base-300">
                                <ArrowLeft size={18} />
                            </Link>
                            <div className="text-sm breadcrumbs text-muted-foreground">
                                <ul>
                                    <li><Link href={route('dashboard')}>Home</Link></li>
                                    <li><Link href={route('news.index')}>Opini Saya</Link></li>
                                    <li className="text-foreground font-medium truncate max-w-[200px] md:max-w-md">{news.title}</li>
                                </ul>
                            </div>
                        </div>

                        {/* ================= LAYOUT 2 KOLOM ================= */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                            
                            {/* KOLOM KIRI: MAIN CONTENT (Besar) */}
                            <div className="lg:col-span-2 space-y-6">
                                
                                {/* Header Berita */}
                                <div>
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        {getStatusBadge(news.status)}
                                    </div>
                                    <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
                                        {news.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5 bg-base-200 px-3 py-1 rounded-full">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(news.created)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            Update: {formatDate(news.modified)}
                                        </span>
                                    </div>
                                </div>

                                {/* Gambar Featured Ala Berita */}
                                <div className="space-y-3 pt-2">
                                    <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-md border border-base-200 bg-muted group">
                                        <img
                                            src={news.image ? `${news.image}` : '/placeholder.svg'}
                                            alt={news.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    {news.caption && (
                                        <p className="text-sm text-muted-foreground text-center italic px-4">
                                            {news.caption}
                                        </p>
                                    )}
                                </div>

                                {/* Isi Artikel */}
                                <Card className="p-6 md:p-8 shadow-sm">
                                    <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-img:rounded-xl">
                                        <div dangerouslySetInnerHTML={{ __html: news.content }} />
                                    </div>
                                </Card>
                            </div>

                            {/* KOLOM KANAN: SIDEBAR (Kecil) */}
                            <div className="lg:col-span-1 space-y-6">
                                
                                {/* Link Publish (Jika Ada) */}
                                {news.url && (
                                    <Card className="border-primary/20 bg-primary/5 shadow-sm">
                                        <h3 className="font-bold text-primary flex items-center gap-2 mb-3 border-b border-primary/10 pb-2">
                                            <Link2Icon className="w-5 h-5" /> Link Publikasi
                                        </h3>
                                        <a 
                                            href={news.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-sm text-blue-600 hover:text-blue-800 underline break-all line-clamp-3"
                                        >
                                            {news.url}
                                        </a>
                                        <div className="mt-3">
                                            <a href={news.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary w-full">
                                                Kunjungi Halaman <ExternalLink size={14}/>
                                            </a>
                                        </div>
                                    </Card>
                                )}

                                {/* Status Layanan Add-ons */}
                                {news.addon_requests && news.addon_requests.length > 0 && (
                                    <Card className="shadow-sm">
                                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-base-200 pb-2">
                                            <Layers className="w-5 h-5 text-primary" /> Status Add-ons
                                        </h3>
                                        <div className="flex flex-col gap-3">
                                            {news.addon_requests
                                                .sort((a, b) => b.id - a.id)
                                                .map(req => renderAddonDetail(req))
                                            }
                                        </div>
                                    </Card>
                                )}

                                {/* Data Narasumber */}
                                <Card className="shadow-sm">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-base-200 pb-2">
                                        <User className="w-5 h-5 text-primary" /> Profil Narasumber
                                    </h3>
                                    <div className="flex flex-col gap-3.5">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium">Nama Lengkap</p>
                                                <p className="text-sm font-semibold text-foreground">{news.narsum || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                                                <Briefcase className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium">Profesi / Jabatan</p>
                                                <p className="text-sm font-semibold text-foreground">{news.profesi || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium">Kota / Lokasi</p>
                                                <p className="text-sm font-semibold text-foreground">{news.city || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium">Kontak (WhatsApp)</p>
                                                <p className="text-sm font-semibold text-foreground">{news.contact || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                            </div>
                        </div>

                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    )
}

export default Show
import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { CreditCard, Download } from 'lucide-react';
import Card from './Card'; // Pastikan path import Card benar

export default function MemberCard({ user, paket_terdaftar }) {
    const cardRef = useRef(null);

    // Fungsi format tanggal bawaan JavaScript ke bahasa Indonesia
    const formatTanggalID = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const downloadCard = () => {
        if (cardRef.current === null) return;

        // pixelRatio: 3 membuat hasil download gambar menjadi HD/Pecah
        toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 })
            .then((dataUrl) => {
                const link = document.createElement('a');
                // Format nama file: member-card-nama-user.png
                link.download = `member-card-${user.nama.replace(/\s+/g, '-').toLowerCase()}.png`;
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error('Gagal mendownload kartu', err);
            });
    };

    return (
        <Card className="border-primary/20 bg-gradient-to-br from-amber-50 to-orange-50 w-full h-full">
            <div>
                <div className="flex items-center gap-2 text-lg font-bold mb-3">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    Member Card Penulis
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                    Kartu ini di-generate secara otomatis. Tekan tombol download di bawah untuk menyimpannya ke perangkat Anda.
                </p>
            </div>

            {/* TEMPLATE KARTU ID (HTML/CSS) */}
            <div className="flex justify-center mb-6 bg-base-200/50 p-4 rounded-xl">
                {/* Pembungkus utama yang akan di-Capture oleh html-to-image */}
                <div 
                    ref={cardRef} 
                    className="relative w-full max-w-[400px] aspect-[2/3] rounded-xl overflow-hidden shadow-xl bg-white"
                    style={{ fontFamily: "'Montserrat', sans-serif" }} 
                >
                    {/* Background Card */}
                    <img 
                        src="/templates/card_bg.jpeg" 
                        alt="Background Template" 
                        className="absolute inset-0 w-full h-full object-cover" 
                        crossOrigin="anonymous" 
                    />

                    {/* Foto Profil (Avatar) */}
                    <div className="absolute top-[32%] left-1/2 -translate-x-1/2 w-[42%] aspect-square rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
                        <img 
                            src={`/storage/${user.avatar}`} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                            crossOrigin="anonymous" 
                        />
                    </div>

                    {/* Teks Identitas */}
                    <div className="absolute top-[68%] left-0 w-full px-4 text-center flex flex-col items-center">
                        <h3 className="font-bold text-xl text-[#a80000] uppercase tracking-wide truncate w-full drop-shadow-sm mb-2">
                            {user.nama}
                        </h3>
                        
                        <div className="space-y-1 w-full">
                            <p className="text-[10px] sm:text-[11px] font-semibold text-black tracking-widest leading-tight">
                                NOMOR ID: KT-{user.id}
                            </p>
                            <p className="text-[10px] sm:text-[11px] font-semibold text-black tracking-widest leading-tight">
                                BERLAKU SAMPAI: <br/> {formatTanggalID(user.dateexp)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={downloadCard}
                className="w-full btn btn-primary flex gap-2 shadow-sm"
            >
                <Download className="w-5 h-5" />
                Download Kartu Digital
            </button>
        </Card>
    );
}
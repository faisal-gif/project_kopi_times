import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { CreditCard, Download } from 'lucide-react';
import Card from './Card';

export default function MemberCard({ user, paket_terdaftar }) {
    const cardRef = useRef(null);

    const downloadCard = () => {
        if (cardRef.current === null) return;

        toPng(cardRef.current, { cacheBust: true })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `member-card-${user.nama}.png`;
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error('Gagal mendownload kartu', err);
            });
    };

    return (
        <Card className="border-primary/20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <div>
                <div className="flex items-center gap-2 text-lg">
                    <CreditCard className="w-5 h-5 text-amber-600" />
                    Member Card Penulis
                </div>
            </div>
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Dapatkan kartu identitas resmi sebagai penulis Kopi TIMES. Kartu ini bisa digunakan sebagai bukti keanggotaan dan akses ke berbagai keuntungan eksklusif.
                </p>
                {/* Bagian yang akan di-capture */}
                <div ref={cardRef} className="">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xl md:w-[350px] w-full h-[200px] flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] opacity-80 uppercase tracking-widest">KOPI TIMES</p>
                                <p className="font-bold text-lg">Member Card</p>
                            </div>
                            <div className="px-2 py-1 text-[10px] border border-white/50 rounded uppercase">
                                LEVEL {paket_terdaftar.level}
                            </div>
                        </div>

                        <div>
                            <p className="font-semibold text-xl leading-tight">{user.nama}</p>
                            <p className="text-xs opacity-80">Penulis Aktif</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={downloadCard}
                    className="w-full btn btn-outline mt-4 flex gap-2"
                >
                    <Download className="w-4 h-4" />
                    Download Kartu Digital
                </button>
            </div>
        </Card>
    );
}
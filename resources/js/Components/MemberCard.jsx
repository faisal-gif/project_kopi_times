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
                <div ref={cardRef} className="flex flex-col items-center">
                    <img src={'storage/' + user.member_card} className='w-[20rem] h-auto rounded-2xl' alt="" />
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
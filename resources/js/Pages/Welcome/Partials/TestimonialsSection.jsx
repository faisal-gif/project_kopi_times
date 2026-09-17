import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

const base = 'https://cdn2.timesmedia.co.id/cdn-times/uploads/assets/2026/03/30/';
const testimonials = [
    ['testimonial-cdn-1-kmcwo5oq.webp', 'Testimoni dr. Karolon Margret Natasa, MH. - Bupati Kabupaten Landak, Kalbar'],
    ['testimonial-cdn-2-8sir22zk.webp', 'Testimoni Drs. Cornelis, M.H. - Anggota Banggar dan Komisi XII DPR RI'],
    ['testimonial-cdn-3-avlvrauf.webp', 'Testimoni Tri Gunadi - Psikolog dan Dosen Universitas 17 Agustus 1945 Surabaya'],
    ['testimonial-cdn-4-vvj9jkxo.webp', 'Testimoni dr. Karolon Margret Natasa, MH. (2)'],
    ['testimonial-cdn-5-r2jxoqpx.webp', 'Testimoni Drs. Cornelis, M.H. (2)'],
    ['testimonial-cdn-6-18r7wr2s.webp', 'Testimoni Tri Gunadi (2)'],
    ['testimonial-cdn-7-4xehf3cr.webp', 'Testimoni dr. Karolon Margret Natasa, MH. (3)'],
    ['testimonial-cdn-8-1qd6seur.webp', 'Testimoni Drs. Cornelis, M.H. (3)'],
];

// Kliping testimoni ditempel selotip; baris geser native (scroll-snap), tanpa pustaka carousel.
const TestimonialsSection = () => {
    const rail = useRef(null);
    const scroll = (dir) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: 'smooth' });

    return (
        <section className="bg-ink py-20 text-white md:py-28">
            <div className="mx-auto max-w-7xl px-4">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <h2 className="max-w-2xl text-balance text-4xl font-black leading-[1.02] tracking-[-0.025em] md:text-5xl">
                        Kepala daerah, anggota DPR, dan akademisi sudah menulis di sini.
                    </h2>
                    <div className="flex gap-2">
                        {[[-1, ArrowLeft, 'Testimoni sebelumnya'], [1, ArrowRight, 'Testimoni berikutnya']].map(([dir, Icon, label]) => (
                            <button key={label} type="button" onClick={() => scroll(dir)} aria-label={label}
                                className="grid h-12 w-12 place-items-center rounded-full border border-white/30 transition-colors hover:border-saffron hover:bg-saffron hover:text-ink">
                                <Icon className="h-5 w-5" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <ul ref={rail} className="kt-scroll mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-4 px-4 pb-8 pt-4 md:scroll-px-[max(1rem,calc((100vw-80rem)/2+1rem))] md:px-[max(1rem,calc((100vw-80rem)/2+1rem))]">
                {testimonials.map(([file, alt], i) => (
                    <li key={file} className={`relative w-[72vw] shrink-0 snap-start sm:w-72 ${i % 2 ? 'rotate-1' : '-rotate-1'}`}>
                        <div className={`absolute -top-3 z-10 h-6 w-20 bg-saffron/85 ${i % 2 ? 'right-6 rotate-6' : 'left-6 -rotate-3'}`} aria-hidden="true" />
                        <img src={base + file} alt={alt} width="600" height="810" loading="lazy" className="block w-full rounded-[3px] bg-white/10 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)]" />
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default TestimonialsSection;

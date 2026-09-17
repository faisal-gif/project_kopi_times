import ApplicationLogo from '@/Components/ApplicationLogo';
import InputError from '@/Components/InputError';
import { Head, Link } from '@inertiajs/react';

// Meja redaksi di kiri, lembar formulir di kanan.
export default function GuestLayout({ children }) {
    return (
        <div className="kt-landing kt-auth flex min-h-screen flex-col bg-paper font-print text-ink lg:flex-row">
            <Head>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link rel="stylesheet" href="https://fonts.bunny.net/css?family=archivo:400,600,800,900|courier-prime:400,700|kalam:400,700&display=swap" />
            </Head>

            {/* Mobile: strip merah dengan logo */}
            <header className="flex items-center bg-desk px-4 py-4 lg:hidden">
                <Link href="/" className="rounded-[3px] bg-sheet px-3 py-2">
                    <ApplicationLogo className="h-6 w-auto" />
                </Link>
            </header>

            <aside className="relative hidden overflow-hidden bg-desk text-white lg:sticky lg:top-0 lg:h-screen lg:flex lg:w-5/12 lg:flex-col lg:justify-between lg:p-12 xl:p-16">
                <Link href="/" className="self-start rounded-[3px] bg-sheet px-4 py-3 shadow-[0_12px_24px_-12px_rgba(0,0,0,0.6)]">
                    <ApplicationLogo className="h-8 w-auto" />
                </Link>

                <div className="relative my-8 max-w-56 self-center">
                    <div className="absolute -top-3 left-1/2 z-10 h-7 w-24 -translate-x-1/2 -rotate-3 bg-saffron/85" aria-hidden="true" />
                    <img
                        src="/templates/card_bg.jpeg"
                        alt="Member card penulis Kopi TIMES"
                        width="1009"
                        height="1600"
                        className="block w-full rotate-3 rounded-xl shadow-[0_24px_40px_-16px_rgba(0,0,0,0.6)]"
                    />
                </div>

                <div>
                    <blockquote className="max-w-md text-balance font-pen text-2xl leading-snug text-white">
                        Setiap kata yang kita tulis memiliki kekuatan untuk mengubah dunia menjadi tempat yang lebih baik.
                    </blockquote>
                    <div className="kt-rule mt-8 text-white/40" />
                    <dl className="mt-4 flex gap-8 font-type text-sm text-white/85">
                        <div>
                            <dt className="sr-only">Penulis</dt>
                            <dd><span className="font-print text-2xl font-extrabold text-white">5K+</span> penulis</dd>
                        </div>
                        <div>
                            <dt className="sr-only">Artikel</dt>
                            <dd><span className="font-print text-2xl font-extrabold text-white">10K+</span> artikel terbit</dd>
                        </div>
                    </dl>
                </div>
            </aside>

            <main className="flex flex-1 items-start justify-center px-4 py-10 sm:px-8 lg:items-center lg:py-16">
                <div className="w-full max-w-xl">{children}</div>
            </main>
        </div>
    );
}

export const textLinkClass = 'font-print font-extrabold text-pen underline decoration-2 underline-offset-4 hover:text-desk';

// Judul halaman guest: label pena (opsional, hanya bila informatif), judul, pengantar ketik.
export function GuestHeading({ label, title, children }) {
    return (
        <div>
            {label && <p className="font-pen text-xl font-bold text-pen">{label}</p>}
            <h1 className="mt-2 text-balance text-4xl font-black leading-[1.02] tracking-[-0.025em] sm:text-5xl">{title}</h1>
            {children && <div className="mt-4 max-w-[58ch] font-type leading-relaxed text-ink/80">{children}</div>}
        </div>
    );
}

export function Field({ id, label, error, children }) {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block font-type text-sm text-ink/80">{label}</label>
            {children}
            <InputError message={error} className="mt-1" />
        </div>
    );
}

export function Notice({ children }) {
    return <p className="mt-6 rounded-[3px] bg-saffron/25 px-4 py-3 font-type text-sm text-ink">{children}</p>;
}

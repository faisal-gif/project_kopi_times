import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { Newspaper } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-accent relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.05&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

                <div className="relative z-10 flex flex-col justify-between p-12 text-primary-content h-full">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                            <Newspaper className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-serif text-xl font-bold">AJP</span>
                            <span className="text-[10px] opacity-80 -mt-1">Aplikasi Jurnalisme Positif</span>
                        </div>
                    </Link>

                    {/* Quote */}
                    <div className="max-w-md">
                        <blockquote className="font-serif text-2xl italic leading-relaxed mb-6">
                            "Setiap kata yang kita tulis memiliki kekuatan untuk mengubah dunia menjadi tempat yang lebih baik."
                        </blockquote>
                        <div className="w-16 h-1 bg-primary-foreground/30 rounded-full" />
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8">
                        <div>
                            <div className="font-serif text-3xl font-bold">5K+</div>
                            <div className="text-sm opacity-80">Penulis Aktif</div>
                        </div>
                        <div>
                            <div className="font-serif text-3xl font-bold">10K+</div>
                            <div className="text-sm opacity-80">Artikel Positif</div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Right Panel - Login Form */}

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-xl">
                    {children}
                </div>
            </div>
        </div>

    );
}

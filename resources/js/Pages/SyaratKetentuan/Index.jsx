import LandingLayout from '@/Layouts/LandingLayout'
import { Head } from '@inertiajs/react'
import React from 'react'

function Index() {
    return (
        <LandingLayout>
             <Head>
                <title>Syarat Ketentuan</title>
                <meta name="description" content="AJP (Aplikasi Jurnalisme Positif) adalah platform jurnalistik yang mendorong pemberitaan berimbang, solutif, dan inspiratif untuk membangun optimisme publik." />

                {/* Meta untuk Social Media (Open Graph) */}
                <meta property="og:title" content="Syarat Ketentuan - AJP" />
                <meta property="og:description" content="AJP (Aplikasi Jurnalisme Positif) adalah platform jurnalistik yang mendorong pemberitaan berimbang, solutif, dan inspiratif untuk membangun optimisme publik." />
                <meta property="og:image" content="/logo-web-ajp.png" />
            </Head>
            <main className="pt-16">
                {/* Hero Section */}
                <section className="py-16 bg-base-300">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                                Syarat & Ketentuan
                            </h1>
                            <p className="text-muted-foreground">
                                Terakhir diperbarui: Januari 2026
                            </p>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="py-16 bg-base-200">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
                            <h2 className="font-serif text-2xl font-bold mb-4">1. Penerimaan Syarat</h2>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                Dengan mengakses dan menggunakan platform AJP (Aplikasi Jurnalisme Positif),
                                Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak
                                menyetujui ketentuan ini, mohon untuk tidak menggunakan layanan kami.
                            </p>

                            <h2 className="font-serif text-2xl font-bold mb-4">2. Deskripsi Layanan</h2>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                AJP adalah platform jurnalisme yang memungkinkan pengguna untuk menulis,
                                mempublikasikan, dan membaca artikel dengan fokus pada konten positif dan
                                konstruktif. Kami menyediakan berbagai paket layanan termasuk paket gratis
                                dan berbayar dengan fitur yang berbeda.
                            </p>

                            <h2 className="font-serif text-2xl font-bold mb-4">3. Pendaftaran Akun</h2>
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                                Untuk menggunakan layanan penuh kami, Anda harus:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                                <li>Memberikan informasi yang akurat dan lengkap saat pendaftaran</li>
                                <li>Menjaga kerahasiaan kata sandi akun Anda</li>
                                <li>Bertanggung jawab atas semua aktivitas yang terjadi di akun Anda</li>
                            </ul>

                            <h2 className="font-serif text-2xl font-bold mb-4">4. Pedoman Konten</h2>
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                                Sebagai platform jurnalisme positif, kami melarang konten yang:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                                <li>Mengandung ujaran kebencian, diskriminasi, atau kekerasan</li>
                                <li>Menyebarkan informasi palsu atau hoax</li>
                                <li>Melanggar hak cipta atau kekayaan intelektual pihak lain</li>
                                <li>Bersifat pornografi atau eksploitasi anak</li>
                                <li>Mempromosikan kegiatan ilegal</li>
                                <li>Spam atau konten yang bersifat promosi berlebihan</li>
                            </ul>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                Semua artikel akan melalui proses moderasi sebelum dipublikasikan untuk
                                memastikan kesesuaian dengan pedoman konten kami.
                            </p>

                            <h2 className="font-serif text-2xl font-bold mb-4">5. Hak Kekayaan Intelektual</h2>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                Anda mempertahankan hak cipta atas konten yang Anda buat dan publikasikan
                                di AJP. Dengan mempublikasikan konten, Anda memberikan kami lisensi non-eksklusif
                                untuk menampilkan, mendistribusikan, dan mempromosikan konten Anda di platform kami.
                                Kami berhak menghapus konten yang melanggar ketentuan ini.
                            </p>

                            <h2 className="font-serif text-2xl font-bold mb-4">6. Pembayaran dan Langganan</h2>
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                                Untuk pengguna berbayar:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
                                <li>Pembayaran diproses melalui metode pembayaran yang tersedia</li>
                                <li>Pengembalian dana tersedia sesuai dengan kebijakan pengembalian kami</li>
                                <li>Harga dapat berubah dengan pemberitahuan sebelumnya</li>
                            </ul>

                            <h2 className="font-serif text-2xl font-bold mb-4">7. Pembatasan Tanggung Jawab</h2>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                AJP disediakan "sebagaimana adanya" tanpa jaminan apapun. Kami tidak
                                bertanggung jawab atas kerugian langsung, tidak langsung, insidental,
                                atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan
                                menggunakan layanan kami. Kami tidak bertanggung jawab atas konten
                                yang dipublikasikan oleh pengguna.
                            </p>

                            <h2 className="font-serif text-2xl font-bold mb-4">8. Penghentian</h2>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                Kami berhak menangguhkan atau menghentikan akun Anda jika Anda melanggar
                                Syarat dan Ketentuan ini. Anda juga dapat menghentikan akun Anda kapan saja
                                melalui pengaturan akun. Setelah penghentian, hak Anda untuk menggunakan
                                layanan akan segera berakhir.
                            </p>

                            <h2 className="font-serif text-2xl font-bold mb-4">9. Perubahan Ketentuan</h2>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                Kami dapat mengubah Syarat dan Ketentuan ini dari waktu ke waktu.
                                Perubahan akan berlaku efektif setelah dipublikasikan di platform kami.
                                Penggunaan berkelanjutan atas layanan kami setelah perubahan berarti
                                Anda menyetujui ketentuan yang diperbarui.
                            </p>

                            <h2 className="font-serif text-2xl font-bold mb-4">10. Hukum yang Berlaku</h2>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan
                                hukum Republik Indonesia. Setiap sengketa yang timbul akan diselesaikan
                                melalui musyawarah atau pengadilan yang berwenang di Indonesia.
                            </p>

                            <h2 className="font-serif text-2xl font-bold mb-4">11. Hubungi Kami</h2>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini,
                                silakan hubungi kami di:
                            </p>
                            <div className="bg-base-300 rounded-lg p-6">
                                <p className="text-foreground font-medium">AJP - Aplikasi Jurnalisme Positif</p>
                                <p className="text-base-content">Email: redaksi@timesindonesia.co.id</p>
                                <p className="text-base-content">Telepon: (0341) 563566</p>
                                <p className="text-base-content">Alamat: Jl. Besar Ijen No.90, Oro-oro Dowo, Kec. Klojen, Kota Malang, Jawa Timur 65116</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </LandingLayout>
    )
}

export default Index
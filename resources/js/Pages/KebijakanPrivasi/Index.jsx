import LandingLayout from '@/Layouts/LandingLayout'
import { Head } from '@inertiajs/react'
import React from 'react'

function Index() {
    return (
        <LandingLayout>
            <Head>
                <title>Kebijakan Privasi</title>
                <meta name="description" content="AJP (Aplikasi Jurnalisme Positif) adalah platform jurnalistik yang mendorong pemberitaan berimbang, solutif, dan inspiratif untuk membangun optimisme publik." />

                {/* Meta untuk Social Media (Open Graph) */}
                <meta property="og:title" content="Kebijakan Privasi - AJP" />
                <meta property="og:description" content="AJP (Aplikasi Jurnalisme Positif) adalah platform jurnalistik yang mendorong pemberitaan berimbang, solutif, dan inspiratif untuk membangun optimisme publik." />
                <meta property="og:image" content="/logo-web-ajp.png" />
            </Head>
            <main className="pt-16">
                {/* Hero Section */}
                <section className="py-16 bg-base-300">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                                Kebijakan Privasi
                            </h1>
                            <p className="text-base-content">
                                Terakhir diperbarui: Januari 2026
                            </p>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="py-16 bg-base-200 ">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="max-w-3xl mx-auto prose prose-neutral">
                            <h2 className="font-serif text-2xl font-bold mb-4">1. Pendahuluan</h2>
                            <p className="text-base-content mb-6 leading-relaxed">
                                AJP (Aplikasi Jurnalisme Positif) berkomitmen untuk melindungi privasi Anda.
                                Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan,
                                menyimpan, dan melindungi informasi pribadi Anda ketika Anda menggunakan
                                platform kami.
                            </p>

                            <h2 className="font-serif text-2xl font-bold mb-4">2. Informasi yang Kami Kumpulkan</h2>
                            <p className="text-base-content mb-4 leading-relaxed">
                                Kami mengumpulkan beberapa jenis informasi untuk menyediakan dan meningkatkan layanan kami:
                            </p>
                            <ul className="list-disc list-inside text-base-content mb-6 space-y-2">
                                <li>Informasi akun: nama, alamat email, kata sandi terenkripsi</li>
                                <li>Informasi profil: foto profil, bio, tautan media sosial</li>
                                <li>Konten yang Anda buat: artikel, komentar, dan interaksi lainnya</li>
                                <li>Data penggunaan: halaman yang dikunjungi, waktu akses, perangkat yang digunakan</li>
                                <li>Informasi pembayaran: untuk pengguna berlangganan (diproses melalui penyedia pembayaran terpercaya)</li>
                            </ul>

                            <h2 className="font-serif text-2xl font-bold mb-4">3. Penggunaan Informasi</h2>
                            <p className="text-base-content mb-4 leading-relaxed">
                                Informasi yang kami kumpulkan digunakan untuk:
                            </p>
                            <ul className="list-disc list-inside text-base-content mb-6 space-y-2">
                                <li>Menyediakan, mengoperasikan, dan memelihara platform kami</li>
                                <li>Meningkatkan pengalaman pengguna dan personalisasi layanan</li>
                                <li>Memproses transaksi dan mengirim notifikasi terkait</li>
                                <li>Berkomunikasi dengan Anda tentang pembaruan, promosi, dan layanan</li>
                                <li>Mendeteksi dan mencegah penyalahgunaan platform</li>
                            </ul>

                            <h2 className="font-serif text-2xl font-bold mb-4">4. Berbagi Informasi</h2>
                            <p className="text-base-content mb-6 leading-relaxed">
                                Kami tidak menjual informasi pribadi Anda kepada pihak ketiga. Kami dapat
                                membagikan informasi Anda hanya dalam keadaan berikut: dengan persetujuan Anda,
                                untuk mematuhi kewajiban hukum, untuk melindungi hak dan keamanan kami,
                                atau dengan penyedia layanan tepercaya yang membantu kami mengoperasikan platform.
                            </p>

                            <h2 className="font-serif text-2xl font-bold mb-4">5. Keamanan Data</h2>
                            <p className="text-base-content mb-6 leading-relaxed">
                                Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai
                                untuk melindungi informasi pribadi Anda dari akses tidak sah, perubahan,
                                pengungkapan, atau penghancuran. Namun, tidak ada metode transmisi internet
                                atau penyimpanan elektronik yang sepenuhnya aman.
                            </p>

                            <h2 className="font-serif text-2xl font-bold mb-4">6. Hak Anda</h2>
                            <p className="text-base-content mb-4 leading-relaxed">
                                Anda memiliki hak untuk:
                            </p>
                            <ul className="list-disc list-inside text-base-content mb-6 space-y-2">
                                <li>Mengakses dan memperoleh salinan data pribadi Anda</li>
                                <li>Memperbarui atau memperbaiki informasi yang tidak akurat</li>
                                <li>Meminta penghapusan data pribadi Anda</li>
                                <li>Menolak atau membatasi pemrosesan data tertentu</li>
                                <li>Menarik persetujuan yang telah diberikan</li>
                            </ul>

                            <h2 className="font-serif text-2xl font-bold mb-4">7. Cookie</h2>
                            <p className="text-base-content mb-6 leading-relaxed">
                                Kami menggunakan cookie dan teknologi pelacakan serupa untuk meningkatkan
                                pengalaman Anda di platform kami. Anda dapat mengatur browser Anda untuk
                                menolak cookie, namun hal ini dapat mempengaruhi fungsionalitas tertentu.
                            </p>

                            <h2 className="font-serif text-2xl font-bold mb-4">8. Perubahan Kebijakan</h2>
                            <p className="text-base-content mb-6 leading-relaxed">
                                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu.
                                Perubahan signifikan akan diberitahukan melalui email atau notifikasi
                                di platform kami. Penggunaan berkelanjutan atas layanan kami setelah
                                perubahan berarti Anda menyetujui kebijakan yang diperbarui.
                            </p>

                            <h2 className="font-serif text-2xl font-bold mb-4">9. Hubungi Kami</h2>
                            <p className="text-base-content mb-6 leading-relaxed">
                                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau
                                ingin menggunakan hak privasi Anda, silakan hubungi kami di:
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
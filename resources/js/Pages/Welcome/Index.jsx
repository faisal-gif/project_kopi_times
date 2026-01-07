

import LandingLayout from '@/Layouts/LandingLayout';
import AboutSection from './Partials/AboutSection';
import FeaturesSection from './Partials/FeatureSection';
import HeroSection from './Partials/HeroSection';
import PricingSection from './Partials/PricingSection';
import { Head } from '@inertiajs/react';


export default function Index({ newsPackages }) {


    return (
        <>
            <Head>
                {/* Standard Meta Tags */}
                <title>Kopi TIMES</title>
                <meta name="description" content="Membership Penulis Kopi TIMES adalah program keanggotaan bagi penulis yang ingin terlibat aktif dalam ekosistem gagasan di TIMES Indonesia." />
                <meta name="keywords" content="Kopi TIMES, TIMES Indonesia, Penulis, Membership, Jurnalisme Positif" />
                <link rel="canonical" href={domain} />

                {/* Facebook / Open Graph (WhatsApp juga pakai ini) */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Beranda - Kopi TIMES" />
                <meta property="og:description" content="Membership Penulis Kopi TIMES adalah program keanggotaan bagi penulis yang ingin terlibat aktif dalam ekosistem gagasan di TIMES Indonesia." />
                {/* PENTING: Gunakan URL Absolut agar gambar muncul */}
                <meta property="og:image" content={"/logo-web.png"} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />

                {/* Twitter / X Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={domain} />
                <meta name="twitter:title" content="Beranda - Kopi TIMES" />
                <meta name="twitter:description" content="Membership Penulis Kopi TIMES adalah program keanggotaan bagi penulis yang ingin terlibat aktif dalam ekosistem gagasan di TIMES Indonesia." />
                <meta name="twitter:image" content={"/logo-web.png"} />
            </Head>
            <LandingLayout>
                <HeroSection />
                <AboutSection />
                <FeaturesSection />
                <PricingSection newsPackages={newsPackages} />
            </LandingLayout>
        </>
    );
}

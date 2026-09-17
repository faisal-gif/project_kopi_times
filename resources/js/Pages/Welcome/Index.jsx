import LandingLayout from '@/Layouts/LandingLayout';
import AboutSection from './Partials/AboutSection';
import FeaturesSection from './Partials/FeatureSection';
import HeroSection from './Partials/HeroSection';
import PricingSection from './Partials/PricingSection';
import { Head } from '@inertiajs/react';
import TestimonialsSection from './Partials/TestimonialsSection';

const description = "Membership Penulis Kopi TIMES adalah program keanggotaan bagi penulis yang ingin terlibat aktif dalam ekosistem gagasan di TIMES Indonesia.";

export default function Index({ newsPackages }) {
    return (
        <>
            <Head>
                <title>Kopi TIMES</title>
                <meta name="description" content={description} />
                <meta name="keywords" content="Kopi TIMES, TIMES Indonesia, Penulis, Membership, Jurnalisme Positif" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Beranda - Kopi TIMES" />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={"/bg_kopi_times.png"} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Beranda - Kopi TIMES" />
                <meta name="twitter:description" content={description} />
                <meta name="twitter:image" content={"/bg_kopi_times.png"} />
            </Head>
            <LandingLayout>
                <main className="kt-landing bg-paper text-ink font-print">
                    <HeroSection />
                    <FeaturesSection />
                    <AboutSection />
                    <TestimonialsSection />
                    <PricingSection newsPackages={newsPackages} />
                </main>
            </LandingLayout>
        </>
    );
}

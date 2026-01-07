

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
                <title>Beranda</title>
                <meta name="description" content="Membership Penulis Kopi TIMES adalah program keanggotaan bagi penulis yang ingin terlibat aktif dalam ekosistem gagasan di TIMES Indonesia." />

                {/* Meta untuk Social Media (Open Graph) */}
                <meta property="og:title" content="Beranda - Kopi Times" />
                <meta property="og:description" content="Membership Penulis Kopi TIMES adalah program keanggotaan bagi penulis yang ingin terlibat aktif dalam ekosistem gagasan di TIMES Indonesia. " />
                <meta property="og:image" content="/logo-web.png" />
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

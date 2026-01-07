

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
                <meta name="description" content="AJP (Aplikasi Jurnalisme Positif) adalah platform jurnalistik yang mendorong pemberitaan berimbang, solutif, dan inspiratif untuk membangun optimisme publik." />

                {/* Meta untuk Social Media (Open Graph) */}
                <meta property="og:title" content="Beranda - AJP" />
                <meta property="og:description" content="AJP (Aplikasi Jurnalisme Positif) adalah platform jurnalistik yang mendorong pemberitaan berimbang, solutif, dan inspiratif untuk membangun optimisme publik." />
                <meta property="og:image" content="/logo-web-ajp.png" />
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

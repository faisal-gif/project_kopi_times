import LandingLayout from '@/Layouts/LandingLayout';
import AboutSection from './Partials/AboutSection';
import FeaturesSection from './Partials/FeatureSection';
import HeroSection from './Partials/HeroSection';
import PricingSection from './Partials/PricingSection';
import { Head } from '@inertiajs/react';
import TestimonialsSection from './Partials/TestimonialsSection';

export default function Index({ newsPackages }) {
    return (
        <>
            <Head title="Kolom Opini TIMES Indonesia" />
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

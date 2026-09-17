import LandingLayout from '@/Layouts/LandingLayout';
import { Head } from '@inertiajs/react';
import FeaturesSection from '../Welcome/Partials/FeatureSection';
import PricingSection from '../Welcome/Partials/PricingSection';

function Index({ newsPackages }) {
    return (
        <>
            <Head title="Paket Membership Penulis" />
            <LandingLayout>
                <main className="kt-landing bg-paper text-ink font-print">
                    <PricingSection
                        newsPackages={newsPackages}
                        as="h1"
                        title="Paket membership penulis Kopi TIMES"
                        className="pt-28 pb-20 md:pt-36 md:pb-28"
                    />
                    <FeaturesSection />
                </main>
            </LandingLayout>
        </>
    );
}

export default Index;

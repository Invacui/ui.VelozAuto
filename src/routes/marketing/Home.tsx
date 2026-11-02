import { lazy, Suspense, type ReactNode } from 'react';
import { SEO } from '@/components/common/SEO';
import { HeroSection } from '@/components/marketing/HeroSection';
import { SectionGutter } from '@/components/marketing/SectionGutter';
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from '@/lib/seo';

const BuySellPromo = lazy(() => import('@/components/marketing/BuySellPromo'));
const SearchSection = lazy(() => import('@/components/marketing/SearchSection'));
const CategoryShowcase = lazy(() => import('@/components/marketing/CategoryShowcase'));
const Featured = lazy(() => import('@/components/marketing/Featured'));
const SellCta = lazy(() => import('@/components/marketing/SellCta'));
const HowItWorks = lazy(() => import('@/components/marketing/HowItWorks'));
const WhyChooseUs = lazy(() => import('@/components/marketing/WhyChooseUs'));
const Brands = lazy(() => import('@/components/marketing/Brands'));
const Testimonials = lazy(() => import('@/components/marketing/Testimonials'));

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  sameAs: [SITE_URL],
};

/** Marketing index — composes the individual landing-page sections. */
export default function Home() {
  const withSection = (node: ReactNode) => (
    <Suspense fallback={<div aria-hidden className="py-24" />}>{node}</Suspense>
  );

  return (
    <>
      <SEO
        title="Buy & sell used vehicles in India"
        description={DEFAULT_DESCRIPTION}
        jsonLd={organizationJsonLd}
      />

      <SectionGutter />

      <HeroSection />
      {withSection(<BuySellPromo />)}
      {withSection(<Featured />)}
      {withSection(<CategoryShowcase />)}
      {withSection(<SearchSection />)}
      {withSection(<Brands />)}
      {withSection(<WhyChooseUs />)}
      {withSection(<HowItWorks />)}
      {withSection(<Testimonials />)}
      {withSection(<SellCta />)}
      <div aria-hidden className="h-16 sm:h-20" />
    </>
  );
}

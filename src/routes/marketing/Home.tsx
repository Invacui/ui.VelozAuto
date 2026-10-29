import { SEO } from '@/components/common/SEO';
import { HeroSection } from '@/components/marketing/HeroSection';
import { SearchSection } from '@/components/marketing/SearchSection';
import { CategoryShowcase } from '@/components/marketing/CategoryShowcase';
import { Featured } from '@/components/marketing/Featured';
import { SellCta } from '@/components/marketing/SellCta';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { WhyChooseUs } from '@/components/marketing/WhyChooseUs';
import { Brands } from '@/components/marketing/Brands';
import { Testimonials } from '@/components/marketing/Testimonials';
import { SectionGutter } from '@/components/marketing/SectionGutter';
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from '@/lib/seo';

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
  return (
    <>
      <SEO
        title="Buy & sell used vehicles in India"
        description={DEFAULT_DESCRIPTION}
        jsonLd={organizationJsonLd}
      />

      <SectionGutter />

      <HeroSection />
      <Featured />
      <CategoryShowcase />
      <SearchSection />
      <Brands />
      <WhyChooseUs />
      <HowItWorks />
      <Testimonials />
      <SellCta />
    </>
  );
}

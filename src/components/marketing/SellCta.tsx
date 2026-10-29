import { Link } from 'react-router-dom';
import { ArrowRight, HandCoins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/marketing/SectionHeading';
import { ROUTES } from '@/constants/routes';

export function SellCta() {
  return (
    <section id="sell-cta" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border bg-gradient-to-tr from-blue-100 via-blue-300 to-blue-500 px-6 py-10 sm:px-10 sm:py-12 lg:flex-row">
        <SectionHeading
          align="left"
          eyebrow="Sell with us"
          icon={HandCoins}
          title="Selling your vehicle? Get an instant offer."
          subtitle="Book a free doorstep inspection, receive a fair market offer and get paid quickly. No listing fees, no obligations."
        />
        <Button size="lg" className="h-11 shrink-0" asChild>
          <Link to={ROUTES.sell}>Sell your vehicle <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>
    </section>
  );
}

export default SellCta;


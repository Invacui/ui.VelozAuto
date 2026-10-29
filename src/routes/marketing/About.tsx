import { Link } from 'react-router-dom';
import { ShieldCheck, IndianRupee, HandCoins, BadgeCheck, ArrowRight, Users, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/common/SEO';
import { ROUTES } from '@/constants/routes';
import { SITE_NAME } from '@/lib/seo';

const VALUES = [
  { icon: ShieldCheck, title: 'Trust', text: 'Every inspected vehicle passes a 200-point quality check before it reaches you.' },
  { icon: IndianRupee, title: 'Transparency', text: 'Data-backed pricing with no hidden charges — the price you see is what you pay.' },
  { icon: HandCoins, title: 'Simplicity', text: 'Sell with a free inspection and instant offer. Buy with finance and paperwork handled.' },
  { icon: BadgeCheck, title: 'Quality', text: 'Verified sellers, secure ownership transfer and warranty on eligible vehicles.' },
];

const STATS = [
  { value: '5', label: 'Vehicle categories' },
  { value: '200+', label: 'Quality checkpoints' },
  { value: '100%', label: 'Verified listings' },
  { value: '24/7', label: 'Live chat support' },
];

export default function About() {
  return (
    <>
      <SEO
        title="About us"
        description={`${SITE_NAME} is an Indian used-vehicle marketplace helping buyers and sellers transact with trust, transparency and ease.`}
      />

      <section className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="max-w-2xl text-3xl font-bold sm:text-4xl">
            Making used-vehicle ownership simple and trustworthy across India.
          </h1>
          <p className="mt-4 max-w-xl text-primary-foreground/85">
            From two-wheelers and passenger cars to commercial fleets and caravans, {SITE_NAME}
            connects buyers and sellers with verified listings, fair pricing and end-to-end support.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-6 text-center">
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold">What we stand for</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-xl border bg-card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold">Our story</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Buying or selling a used vehicle in India has traditionally meant uncertainty — opaque
            pricing, unverified histories and endless paperwork. We started {SITE_NAME} to change
            that: a single marketplace where listings are verified, inspections are standard, and
            ownership transfer is handled for you.
          </p>
          <p>
            Whether you are upgrading your family car, expanding a commercial fleet, or selling a
            vehicle you no longer use, our platform gives you the tools, data and support to make a
            confident decision.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-10"><Link to={ROUTES.vehicles}><Car className="mr-1 h-4 w-4" /> Browse vehicles</Link></Button>
          <Button asChild variant="outline" size="lg" className="h-10"><Link to={ROUTES.sell}><Users className="mr-1 h-4 w-4" /> Sell your vehicle <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
      </section>
    </>
  );
}

import { ShieldCheck, IndianRupee, BadgeCheck, HandCoins, Sparkles, MapPin, type LucideIcon } from 'lucide-react';
import { SectionHeading } from '@/components/marketing/SectionHeading';
import { cn } from '@/lib/utils';

type Tone = 'primary' | 'amber' | 'plain';

interface Card {
  spanClass: string;
  featured?: boolean;
  icon: LucideIcon;
  title: string;
  text: string;
  tone: Tone;
  stats?: { value: string; label: string }[];
}

const CARDS: Card[] = [
  {
    spanClass: 'sm:col-span-6 lg:col-span-8',
    featured: true,
    icon: Sparkles,
    title: 'Buying & selling, made effortless',
    text: 'Whether you are picking your next ride or letting one go, Veloz Auto keeps every step simple, transparent and secure.',
    tone: 'primary',
    stats: [
      { value: '50,000+', label: 'Vehicles listed' },
      { value: '200-point', label: 'Quality check' },
      { value: '24 hrs', label: 'Avg. sell time' },
    ],
  },
  {
    spanClass: 'sm:col-span-3 lg:col-span-4',
    icon: ShieldCheck,
    title: 'Inspected & verified',
    text: 'Every vehicle passes a detailed multi-point inspection with a full history check before it goes live.',
    tone: 'plain',
  },
  {
    spanClass: 'sm:col-span-3 lg:col-span-4',
    icon: IndianRupee,
    title: 'Transparent pricing',
    text: 'Data-backed prices with zero hidden charges — what you see is exactly what you pay.',
    tone: 'plain',
  },
  {
    spanClass: 'sm:col-span-6 lg:col-span-8',
    featured: true,
    icon: MapPin,
    title: 'Trusted across India',
    text: 'From metros to small towns, thousands of buyers and sellers choose Veloz Auto every month.',
    tone: 'amber',
  },
  {
    spanClass: 'sm:col-span-3 lg:col-span-6',
    icon: BadgeCheck,
    title: 'Trusted sellers',
    text: 'Verified sellers and airtight paperwork, so you can buy with total peace of mind.',
    tone: 'plain',
  },
  {
    spanClass: 'sm:col-span-3 lg:col-span-6',
    icon: HandCoins,
    title: 'Instant best offer',
    text: 'Get a free doorstep evaluation and a competitive offer the same day you list.',
    tone: 'plain',
  },
];

const TONE: Record<Tone, { card: string; icon: string; title: string; text: string }> = {
  primary: {
    card: 'bg-gradient-to-br from-blue-800 via-blue-600 to-blue-500 text-white',
    icon: 'bg-white/15 text-white',
    title: 'text-white',
    text: 'text-blue-100/90',
  },
  amber: {
    card: 'bg-amber-400 text-slate-900',
    icon: 'bg-slate-900/10 text-slate-900',
    title: 'text-slate-900',
    text: 'text-slate-800/80',
  },
  plain: {
    card: 'border bg-card',
    icon: 'bg-primary/10 text-primary',
    title: 'text-foreground',
    text: 'text-muted-foreground',
  },
};

export function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Why Choose Us"
        icon={BadgeCheck}
        iconClass="text-green-500"
        title="Why choose Veloz Auto"
        subtitle="A smarter, safer way to buy and sell used vehicles — built on trust and transparency."
      />

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-6 lg:grid-cols-12 lg:gap-5">
        {CARDS.map(({ spanClass, featured, icon: Icon, title, text, tone, stats }) => {
          const t = TONE[tone];
          return (
            <article
              key={title}
              className={cn('flex flex-col rounded-3xl p-6 sm:p-8', spanClass, t.card)}
            >
              <span className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', t.icon)}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className={cn('mt-4 font-bold', featured ? 'text-xl sm:text-2xl' : 'text-base', t.title)}>
                {title}
              </h3>
              <p className={cn('mt-2 text-sm leading-relaxed', featured && 'max-w-2xl sm:text-base', t.text)}>
                {text}
              </p>

              {stats && (
                <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <p className="text-2xl font-bold sm:text-3xl">{s.value}</p>
                      <p className={cn('text-xs font-medium uppercase tracking-wide', t.text)}>{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default WhyChooseUs;

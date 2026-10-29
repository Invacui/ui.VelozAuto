import { Search, CalendarDays, ShieldCheck, Sparkles } from 'lucide-react';
import { SectionHeading } from '@/components/marketing/SectionHeading';

const HOW_IT_WORKS = [
  { icon: Search, title: 'Browse & shortlist', text: 'Explore verified listings with transparent photos, specs and pricing.' },
  { icon: CalendarDays, title: 'Book a test drive', text: 'Raise a buy request and schedule a test drive at your convenience.' },
  { icon: ShieldCheck, title: 'Buy with confidence', text: 'Every inspected vehicle passes a 200-point quality check.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Simple Process"
        icon={Sparkles}
        title="How it works"
        subtitle="A simple, secure process to buy or sell vehicles."
      />
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {HOW_IT_WORKS.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="relative rounded-xl border bg-card p-6">
            <span className="absolute right-4 top-4 text-4xl font-bold text-muted/40">{i + 1}</span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;

import { ShieldCheck, IndianRupee, BadgeCheck, HandCoins } from 'lucide-react';

const VALUE_PROPS = [
  { icon: ShieldCheck, title: 'Inspected & verified', text: 'Detailed inspections and history checks.' },
  { icon: IndianRupee, title: 'Fair pricing', text: 'Data-backed prices, no hidden charges.' },
  { icon: BadgeCheck, title: 'Trusted sellers', text: 'Verified sellers and secure paperwork.' },
  { icon: HandCoins, title: 'Easy finance', text: 'Instant loan assistance and EMI options.' },
];

export function ValueProps() {
  return (
    <section id="value-props" className="border-t py-12">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {VALUE_PROPS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ValueProps;

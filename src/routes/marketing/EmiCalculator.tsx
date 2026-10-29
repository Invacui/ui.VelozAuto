import { Calculator } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { EmiCalculator as EmiWidget } from '@/components/vehicle/EmiCalculator';

const FAQS = [
  {
    q: 'How is the EMI calculated?',
    a: 'EMI uses the standard amortisation formula on the loan amount (vehicle price minus down payment) at the chosen interest rate and tenure in months.',
  },
  {
    q: 'What down payment should I pay?',
    a: 'Most lenders finance 80–90% of the on-road price. A higher down payment lowers your monthly EMI and total interest.',
  },
  {
    q: 'Does the rate include other charges?',
    a: 'No. Indicative figures exclude processing fees, insurance, registration and other lender charges.',
  },
];

export default function EmiCalculatorPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <SEO
        title="Vehicle loan EMI calculator"
        description="Estimate your monthly car, bike or commercial vehicle loan EMI. Adjust price, down payment, interest rate and tenure."
        jsonLd={faqJsonLd}
      />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Calculator className="h-5 w-5" />
          </span>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">Vehicle loan EMI calculator</h1>
          <p className="mt-2 text-muted-foreground">
            Estimate your monthly instalment and total cost of borrowing.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-md">
          <EmiWidget />
        </div>

        <section className="mx-auto mt-12 max-w-3xl">
          <h2 className="text-lg font-bold">Frequently asked questions</h2>
          <div className="mt-4 space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-lg border p-4">
                <h3 className="text-sm font-semibold">{f.q}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

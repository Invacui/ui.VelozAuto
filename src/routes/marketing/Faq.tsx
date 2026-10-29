import { useQuery } from '@tanstack/react-query';
import { HelpCircle } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { listFaqs } from '@/services/content.service';
import { queryKeys } from '@/lib/queryKeys';

export default function Faq() {
  const { data, isLoading } = useQuery({ queryKey: queryKeys.content.faqs(), queryFn: listFaqs });
  const categories = (data ?? []).filter((c) => (c.articles ?? []).length > 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: categories.flatMap((c) =>
      (c.articles ?? []).map((a) => ({
        '@type': 'Question',
        name: a.question,
        acceptedAnswer: { '@type': 'Answer', text: a.answer },
      })),
    ),
  };

  return (
    <>
      <SEO title="Frequently asked questions" description="Answers to common questions about buying, selling, inspections and payments on Veloz Auto." jsonLd={jsonLd} />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HelpCircle className="h-5 w-5" />
          </span>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">Frequently asked questions</h1>
          <p className="mt-2 text-muted-foreground">Everything you need to know about buying and selling.</p>
        </div>

        {isLoading ? (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="mt-8">
            <EmptyState title="No FAQs yet" description="Check back soon." />
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {categories.map((cat) => (
              <section key={cat._id || cat.id}>
                <h2 className="text-lg font-bold">{cat.name}</h2>
                {cat.description && <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>}
                <Accordion type="single" collapsible className="mt-3">
                  {(cat.articles ?? []).map((a) => (
                    <AccordionItem key={a._id || a.id} value={a._id || a.id || a.question}>
                      <AccordionTrigger className="text-left text-sm">{a.question}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">{a.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

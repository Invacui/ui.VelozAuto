import { SEO } from '@/components/common/SEO';

interface LegalPageProps {
  title: string;
  meta?: string;
  description: string;
  children: React.ReactNode;
}

/** Shared shell for static legal / informational pages. */
export function LegalPage({ title, meta, description, children }: LegalPageProps) {
  return (
    <>
      <SEO title={title} description={description} />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {meta && <p className="mt-1 text-xs text-muted-foreground">{meta}</p>}
        <div className="mt-6 space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </>
  );
}

export default LegalPage;

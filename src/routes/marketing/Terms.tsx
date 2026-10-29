import { useQuery } from '@tanstack/react-query';
import { LegalMarkdown, LegalPage, formatLegalDate } from '@/components/marketing/LegalPage';
import { getSiteSettings } from '@/services/content.service';
import { queryKeys } from '@/lib/queryKeys';

export default function Terms() {
  const { data: settings } = useQuery({
    queryKey: queryKeys.content.siteSettings(),
    queryFn: getSiteSettings,
    staleTime: 10 * 60_000,
  });
  const content = settings?.termsContent?.trim();

  return (
    <LegalPage
      title="Terms & Conditions"
      meta={formatLegalDate(settings?.legalUpdatedAt) ?? 'Last updated: 10 October 2026'}
      description="The terms governing your use of the Veloz Auto used-vehicle marketplace."
    >
      {content ? (
        <LegalMarkdown content={content} />
      ) : (
      <>
      <section>
        <h2>1. Acceptance of terms</h2>
        <p>
          By accessing or using Veloz Auto you agree to these terms. If you do not agree, please do
          not use the platform.
        </p>
      </section>

      <section>
        <h2>2. Our role</h2>
        <p>
          Veloz Auto is a marketplace that helps buyers and sellers of used vehicles connect,
          arrange inspections, and complete transactions. Unless expressly stated, we are not the
          seller of the vehicle and do not guarantee any vehicle&apos;s condition, ownership or
          suitability.
        </p>
      </section>

      <section>
        <h2>3. Your responsibilities</h2>
        <ul>
          <li>Provide accurate, current and complete information in buy and sell requests.</li>
          <li>Only list vehicles you lawfully own and are entitled to sell.</li>
          <li>Do not post false, misleading or infringing content.</li>
          <li>Comply with all applicable Indian laws, including motor-vehicle and tax regulations.</li>
        </ul>
      </section>

      <section>
        <h2>4. Listings &amp; pricing</h2>
        <p>
          Prices are set by sellers and may change. Displayed figures, including EMI estimates, are
          indicative and do not constitute a binding offer.
        </p>
      </section>

      <section>
        <h2>5. Inspection &amp; offers</h2>
        <p>
          Free inspections and offers are provided as a convenience. An offer becomes binding only
          when confirmed by both parties in the manner we specify.
        </p>
      </section>

      <section>
        <h2>6. Prohibited conduct</h2>
        <ul>
          <li>Attempting to circumvent our fees or processes.</li>
          <li>Posting vehicles with tampered odometers, documents or histories.</li>
          <li>Using the platform for unlawful, fraudulent or abusive purposes.</li>
        </ul>
      </section>

      <section>
        <h2>7. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Veloz Auto is not liable for indirect or
          consequential losses arising from your use of the platform or any transaction between users.
        </p>
      </section>

      <section>
        <h2>8. Governing law</h2>
        <p>These terms are governed by the laws of India, and disputes are subject to Indian jurisdiction.</p>
      </section>
      </>
      )}
    </LegalPage>
  );
}

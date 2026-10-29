import { useQuery } from '@tanstack/react-query';
import { LegalMarkdown, LegalPage, formatLegalDate } from '@/components/marketing/LegalPage';
import { PRIVACY_EMAIL } from '@/lib/seo';
import { getSiteSettings } from '@/services/content.service';
import { queryKeys } from '@/lib/queryKeys';

export default function Privacy() {
  const { data: settings } = useQuery({
    queryKey: queryKeys.content.siteSettings(),
    queryFn: getSiteSettings,
    staleTime: 10 * 60_000,
  });
  const content = settings?.privacyContent?.trim();

  return (
    <LegalPage
      title="Privacy Policy"
      meta={formatLegalDate(settings?.legalUpdatedAt) ?? 'Last updated: 10 October 2026'}
      description="How Veloz Auto collects, uses and protects your personal data across buying and selling used vehicles."
    >
      {content ? (
        <LegalMarkdown content={content} />
      ) : (
      <>
      <section>
        <h2>1. Who we are</h2>
        <p>
          Veloz Auto (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates an online marketplace
          for buying and selling used vehicles in India. This policy explains what personal data we
          collect, why we collect it, and the choices you have.
        </p>
      </section>

      <section>
        <h2>2. Information we collect</h2>
        <ul>
          <li><strong>Account information</strong> — your name, email address and mobile number, plus a password stored as an encrypted hash.</li>
          <li><strong>Buy &amp; sell request information</strong> — vehicle preferences, budget, contact details, ownership documents and inspection details you provide.</li>
          <li><strong>Listings &amp; photographs</strong> — vehicle details and images you or our team upload.</li>
          <li><strong>Usage data</strong> — device type, browser, pages viewed and referring links, collected via cookies and analytics.</li>
          <li><strong>Communications</strong> — messages you send through live chat, support or contact forms.</li>
        </ul>
      </section>

      <section>
        <h2>3. How we use your information</h2>
        <ul>
          <li>Respond to buy and sell requests and connect buyers with sellers.</li>
          <li>Schedule inspections, test drives and valuations.</li>
          <li>Verify ownership and support ownership transfer paperwork.</li>
          <li>Improve our listings, search and recommendations.</li>
          <li>Send service messages and, with your consent, marketing communications.</li>
          <li>Comply with legal obligations and prevent fraud.</li>
        </ul>
      </section>

      <section>
        <h2>4. Sharing your information</h2>
        <p>
          We share limited details with sellers, inspection partners, financiers and payment providers
          only as needed to deliver the service you request. We never sell your personal data.
        </p>
      </section>

      <section>
        <h2>5. Data retention &amp; security</h2>
        <p>
          We retain personal data for as long as your account is active or as needed to meet legal and
          accounting requirements. We apply industry-standard safeguards, but no method of transmission
          over the internet is fully secure.
        </p>
      </section>

      <section>
        <h2>6. Your rights</h2>
        <p>
          You may access, correct or delete your personal data, or withdraw consent, by contacting us.
          You can update most details from your account profile at any time.
        </p>
      </section>

      <section>
        <h2>7. Contact us</h2>
        {PRIVACY_EMAIL && (
          <p>
            For privacy questions, email{' '}
            <a className="text-primary hover:underline" href={`mailto:${PRIVACY_EMAIL}`}>
              {PRIVACY_EMAIL}
            </a>
            .
          </p>
        )}
      </section>
      </>
      )}
    </LegalPage>
  );
}

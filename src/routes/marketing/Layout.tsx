import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/chat/WhatsAppButton';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { SmoothScroll } from '@/components/common/SmoothScroll';

const ChatWidget = lazy(() =>
  import('@/components/chat/ChatWidget').then((m) => ({ default: m.ChatWidget })),
);
const PhoneVerificationDialog = lazy(() =>
  import('@/components/auth/PhoneVerificationDialog').then((m) => ({
    default: m.PhoneVerificationDialog,
  })),
);
const PhoneOnboardingDialog = lazy(() =>
  import('@/components/auth/PhoneOnboardingDialog').then((m) => ({
    default: m.PhoneOnboardingDialog,
  })),
);

/** Load interaction-only widgets after the page has settled so they stay out
 *  of the critical bundle and off the initial main-thread work. */
function DeferredWidgets() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let id: number;
    if (typeof window.requestIdleCallback === 'function') {
      id = window.requestIdleCallback(() => setReady(true), { timeout: 3000 });
    } else {
      id = window.setTimeout(() => setReady(true), 2000);
    }
    return () => {
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, []);

  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <ChatWidget />
      <PhoneVerificationDialog />
      <PhoneOnboardingDialog />
    </Suspense>
  );
}

/** Public marketing shell: header, routed content, footer and the chat widget. */
export function MarketingLayout() {
  return (
    <SmoothScroll>
      <div className="flex min-h-screen flex-col bg-white">
        <ScrollToTop />
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <DeferredWidgets />
        <WhatsAppButton />
      </div>
    </SmoothScroll>
  );
}

export default MarketingLayout;

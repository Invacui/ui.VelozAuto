import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { WhatsAppButton } from '@/components/chat/WhatsAppButton';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { SmoothScroll } from '@/components/common/SmoothScroll';
import { PhoneVerificationDialog } from '@/components/auth/PhoneVerificationDialog';
import { PhoneOnboardingDialog } from '@/components/auth/PhoneOnboardingDialog';

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
        <ChatWidget />
        <WhatsAppButton />
        <PhoneVerificationDialog />
        <PhoneOnboardingDialog />
      </div>
    </SmoothScroll>
  );
}

export default MarketingLayout;

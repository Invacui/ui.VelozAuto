import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { queryClient } from '@/lib/queryClient';
import { AuthBootstrap } from '@/components/common/AuthBootstrap';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthBootstrap />
          {children}
          <Toaster position="top-right" richColors closeButton />
          {import.meta.env.DEV }
        </QueryClientProvider>
      </Provider>
    </HelmetProvider>
  );
}

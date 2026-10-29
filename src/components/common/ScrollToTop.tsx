import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from '@/hooks/useLenis';

/** Scrolls the window to the top on every route change (hash links excepted). */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    if (hash) return;
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash, lenis]);

  return null;
}

export default ScrollToTop;

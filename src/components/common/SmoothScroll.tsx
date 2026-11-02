import { ReactNode, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { LenisContext } from '@/contexts/LenisContext';

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 7,
      infinite: false,
    });

    lenisRef.current = lenis;
    setLenis(lenis);

    // Keep GSAP ScrollTrigger in sync with Lenis' virtual scroll position.
    // Imported lazily so GSAP stays off the critical entry bundle.
    let cancelled = false;
    let syncScroll: (() => void) | undefined;
    void import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      if (cancelled) return;
      syncScroll = () => ScrollTrigger.update();
      lenis.on('scroll', syncScroll);
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelled = true;
      if (syncScroll) lenis.off('scroll', syncScroll);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

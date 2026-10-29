import { useRef } from 'react';
import { ArrowDown, Facebook, Twitter, Instagram } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SearchBox } from '@/components/marketing/SearchBox';
import { CONTACT_PHONE, CONTACT_PHONE_HREF } from '@/lib/seo';
import carImage from '@/assets/hero_car.webp';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const carRef = useRef<HTMLImageElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Desktop: pin the hero, slide the car out to the left while fading it,
      // then reveal the search form in its place.
      mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=120%',
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(arrowRef.current, { autoAlpha: 0, duration: 0.15 }, 0)
          .to(carRef.current, { xPercent: -120, autoAlpha: 0, ease: 'power1.in', duration: 1 }, 0)
          .fromTo(
            searchRef.current,
            { autoAlpha: 0, yPercent: 30, scale: 0.96 },
            { autoAlpha: 1, yPercent: 0, scale: 1, ease: 'power2.out', duration: 0.8 },
            0.55,
          );
      });

      // Mobile: turn the car upright (vertical) and let it glide straight up
      // as the hero scrolls out.
      mm.add('(max-width: 1023px)', () => {
        gsap.set(carRef.current, { rotation: 90, transformOrigin: 'center center' });
        gsap.to(carRef.current, {
          yPercent: -70,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="home-hero"
      className="relative flex min-h-screen flex-col items-center overflow-hidden bg-[radial-gradient(ellipse_at_28%_12%,#f1f2f1_0%,#e7e9e9_36%,#d5dadd_72%,#c7d0d4_100%)] pt-20"
    >
      {/* Fade the hero gradient into the white sections below */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-b from-transparent to-white"
      />

      {/* Socials + connector lines — pinned to the bottom-left of the hero */}
      <div className="pointer-events-none absolute bottom-10 left-4 z-20 sm:left-6">
        <div className="absolute bottom-0 left-3.5 h-32 w-0.5 bg-gray-400/60" />
        <svg
          className="absolute bottom-0 left-0 h-1 w-24 opacity-75"
          viewBox="0 0 96 4"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="2" x2="96" y2="2" stroke="#9ca3af" strokeWidth="2" strokeDasharray="48 5 16 5 10 4 6 3 3 2 1" />
        </svg>
        <div className="pointer-events-auto absolute bottom-32 left-0 flex flex-col items-center gap-4">
          <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-primary">
            <Facebook className="h-5 w-8 rounded-full border-2 border-gray-400 p-0.5" />
          </a>
          <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-primary">
            <Twitter className="h-5 w-8 rounded-full border-2 border-gray-400 p-0.5" />
          </a>
          <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-primary">
            <Instagram className="h-5 w-8 rounded-full border-2 border-gray-400 p-0.5" />
          </a>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 max-lg:flex max-lg:flex-1 max-lg:flex-col sm:px-6 lg:px-8">
        {/* Big hollow brand wordmark — centered at the top */}
        <span className="relative z-10 flex h-20 w-full items-center justify-center text-5xl font-Incompleeta font-bold tracking-wide text-primary/10 sm:h-32 sm:text-[150px]">
          VELOZ AUTO
        </span>

        {CONTACT_PHONE && (
          <div className="absolute -top-10  cursor-pointer sm:z-20 right-7 r">
            <hr className="h-36 sm:h-24 w- ml-0.5  sm:bg-gray-400/60 hover:bg-primary/10 cursor-pointer " />
            <a
              href={CONTACT_PHONE_HREF}
              className="cursor-pointer font-Incompleeta  text-sm tracking-widest text-gray-400 hover:text-blue-500"
            >
              {CONTACT_PHONE}
            </a>
          </div>
        )}

        {/* Car + search stage */}
        <div className="relative flex w-full items-center justify-center max-lg:flex-1">
          <img
            ref={carRef}
            src={carImage}
            alt="Veloz Auto — verified used vehicles"
            className="z-30 mx-auto size-[92%] will-change-transform lg:size-[70%]"
          />

          {/* Desktop-only search form, revealed as the car slides away */}
          <div className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
            <div ref={searchRef} className="pointer-events-auto w-full max-w-5xl px-4 opacity-0">
              <SearchBox />
            </div>
          </div>
        </div>
      </div>

      <div
        ref={arrowRef}
        className="scroll-down relative z-30 mt-auto mb-6 cursor-pointer animate-bounce rounded-full border-2 bg-white/70 p-2 text-muted-foreground shadow-lg backdrop-blur transition-transform duration-4000 hover:translate-y-1"
      >
        <ArrowDown className="h-6 w-6" />
      </div>
    </section>
  );
}

export default HeroSection;

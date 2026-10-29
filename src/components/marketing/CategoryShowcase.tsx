import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Car, Bike, Bus, Truck, Caravan, ArrowRight, BadgeCheck, type LucideIcon } from 'lucide-react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { listBanners } from '@/services/content.service';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/constants/routes';
import { VEHICLE_CATEGORIES } from '@/constants/vehicleEnums';

gsap.registerPlugin(useGSAP, Observer);

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  PASSENGER_CAR: Car,
  TWO_WHEELER: Bike,
  THREE_WHEELER: Bus,
  COMMERCIAL: Truck,
  CARAVAN_MOTORHOME: Caravan,
};

const CATEGORY_BRIEF: Record<string, string> = {
  PASSENGER_CAR: 'Hatchbacks, sedans and premium cars.',
  TWO_WHEELER: 'Bikes, scooters and mopeds.',
  THREE_WHEELER: 'Passenger autos and e-rickshaws.',
  COMMERCIAL: 'Trucks, buses and light commercial.',
  CARAVAN_MOTORHOME: 'Caravans, campers and motorhomes.',
};

// The card at the centre pops left to become the focus; others stay aligned.
const CENTER_SHIFT = 64;
const BULGE_SIGMA = 0.5;

interface CardItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  link: string;
  Icon?: LucideIcon;
}

export function CategoryShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const { data: banners = [] } = useQuery({
    queryKey: queryKeys.content.banners('CATEGORIES'),
    queryFn: () => listBanners('CATEGORIES'),
    staleTime: 10 * 60_000,
  });

  const active = banners
    .filter((b) => b.isActive)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const items: CardItem[] =
    active.length > 0
      ? active.map((b) => ({
          id: b._id,
          title: b.title,
          subtitle: b.subtitle,
          image: b.image || undefined,
          link: b.link || ROUTES.vehicles,
        }))
      : VEHICLE_CATEGORIES.map((c) => ({
          id: c.value,
          title: c.label,
          subtitle: CATEGORY_BRIEF[c.value],
          link: `${ROUTES.vehicles}?category=${c.value}`,
          Icon: CATEGORY_ICONS[c.value] ?? Car,
        }));

  const signature = items.map((i) => i.id).join('|');
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useGSAP(
    () => {
      const container = trackRef.current;
      if (!container || prefersReduced) return;

      const state = { pos: 0 };
      let target = 0;
      let n = 0;
      let cardH = 0;
      let step = 0;
      let containerH = 0;
      let snapTimer: ReturnType<typeof setTimeout>;
      type Setters = {
        x: (v: number) => void;
        y: (v: number) => void;
        rotate: (v: number) => void;
        scale: (v: number) => void;
        opacity: (v: number) => void;
        z: (v: number) => void;
      };
      let setters: Setters[] = [];

      const measure = () => {
        const list = gsap.utils.toArray<HTMLElement>('.cat-card', container);
        if (!list.length) return list;
        n = list.length;
        containerH = container.clientHeight;
        cardH = list[0].offsetHeight;
        step = cardH + 84;
        setters = list.map((c) => ({
          x: gsap.quickSetter(c, 'x', 'px') as (v: number) => void,
          y: gsap.quickSetter(c, 'y', 'px') as (v: number) => void,
          rotate: gsap.quickSetter(c, 'rotate', 'deg') as (v: number) => void,
          scale: gsap.quickSetter(c, 'scale') as (v: number) => void,
          opacity: gsap.quickSetter(c, 'opacity') as (v: number) => void,
          z: gsap.quickSetter(c, 'zIndex') as (v: number) => void,
        }));
        return list;
      };

      const place = () => {
        if (!n) return;
        const p = state.pos;
        const centerY = (containerH - cardH) / 2;
        const half = n / 2;
        setters.forEach((s, i) => {
          const r = gsap.utils.wrap(-half, half, i - p);
          const bump = Math.exp(-(r * r) / (2 * BULGE_SIGMA * BULGE_SIGMA));
          s.y(centerY + r * step);
          s.x(-CENTER_SHIFT * bump);
          s.rotate(0);
          s.scale(1 + 0.04 * bump);
          s.opacity(1);
          s.z(Math.round(bump * 10));
        });
      };

      const list = measure();
      gsap.set(list, {
        position: 'absolute',
        top: 0,
        left: '75%',
        xPercent: -50,
        transformOrigin: 'center center',
      });
      place();

      const goTo = (next: number) => {
        target = next;
        gsap.to(state, {
          pos: target,
          duration: 0.45,
          ease: 'power2.out',
          overwrite: true,
          onUpdate: place,
        });
      };

      const observer = Observer.create({
        target: container,
        type: 'wheel',
        preventDefault: true,
        onWheel: (self) => {
          if (Math.abs(self.deltaY) < 1) return;
          goTo(target + (self.deltaY > 0 ? 1 : -1));
          clearTimeout(snapTimer);
          snapTimer = setTimeout(() => goTo(Math.round(target)), 160);
        },
      });

      const onResize = () => {
        measure();
        place();
      };

      window.addEventListener('resize', onResize);

      return () => {
        observer.kill();
        window.removeEventListener('resize', onResize);
        clearTimeout(snapTimer);
      };
    },
    { scope: sectionRef, dependencies: [signature] },
  );

  const renderCard = (item: CardItem) => {
    const inner = (
      <div className="overflow-hidden p-2  rounded-2xl bg-white shadow-[0_24px_60px_-24px_rgba(2,6,23,0.55)] ring-1 ring-black/5 transition-transform duration-300 group-hover:-translate-y-1">
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 via-blue-50 to-white">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {item.Icon && <item.Icon className="h-14 w-14 text-primary/70" />}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
            {item.subtitle && <p className="truncate text-xs text-slate-500">{item.subtitle}</p>}
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    );

    const isExternal = item.link.startsWith('http');
    return isExternal ? (
      <a href={item.link} target="_blank" rel="noreferrer" className="group block">
        {inner}
      </a>
    ) : (
      <Link to={item.link} className="group block">
        {inner}
      </Link>
    );
  };

  return (
    <section id="categories" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div
        ref={sectionRef}
        className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-r from-[#013164] to-[#007bff]"
      >
        <div className="pointer-events-none absolute -left-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />

        <div className="relative grid items-center  gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:px-14 lg:py-16">
          {/* Left — static content */}
          <div className="text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold text-white/90 backdrop-blur">
              <BadgeCheck className="h-3.5 w-3.5 text-cyan-300" /> Browse by category
            </span>
            <h2 className="mt-5 text-4xl font-bold leading-[1.03] tracking-wide sm:text-6xl lg:text-[80px]">
              Discover Your
              <br />
              Next <span className="text-cyan-300">Ride</span>
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-blue-100/90 sm:text-lg">
              Explore every category, compare your options, and find the perfect vehicle for your
              journey — inspected, verified and ready to drive.
            </p>

          </div>

          {/* Right — wheel-driven vertical curved carousel */}
          <div className="relative ">
            {prefersReduced ? (
              <div className="mx-auto grid w-full max-w-md gap-4 sm:grid-cols-2">
                {items.map((item) => (
                  <div key={item.id}>{renderCard(item)}</div>
                ))}
              </div>
            ) : (
              <div
                ref={trackRef}
                className="relative sm:static mx-auto h-[440px] w-full max-w-md overflow-hidden sm:h-[520px] lg:h-[600px] lg:max-w-lg"
              >
                {items.map((item) => (
                  <div key={item.id} className="cat-card group absolute top-0 left-1/2 w-[72%] will-change-transform">
                    {renderCard(item)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CategoryShowcase;

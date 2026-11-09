import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Bike, Car, Truck, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listVehicles } from '@/services/vehicle.service';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/constants/routes';
import { CATEGORY_LABELS } from '@/constants/vehicleEnums';
import type { VehicleCategory } from '@/types/vehicle.types';
import type { VehicleCard } from '@/types/vehicle.types';
import { cn } from '@/lib/utils';

/** Auto-advance the marketing carousel between slides. */
const AUTO_ADVANCE_MS = 6000;
/** Category photos showcased per carousel. */
const MAX_SLIDES = 3;

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  PASSENGER_CAR: Car,
  TWO_WHEELER: Bike,
  THREE_WHEELER: Truck,
  COMMERCIAL: Truck,
  CARAVAN_MOTORHOME: Car,
};

export interface CategoryPromo {
  category: VehicleCategory;
  headline: string;
  subheadline?: string;
}

interface Slide {
  url?: string;
  Icon?: LucideIcon;
}

/** Marketing carousel that promotes one vehicle category using its own photos. */
export function CategoryCarousel({ category, headline, subheadline }: CategoryPromo) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.vehicles.list({ category, limit: 6 }),
    queryFn: () => listVehicles({ category, limit: 6 }),
  });

  const slides = useMemo<Slide[]>(() => {
    const vehicles: VehicleCard[] = data?.data ?? [];
    const urls: string[] = [];
    vehicles.forEach((vehicle) => {
      const url =
        vehicle.primaryImage ||
        vehicle.images?.find((image) => image.isPrimary)?.url ||
        vehicle.images?.[0]?.url;
      if (url && !urls.includes(url)) urls.push(url);
    });
    const photos = urls.slice(0, MAX_SLIDES);
    if (photos.length > 0) return photos.map((url) => ({ url }));
    return [{ Icon: CATEGORY_ICONS[category] ?? Truck }];
  }, [data, category]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const currentIndex = Math.min(activeIndex, slides.length - 1);

  const goToSlide = (index: number) =>
    setActiveIndex(Math.min(Math.max(index, 0), slides.length - 1));

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#013164] to-[#007bff] px-4 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <div className="aspect-[16/10] w-full animate-pulse rounded-3xl bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#013164] to-[#007bff] px-4 py-10 shadow-[0_30px_60px_-30px_rgba(1,49,100,0.45)] sm:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={slide.url ?? index} className="w-full shrink-0">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                  {slide.url ? (
                    <img
                      src={slide.url}
                      alt={`${CATEGORY_LABELS[category]} vehicle`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 via-[#013164] to-[#007bff]">
                      <slide.Icon className="h-16 w-16 text-white/70" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
                    <h3 className="text-2xl font-bold leading-tight text-white sm:text-4xl">{headline}</h3>
                    {subheadline ? (
                      <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">{subheadline}</p>
                    ) : null}
                    <Button
                      asChild
                      size="sm"
                      className="mt-4 h-10 rounded-full bg-white text-slate-900 hover:bg-white/90"
                    >
                      <Link to={`${ROUTES.vehicles}?category=${category}`}>
                        Know more
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2.5">
          {slides.map((slide, index) => (
            <button
              key={slide.url ?? index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2.5 w-2.5 rounded-full transition-all duration-300',
                index === currentIndex ? 'w-8 bg-white' : 'bg-white/40 hover:bg-white/70',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const CATEGORY_PROMOS: CategoryPromo[] = [
  {
    category: 'COMMERCIAL',
    headline: 'Wide varieties of Trucks',
    subheadline: 'Buses, light trucks and heavy haulers ready for long hauls and heavy loads.',
  },
  {
    category: 'TWO_WHEELER',
    headline: 'Wide varieties of Bikes',
    subheadline: 'Cruisers, commuters, scooters and superbikes for every road.',
  },
  {
    category: 'PASSENGER_CAR',
    headline: 'Wide varieties of Cars',
    subheadline: 'Hatchbacks, sedans, SUVs and vans for every budget and journey.',
  },
];

/** Marketing band composing the category carousels shown on the home page. */
export function CategoryCarousels() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      {CATEGORY_PROMOS.map((promo) => (
        <CategoryCarousel key={promo.category} {...promo} />
      ))}
    </div>
  );
}

export default CategoryCarousels;

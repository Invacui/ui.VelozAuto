import { Link } from 'react-router-dom';
import {
  BadgeCheck, HandCoins, Sparkles, ArrowRight, Truck, ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBox } from '@/components/marketing/SearchBox';
import { ROUTES } from '@/constants/routes';
import bus from '@/assets/bus.webp'
/** Secondary section: headline, selling points and the mobile search form. */
export function SearchSection() {
  return (
    <section
      id="home-search"
      className="relative flex items-center overflow-hidden pt-20"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300/70 bg-white/70 px-3 py-1 text-xs font-bold text-slate-700">
              <BadgeCheck className="h-3.5 w-3.5 text-green-500" /> Verified listings
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-wide text-slate-400 sm:text-[100px]">
               BUY &amp;  SELL with <p className='text-primary inline-block'>Ease!</p>
            </h1>
            <p className="mt-4 max-w-xl text-slate-600">
              Verified cars, bikes, commercial vehicles and caravans. Transparent pricing, free
              inspection and instant offers when you sell.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2 px-3">
                <Link to={ROUTES.vehicles} className="group">
                  Explore Vehicles
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-primary transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-slate-300/70 bg-white/70 px-5 text-slate-800 hover:bg-white"
              >
                <Link to={ROUTES.sell}>
                  Sell your vehicle
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Search box — mobile only (desktop reveals it from the hero) */}
            <div className="lg:hidden">
              <SearchBox className="mt-6" />
            </div>
          </div>

          {/* Truck visual — replace the icon block below with your truck image */}
          <div className="bg-[#e0e0e0] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] rounded-3xl relative mx-auto hidden w-full max-w-lg lg:block">
                  <div className="relative flex h-[26rem] flex-col items-center justify-center rounded-[2.5rem] ">
                    <img src={bus} alt="commercial vehicle" className="-scale-x-100" />
                  </div>

            <div className="absolute -left-4 top-8 rounded-xl border border-white/70 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg backdrop-blur">
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-primary" /> 200-point inspection</span>
            </div>
            <div className="absolute -right-4 bottom-10 rounded-xl border border-white/70 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg backdrop-blur">
              <span className="inline-flex items-center gap-1.5"><HandCoins className="h-4 w-4 text-primary" /> Instant best offer</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SearchSection;

import { Link } from 'react-router-dom';
import { ArrowRight, Car, HandCoins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

/** Fixed promotional bar that drives the two main actions from the hero page. */
export function BuySellPromo() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 sm:bottom-6">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/60 bg-white/80 p-1.5 shadow-[0_20px_50px_-20px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:gap-3 sm:p-2">
        <span className="hidden items-center gap-1.5 pl-3 text-sm font-semibold text-slate-700 sm:flex">
          <Car className="h-4 w-4 text-primary" />
          Buy or sell your next ride
        </span>
        <Button asChild size="sm" className="rounded-full px-5">
          <Link to={ROUTES.vehicles}>
            Buy <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="rounded-full border-primary/40 bg-white px-5 text-primary hover:bg-primary/5 hover:text-primary"
        >
          <Link to={ROUTES.sell}>
            Sell <HandCoins className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default BuySellPromo;

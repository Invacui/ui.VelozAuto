import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BusFront } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { getFeatured } from '@/services/vehicle.service';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/constants/routes';

export function Featured() {
  const { data: featured, isLoading } = useQuery({
    queryKey: queryKeys.vehicles.featured({ limit: 8 }),
    queryFn: () => getFeatured({ limit: 8 }),
  });

  return (
    <section id="featured" className="mx-auto max-w-7xl px-4 my-12 pb-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
           <span className="inline-flex items-center gap-1.5 rounded-full  border border-slate-300/70 bg-white/70 px-3 py-1 text-xs font-bold text-slate-700">
              <BusFront className="h-3.5 w-3.5 text-blue-500 " /> Featured Vehicles
            </span>
        <Button variant="outline" asChild>
          <Link to={ROUTES.vehicles}>
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
          : (featured ?? []).map((v) => <VehicleCard key={v.id} vehicle={v} />)}
      </div>
      {!isLoading && (featured ?? []).length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">No featured vehicles yet.</p>
      )}
    </section>
  );
}

export default Featured;

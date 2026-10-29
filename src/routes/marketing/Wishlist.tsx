import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/common/SEO';
import { EmptyState } from '@/components/common/EmptyState';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { getWishlist } from '@/services/wishlist.service';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export default function Wishlist() {
  const { isAuthenticated } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.wishlist.list(),
    queryFn: () => getWishlist({ limit: 50 }),
    enabled: isAuthenticated,
  });

  const items = data?.data ?? [];

  return (
    <>
      <SEO title="My wishlist" noindex />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold">My wishlist</h1>

        {!isAuthenticated ? (
          <div className="mt-6">
            <EmptyState
              icon={<Heart className="h-6 w-6 text-muted-foreground" />}
              title="Sign in to save vehicles"
              description="Create a free account to keep your favourite vehicles in one place."
              action={<Button asChild><Link to={ROUTES.login}>Sign in</Link></Button>}
            />
          </div>
        ) : isLoading ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<Heart className="h-6 w-6 text-muted-foreground" />}
              title="Your wishlist is empty"
              description="Tap the heart on any vehicle to save it here."
              action={<Button asChild><Link to={ROUTES.vehicles}>Browse vehicles</Link></Button>}
            />
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((v) => <VehicleCard key={v.id} vehicle={v} isWishlisted />)}
          </div>
        )}
      </div>
    </>
  );
}

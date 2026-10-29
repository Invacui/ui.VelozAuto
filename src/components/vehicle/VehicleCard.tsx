import { Link } from 'react-router-dom';
import { Heart, Gauge, Fuel, MapPin, Calendar, Scale } from 'lucide-react';
import { cn, formatINRCompact, formatKm, titleCase } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';
import { CATEGORY_LABELS } from '@/constants/vehicleEnums';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleCompare, selectCompare } from '@/store/compare.slice';
import type { VehicleCard as VehicleCardType } from '@/types/vehicle.types';

interface Props {
  vehicle: VehicleCardType;
  onWishlistToggle?: (id: string) => void;
  isWishlisted?: boolean;
}

export function VehicleCard({ vehicle, onWishlistToggle, isWishlisted }: Props) {
  const dispatch = useAppDispatch();
  const compare = useAppSelector(selectCompare);
  const inCompare = compare.some((v) => v.id === vehicle.id);
  const image =
    vehicle.primaryImage || vehicle.images?.find((i) => i.isPrimary)?.url || vehicle.images?.[0]?.url;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg">
      <div className="relative p-3 pb-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          <Link to={ROUTES.vehicleDetail(vehicle.slug)}>
            {image ? (
              <img
                src={image}
                alt={`${vehicle.brandName} ${vehicle.model}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                No image
              </div>
            )}
          </Link>
          <div className="absolute left-2 top-2 flex gap-1">
            {vehicle.isFeatured && (
              <span className="rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                Featured
              </span>
            )}
            {vehicle.isInspected && (
              <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
                Inspected
              </span>
            )}
          </div>
          <div className="absolute right-2 top-2 flex flex-col gap-1">
            {onWishlistToggle && (
              <button
                type="button"
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                onClick={() => onWishlistToggle(vehicle.id)}
                className="rounded-full bg-white/90 p-1.5 shadow hover:bg-white"
              >
                <Heart className={cn('h-4 w-4', isWishlisted ? 'fill-primary text-primary' : 'text-gray-600')} />
              </button>
            )}
            <button
              type="button"
              aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
              onClick={() => dispatch(toggleCompare(vehicle))}
              className={cn(
                'rounded-full p-1.5 shadow',
                inCompare ? 'bg-primary text-primary-foreground' : 'bg-white/90 text-gray-600 hover:bg-white',
              )}
            >
              <Scale className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={ROUTES.vehicleDetail(vehicle.slug)}
            className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold hover:text-primary"
          >
            {vehicle.manufacturingYear} {vehicle.brandName} {vehicle.model}
            {vehicle.variant ? ` ${vehicle.variant}` : ''}
          </Link>
        </div>
        <div className="text-lg font-bold text-foreground">{formatINRCompact(vehicle.price)}</div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {vehicle.manufacturingYear}
          </span>
          <span className="inline-flex items-center gap-1">
            <Gauge className="h-3 w-3" /> {formatKm(vehicle.kmDriven)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Fuel className="h-3 w-3" /> {titleCase(vehicle.fuelType)}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {vehicle.locationCity || '—'}
          </span>
          <span className="rounded bg-muted px-1.5 py-0.5">{CATEGORY_LABELS[vehicle.category] || vehicle.category}</span>
        </div>
      </div>
    </div>
  );
}

export default VehicleCard;

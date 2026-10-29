import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { X, GitCompare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/common/SEO';
import { EmptyState } from '@/components/common/EmptyState';
import { getById } from '@/services/vehicle.service';
import { queryKeys } from '@/lib/queryKeys';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCompare, removeCompare, clearCompare } from '@/store/compare.slice';
import { ROUTES } from '@/constants/routes';
import { CATEGORY_LABELS } from '@/constants/vehicleEnums';
import { cn, formatCurrency, formatINRCompact, formatKm, titleCase } from '@/lib/utils';
import type { Vehicle } from '@/types/vehicle.types';

const ROWS: { label: string; get: (v: Vehicle) => string | number | null | undefined }[] = [
  { label: 'Price', get: (v) => formatCurrency(v.price) },
  { label: 'Category', get: (v) => CATEGORY_LABELS[v.category] || titleCase(v.category) },
  { label: 'Body type', get: (v) => titleCase(v.bodyType) },
  { label: 'Year', get: (v) => v.manufacturingYear },
  { label: 'KM driven', get: (v) => formatKm(v.kmDriven) },
  { label: 'Fuel', get: (v) => titleCase(v.fuelType) },
  { label: 'Transmission', get: (v) => titleCase(v.transmission) },
  { label: 'Owners', get: (v) => titleCase(v.ownerCount) },
  { label: 'Seats', get: (v) => v.seats },
  { label: 'Engine (cc)', get: (v) => v.engineCapacityCc },
  { label: 'Power (bhp)', get: (v) => v.powerBhp },
  { label: 'Mileage (kmpl)', get: (v) => v.mileageKmpl },
  { label: 'Colour', get: (v) => v.color },
  { label: 'Registered state', get: (v) => v.registrationState },
  { label: 'Accident history', get: (v) => titleCase(v.accidentHistory) },
  { label: 'Inspection score', get: (v) => (v.inspectionScore != null ? `${v.inspectionScore}/100` : null) },
  { label: 'Location', get: (v) => [v.locationCity, v.locationState].filter(Boolean).join(', ') },
];

export default function Compare() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCompare);

  const results = useQueries({
    queries: items.map((v) => ({
      queryKey: queryKeys.vehicles.detail(v.id),
      queryFn: () => getById(v.id),
      staleTime: 60_000,
    })),
  });

  const vehicles = results.map((r) => r.data).filter(Boolean) as Vehicle[];
  const loading = results.some((r) => r.isLoading);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <SEO title="Compare vehicles" noindex />
        <EmptyState
          icon={<GitCompare className="h-6 w-6 text-muted-foreground" />}
          title="Nothing to compare yet"
          description="Add up to 3 vehicles to compare their specs side by side."
          action={<Button asChild><Link to={ROUTES.vehicles}><Plus className="mr-1 h-4 w-4" /> Browse vehicles</Link></Button>}
        />
      </div>
    );
  }

  return (
    <>
      <SEO title="Compare vehicles" noindex />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Compare vehicles</h1>
          <Button variant="outline" onClick={() => dispatch(clearCompare())}>Clear all</Button>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-40 border-b p-2 text-left text-xs font-medium text-muted-foreground">Spec</th>
                  {vehicles.map((v) => (
                    <th key={v.id} className="border-b p-2 align-top">
                      <div className="relative">
                        <button
                          onClick={() => dispatch(removeCompare(v.id))}
                          aria-label="Remove"
                          className="absolute right-0 top-0 rounded-full bg-muted p-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <Link to={ROUTES.vehicleDetail(v.slug)} className="block">
                          {v.images?.[0]?.url && (
                            <img src={v.images[0].url} alt="" className="mb-2 h-28 w-full rounded-lg object-cover" />
                          )}
                          <p className="text-left text-sm font-semibold">{v.manufacturingYear} {v.brandName} {v.model}</p>
                          <p className="text-left text-sm font-bold text-primary">{formatINRCompact(v.price)}</p>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => {
                  const values = vehicles.map((v) => row.get(v));
                  const allSame = values.every((val) => String(val) === String(values[0]));
                  return (
                    <tr key={row.label} className="odd:bg-muted/30">
                      <td className="p-2 text-xs font-medium text-muted-foreground">{row.label}</td>
                      {values.map((val, i) => (
                        <td
                          key={i}
                          className={cn('p-2 font-medium', !allSame && vehicles.length > 1 && i === 0 && 'bg-primary/5')}
                        >
                          {val === null || val === undefined || val === '' ? '—' : String(val)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr>
                  <td className="p-2" />
                  {vehicles.map((v) => (
                    <td key={v.id} className="p-2">
                      <Button asChild size="sm"><Link to={ROUTES.vehicleDetail(v.slug)}>View details</Link></Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

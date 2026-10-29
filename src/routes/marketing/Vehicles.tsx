import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/common/SEO';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { VehicleFilters, type Filters } from '@/components/vehicle/VehicleFilters';
import { listVehicles } from '@/services/vehicle.service';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/constants/routes';
import { SITE_URL } from '@/lib/seo';
import { formatINRCompact, titleCase } from '@/lib/utils';

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'km_asc', label: 'KM: Low to High' },
  { value: 'year_desc', label: 'Year: Newest' },
];

const FILTER_KEYS = [
  'category', 'usageType', 'subCategory', 'bodyType', 'brand', 'fuelType', 'transmission',
  'ownerCount', 'bsNorm', 'state', 'city', 'minPrice', 'maxPrice', 'minYear', 'maxYear',
  'minKm', 'maxKm', 'isInspected', 'isFeatured',
] as const;

export default function Vehicles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [qInput, setQInput] = useState(searchParams.get('q') || '');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters: Filters = useMemo(() => {
    const f: Filters = {};
    searchParams.forEach((value, key) => {
      if (key === 'q' || key === 'page' || key === 'sort') return;
      (f as any)[key] = value === 'true' ? true : value === 'false' ? false : value;
    });
    return f;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const q = searchParams.get('q') || '';
  const page = Number(searchParams.get('page') || 1);
  const sort = (searchParams.get('sort') as Filters['sort']) || 'newest';

  const params: Filters = { ...filters, q: q || undefined, page, limit: 12, sort };

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.vehicles.list(params),
    queryFn: () => listVehicles(params),
  });

  const updateParams = (patch: Record<string, string | number | boolean | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === '' || v === false) next.delete(k);
      else next.set(k, String(v));
    });
    if (!('page' in patch)) next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const onFilterChange = (patch: Partial<Filters>) => {
    const stringified: Record<string, any> = {};
    Object.entries(patch).forEach(([k, v]) => {
      stringified[k] = v === undefined || v === null ? undefined : String(v);
    });
    updateParams(stringified);
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (sort !== 'newest') next.set('sort', sort);
    setSearchParams(next, { replace: true });
  };

  const activeChips = FILTER_KEYS.filter((k) => searchParams.get(k) !== null);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Vehicles', item: `${SITE_URL}${ROUTES.vehicles}` },
    ],
  };

  const results = data?.data ?? [];

  return (
    <>
      <SEO
        title={q ? `“${q}” — Used vehicles` : 'Browse used vehicles in India'}
        description="Filter verified used cars, bikes, commercial vehicles and caravans by category, brand, budget, city and more."
        jsonLd={breadcrumbJsonLd}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="text-xs text-muted-foreground">
          <Link to={ROUTES.home} className="hover:text-foreground">Home</Link> / <span>Vehicles</span>
        </nav>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold">
            {q ? `Results for “${q}”` : 'Used vehicles'}
            {data && <span className="ml-2 text-sm font-normal text-muted-foreground">({data.pagination.totalItems} found)</span>}
          </h1>

          <div className="flex items-center gap-2">
            <form
              className="relative hidden sm:block"
              onSubmit={(e) => {
                e.preventDefault();
                updateParams({ q: qInput || undefined });
              }}
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search…"
                className="h-9 w-56 pl-9"
              />
            </form>
            <Select value={sort} onValueChange={(v) => updateParams({ sort: v })}>
              <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-9 lg:hidden">
                  <SlidersHorizontal className="mr-1 h-4 w-4" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto scrollbar-thin">
                <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                <div className="mt-4">
                  <VehicleFilters filters={filters} onChange={onFilterChange} onClear={clearFilters} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {activeChips.map((k) => (
              <button
                key={k}
                onClick={() => updateParams({ [k]: undefined })}
                className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-1 text-xs"
              >
                {titleCase(k)}: {String(searchParams.get(k))}
                <X className="h-3 w-3" />
              </button>
            ))}
            <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear all</button>
          </div>
        )}

        <div className="mt-5 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Filters — kept on the left (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border p-4 scrollbar-thin">
              <VehicleFilters filters={filters} onChange={onFilterChange} onClear={clearFilters} />
            </div>
          </aside>

          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
              </div>
            ) : isError ? (
              <EmptyState title="Couldn’t load vehicles" description="Please try again in a moment." />
            ) : results.length === 0 ? (
              <EmptyState
                title="No vehicles match your filters"
                description="Try widening your search or clearing some filters."
                action={<Button variant="outline" onClick={clearFilters}>Clear filters</Button>}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
                </div>
                <div className="mt-8">
                  <Pagination
                    page={data!.pagination.page}
                    totalPages={data!.pagination.totalPages}
                    onPageChange={(p) => updateParams({ page: p })}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

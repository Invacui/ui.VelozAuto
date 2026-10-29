import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { getFiltersMeta } from '@/services/vehicle.service';
import { listLocations } from '@/services/master.service';
import { queryKeys } from '@/lib/queryKeys';
import {
  VEHICLE_CATEGORIES, USAGE_TYPES, COMMERCIAL_SUBCATEGORIES, BODY_TYPES_BY_CATEGORY,
  FUEL_TYPES, TRANSMISSIONS, OWNER_COUNTS, BS_NORMS,
} from '@/constants/vehicleEnums';
import { titleCase } from '@/lib/utils';
import type { VehicleListParams } from '@/types/vehicle.types';

export type Filters = VehicleListParams;

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
  /** `sidebar` renders a vertical stack (used in the mobile sheet); `bar`
   *  renders a compact wrapping bar placed above the results. */
  variant?: 'sidebar' | 'bar';
}

const ALL = '__all__';

/** Prepends an "any" option to a list so a selection can always be cleared. */
const withAll = (label: string, options: ComboboxOption[]): ComboboxOption[] => [
  { value: ALL, label },
  ...options,
];

export function VehicleFilters({ filters, onChange, onClear, variant = 'sidebar' }: Props) {
  const bar = variant === 'bar';
  const { data: meta } = useQuery({ queryKey: queryKeys.vehicles.filtersMeta(), queryFn: getFiltersMeta });
  const { data: locations } = useQuery({ queryKey: queryKeys.master.locations(), queryFn: listLocations });

  const bodyTypes = filters.category
    ? BODY_TYPES_BY_CATEGORY[filters.category] || meta?.bodyTypes || []
    : meta?.bodyTypes || [];

  const states = (locations ?? []).map((l) => l.state);
  const cities = filters.state
    ? locations?.find((l) => l.state === filters.state)?.cities.map((c) => c.name) || []
    : [];

  const selectValue = (v: unknown) => (v === undefined || v === null || v === '' ? ALL : String(v));

  return (
    <div className={bar ? 'flex flex-wrap items-end gap-x-4 gap-y-3' : 'space-y-5'}>
      {!bar && (
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Filters</h2>
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="mr-1 h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      )}

      <FilterGroup bar={bar} label="Category">
        <Combobox
          value={selectValue(filters.category)}
          onChange={(v) => onChange({ category: (v === ALL ? undefined : v) as any, subCategory: undefined, bodyType: undefined })}
          options={withAll('All categories', VEHICLE_CATEGORIES.map((c) => ({ value: c.value, label: c.label })))}
          placeholder="All categories"
          searchPlaceholder="Search category…"
          emptyText="No category found."
        />
      </FilterGroup>

      <FilterGroup bar={bar} label="Usage">
        <Select value={selectValue(filters.usageType)} onValueChange={(v) => onChange({ usageType: (v === ALL ? undefined : v) as any })}>
          <SelectTrigger><SelectValue placeholder="Any usage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any usage type</SelectItem>
            {USAGE_TYPES.map((u) => (
              <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterGroup>

      {filters.category === 'COMMERCIAL' && (
        <FilterGroup bar={bar} label="Commercial sub-category">
          <Select value={selectValue(filters.subCategory)} onValueChange={(v) => onChange({ subCategory: v === ALL ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="Any sub-category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Any sub-category</SelectItem>
              {COMMERCIAL_SUBCATEGORIES.map((s) => (
                <SelectItem key={s} value={s}>{titleCase(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterGroup>
      )}

      {bodyTypes.length > 0 && (
        <FilterGroup bar={bar} label="Body type">
          <Select value={selectValue(filters.bodyType)} onValueChange={(v) => onChange({ bodyType: v === ALL ? undefined : v })}>
            <SelectTrigger><SelectValue placeholder="Any body type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Any body type</SelectItem>
              {bodyTypes.map((b) => (
                <SelectItem key={b} value={b}>{titleCase(b)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterGroup>
      )}

      <FilterGroup bar={bar} label="Brand">
        <Combobox
          value={selectValue(filters.brand)}
          onChange={(v) => onChange({ brand: v === ALL ? undefined : v })}
          options={withAll('Any brand', (meta?.brands ?? []).map((b) => ({ value: b.id, label: b.name })))}
          placeholder="Any brand"
          searchPlaceholder="Search brand…"
          emptyText="No brand found."
        />
      </FilterGroup>

      <FilterGroup bar={bar} label="Fuel">
        <Select value={selectValue(filters.fuelType)} onValueChange={(v) => onChange({ fuelType: v === ALL ? undefined : v })}>
          <SelectTrigger><SelectValue placeholder="Any fuel" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any fuel type</SelectItem>
            {(meta?.fuelTypes?.length ? meta.fuelTypes : FUEL_TYPES).map((f) => (
              <SelectItem key={f} value={f}>{titleCase(f)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup bar={bar} label="Transmission">
        <Select value={selectValue(filters.transmission)} onValueChange={(v) => onChange({ transmission: v === ALL ? undefined : v })}>
          <SelectTrigger><SelectValue placeholder="Any transmission" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any transmission</SelectItem>
            {(meta?.transmissions?.length ? meta.transmissions : TRANSMISSIONS).map((t) => (
              <SelectItem key={t} value={t}>{titleCase(t)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup bar={bar} label="Owners">
        <Select value={selectValue(filters.ownerCount)} onValueChange={(v) => onChange({ ownerCount: (v === ALL ? undefined : v) as any })}>
          <SelectTrigger><SelectValue placeholder="Any owners" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any number of owners</SelectItem>
            {OWNER_COUNTS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup bar={bar} label="BS norm">
        <Select value={selectValue(filters.bsNorm)} onValueChange={(v) => onChange({ bsNorm: v === ALL ? undefined : v })}>
          <SelectTrigger><SelectValue placeholder="Any BS norm" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any BS norm</SelectItem>
            {BS_NORMS.map((b) => (
              <SelectItem key={b} value={b}>{titleCase(b)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup bar={bar} className="w-56" label="Price range (₹)">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </FilterGroup>

      <FilterGroup bar={bar} className="w-56" label="Year">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="From"
            value={filters.minYear ?? ''}
            onChange={(e) => onChange({ minYear: e.target.value ? Number(e.target.value) : undefined })}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="To"
            value={filters.maxYear ?? ''}
            onChange={(e) => onChange({ maxYear: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </FilterGroup>

      <FilterGroup bar={bar} className="w-56" label="KM driven">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minKm ?? ''}
            onChange={(e) => onChange({ minKm: e.target.value ? Number(e.target.value) : undefined })}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxKm ?? ''}
            onChange={(e) => onChange({ maxKm: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </FilterGroup>

      <FilterGroup bar={bar} label="Location">
        <div className="space-y-2">
          <Combobox
            value={selectValue(filters.state)}
            onChange={(v) => onChange({ state: v === ALL ? undefined : v, city: undefined })}
            options={withAll('Any state', states.map((s) => ({ value: s, label: s })))}
            placeholder="Any state"
            searchPlaceholder="Search state…"
            emptyText="No state found."
          />
          {cities.length > 0 && (
            <Combobox
              value={selectValue(filters.city)}
              onChange={(v) => onChange({ city: v === ALL ? undefined : v })}
              options={withAll('Any city', cities.map((c) => ({ value: c, label: c })))}
              placeholder="Any city"
              searchPlaceholder="Search city…"
              emptyText="No city found."
            />
          )}
        </div>
      </FilterGroup>

      <div className={bar ? 'flex w-56 flex-wrap items-center gap-x-4 gap-y-2 pb-2' : 'space-y-3 border-t pt-4'}>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={!!filters.isInspected}
            onCheckedChange={(v) => onChange({ isInspected: v ? true : undefined })}
          />
          Inspected only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={!!filters.isFeatured}
            onCheckedChange={(v) => onChange({ isFeatured: v ? true : undefined })}
          />
          Featured only
        </label>
      </div>
    </div>
  );
}

function FilterGroup({ label, children, bar, className }: { label: string; children: React.ReactNode; bar?: boolean; className?: string }) {
  return (
    <div
      className={
        bar
          ? `space-y-1.5 [&_[data-slot=select-trigger]]:w-full ${className ?? 'w-44'}`
          : 'space-y-1.5'
      }
    >
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

export default VehicleFilters;

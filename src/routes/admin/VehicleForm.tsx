import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { SEO } from '@/components/common/SEO';
import { MediaUpload, type MediaItem } from '@/components/common/MediaUpload';
import {
  getAdminVehicle, createVehicle, updateVehicle, addVehicleImages, addVehicleImageUrls, removeVehicleImage,
} from '@/services/vehicle.service';
import { listBrands, listLocations, createBrand, createLocation } from '@/services/master.service';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/constants/routes';
import {
  VEHICLE_CATEGORIES, USAGE_TYPES, COMMERCIAL_SUBCATEGORIES,
  FUEL_TYPES, TRANSMISSIONS, OWNER_COUNTS, VEHICLE_STATUSES,
  ACCIDENT_HISTORY, TYRE_CONDITIONS,
  AXLE_CONFIGURATIONS,
} from '@/constants/vehicleEnums';
import { pincodeSchema } from '@/lib/validations';
import { cn, getApiErrorMessage, titleCase } from '@/lib/utils';
import type { Vehicle } from '@/types/vehicle.types';

const IMAGE_TAGS = ['EXTERIOR', 'INTERIOR', 'ENGINE', 'ODOMETER', 'DOCUMENTS', 'TYRES', 'FRONT', 'BACK', 'SIDE'];
const NONE = '__none__';

const optNum = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
  z.number().optional(),
);
const optStr = z.string().trim().optional().or(z.literal(''));

const schema = z.object({
  category: z.enum(['TWO_WHEELER', 'THREE_WHEELER', 'PASSENGER_CAR', 'COMMERCIAL', 'CARAVAN_MOTORHOME']),
  usageType: z.enum(['PRIVATE', 'COMMERCIAL']),
  subCategory: optStr,
  brand: z.string().min(1, 'Brand is required'),
  brandName: z.string().trim().min(1, 'Brand is required'),
  model: z.string().trim().min(1, 'Model is required'),
  variant: optStr,
  manufacturingYear: z.coerce.number().int().min(1980),
  color: optStr,
  fuelType: z.string().min(1, 'Fuel type is required'),
  transmission: z.string().min(1, 'Transmission is required'),
  engineCapacityCc: optNum,
  powerBhp: optNum,
  torqueNm: optNum,
  mileageKmpl: optNum,
  batteryCapacityKwh: optNum,
  kmDriven: z.coerce.number().min(0, 'KM driven is required'),
  ownerCount: z.string().min(1, 'Select ownership'),
  seats: optNum,
  price: optNum,
  isPriceNegotiable: z.boolean().optional(),
  priceMax: optNum,
  isRateOnRequest: z.boolean().optional(),
  description: optStr,
  features: optStr,
  highlights: optStr,
  videoUrl: optStr,
  status: z.string().optional(),
  isFeatured: z.boolean().optional(),
  accidentHistory: z.string().min(1, 'Accident history is required'),
  floodDamage: z.boolean().optional(),
  serviceHistoryAvailable: z.boolean().optional(),
  tyreCondition: z.string().min(1, 'Tyre condition is required'),
  modifications: optStr,
  isInspected: z.boolean().optional(),
  inspectionScore: optNum,
  locationState: z.string().min(1, 'Location state is required'),
  locationCity: z.string().trim().min(1, 'Location city is required'),
  locationPincode: pincodeSchema,
  yardName: optStr,
  sellerType: optStr,
  grossVehicleWeightKg: optNum,
  payloadCapacityKg: optNum,
  unladenWeightKg: optNum,
  axleConfiguration: optStr,
  numberOfTyres: optNum,
  wheelbaseMm: optNum,
  tankCapacityLitres: optNum,
  hasAc: z.boolean().optional(),
  hasGpsTelematics: z.boolean().optional(),
  hasKitchenette: z.boolean().optional(),
  hasToilet: z.boolean().optional(),
  waterTankLitres: optNum,
  solarPanel: z.boolean().optional(),
  awning: z.boolean().optional(),
}).superRefine((values, ctx) => {
  if (!values.isRateOnRequest && (values.price == null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['price'], message: 'Price (from) is required' });
  }
  if (values.price != null && values.priceMax != null && values.priceMax < values.price) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['priceMax'], message: 'Price maximum cannot be lower than the price from' });
  }
});

type FormValues = z.infer<typeof schema>;

const EMPTY: Partial<FormValues> = {
  category: 'PASSENGER_CAR',
  usageType: 'PRIVATE',
  status: 'DRAFT',
  manufacturingYear: new Date().getFullYear() - 3,
  isPriceNegotiable: true,
};

export default function VehicleForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [images, setImages] = useState<MediaItem[]>([]);
  const originalImageIds = useRef<string[]>([]);

  const { data: existing } = useQuery({
    queryKey: queryKeys.vehicles.adminDetail(id || ''),
    queryFn: () => getAdminVehicle(id!),
    enabled: isEdit,
  });
  const { data: brands } = useQuery({ queryKey: queryKeys.master.brands(), queryFn: () => listBrands() });
  const { data: locations } = useQuery({ queryKey: queryKeys.master.locations(), queryFn: listLocations });

  const { register, handleSubmit, watch, setValue, reset, setError, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: EMPTY,
  });

  // Edit: prefill when the vehicle loads. Re-hydrate on id change or when fresh data
  // arrives for the same id (stale cache) unless the user has started editing.
  const hydratedId = useRef<string | null>(null);
  useEffect(() => {
    if (!isEdit) { hydratedId.current = null; return; }
    if (!existing) return;
    const isNewVehicle = hydratedId.current !== existing.id;
    if (!isNewVehicle && isDirty) return;
    hydratedId.current = existing.id;

    const brandId = typeof existing.brand === 'string' ? existing.brand : (existing.brand as any)?._id ?? '';
    const pick = (v: unknown) => (v === null || v === undefined ? '' : v);
    reset({
      ...EMPTY,
      ...(existing as unknown as Partial<FormValues>),
      brand: brandId,
      brandName: String(pick(existing.brandName)),
      model: String(pick(existing.model)),
      variant: String(pick(existing.variant)),
      color: String(pick(existing.color)),
      description: String(pick(existing.description)),
      status: existing.status || 'DRAFT',
      category: existing.category || 'PASSENGER_CAR',
      usageType: existing.usageType || 'PERSONAL',
      fuelType: String(pick(existing.fuelType)),
      transmission: String(pick(existing.transmission)),
      ownerCount: String(pick(existing.ownerCount)),
      accidentHistory: existing.accidentHistory || 'NONE',
      tyreCondition: existing.tyreCondition || 'GOOD',
      subCategory: String(pick(existing.subCategory)),
      locationState: String(pick(existing.locationState)),
      locationCity: String(pick(existing.locationCity)),
      locationPincode: String(pick(existing.locationPincode)),
      yardName: String(pick(existing.yardName)),
      modifications: String(pick(existing.modifications)),
      axleConfiguration: String(pick(existing.axleConfiguration)),
      features: (existing.features ?? []).join(', '),
      highlights: (existing.highlights ?? []).join(', '),
    } as FormValues);
    const saved = existing.images ?? [];
    originalImageIds.current = saved
      .map((img) => img._id)
      .filter((v): v is string => !!v);
    setImages(
      saved.map((img, idx) => ({
        id: img._id || `existing-${idx}`,
        url: img.url,
        tag: img.tag as string | undefined,
        existing: true,
      })),
    );
  }, [isEdit, existing, reset]);

  const category = watch('category');
  const usageType = watch('usageType');
  const isRateOnRequest = watch('isRateOnRequest');
  const subCategory = watch('subCategory');
  const locationState = watch('locationState');
  const states = Array.from(
    new Set([...(locations ?? []).map((l) => l.state), locationState].filter(Boolean) as string[]),
  );
  const filteredBrands = (brands ?? []).filter((b) => !b.categories?.length || b.categories.includes(category));
  const isCommercial = category === 'COMMERCIAL' || usageType === 'COMMERCIAL';
  const isCaravan = category === 'CARAVAN_MOTORHOME';

  // NOTE: the backend currently whitelists states (master.validator / india constants),
  // so creating an arbitrary new state will be rejected until the backend whitelist is relaxed.
  // The combobox still lets staff pick/type, but we surface the real error here.
  const addState = useMutation({
    mutationFn: (name: string) => createLocation({ state: name, stateCode: name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'XX', cities: [] }),
    onSuccess: (loc) => {
      qc.invalidateQueries({ queryKey: queryKeys.master.locations() });
      setValue('locationState', loc.state, { shouldValidate: true });
      toast.success(`State "${loc.state}" added`);
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not add state (backend only accepts the supported states list)')),
  });

  // Row counts at sm:grid-cols-2 (items per row = 2) for pairing sections of equal height.
  const cols = 2;
  const rowsOf = (items: number) => Math.ceil(items / cols);
  const basicsRows = rowsOf(7 + (category === 'COMMERCIAL' ? 1 : 0));
  const pricingRows = rowsOf(2 + (isRateOnRequest ? 0 : 2));
  const specsRows = rowsOf(10);
  const conditionRows = rowsOf(6) + 1; // grid + modifications row
  const commercialRows = rowsOf(9);
  const caravanRows = rowsOf(5);
  const locationRows = rowsOf(4);
  const publishRows = rowsOf(2);
  const sideBySide = (a: number, b: number) =>
    a === b ? 'grid gap-5 xl:grid-cols-2 xl:items-start' : 'space-y-5';

  const { mutateAsync: save, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload: Partial<Vehicle> = {
        ...(values as any),
        features: values.features ? values.features.split(',').map((s) => s.trim()).filter(Boolean) : [],
        highlights: values.highlights ? values.highlights.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      const vehicle = isEdit ? await updateVehicle(id!, payload) : await createVehicle(payload);

      // Delete existing photos the user removed (only real backend image ids).
      const currentIds = new Set(images.map((i) => i.id));
      const removedIds = originalImageIds.current.filter((imageId) => !currentIds.has(imageId));
      for (const imageId of removedIds) {
        await removeVehicleImagesSafe(vehicle.id, imageId);
      }

      // Upload newly picked photos.
      const added = images.filter((i) => i.file);
      if (added.length > 0) {
        await addVehicleImages(
          vehicle.id,
          added.map((i) => i.file!) as File[],
          added.map((i) => i.tag || 'EXTERIOR'),
        );
      }

      // Persist photos that were only provided as a remote URL.
      const addedUrls = images.filter((i) => !i.file && !i.existing && i.url);
      if (addedUrls.length > 0) {
        await addVehicleImageUrls(
          vehicle.id,
          addedUrls.map((i) => ({ url: i.url, tag: i.tag || 'EXTERIOR' })),
        );
      }
      return vehicle;
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Vehicle updated' : 'Vehicle created');
      qc.invalidateQueries({ queryKey: ['vehicles', 'admin'] });
      navigate(ROUTES.admin.vehicles);
    },
    onError: (err) => {
      const data = (err as any)?.response?.data;
      const details: string[] = Array.isArray(data?.errors) ? data.errors : [];
      const formFields = new Set(Object.keys(EMPTY));
      // "field" is required / "field" must be ...  -> map to the input and focus it
      const first = details.find((m) => typeof m === 'string' && formFields.has(m.replace(/^"([^"]+)".*$/, '$1')));
      if (first) {
        const field = first.replace(/^"([^"]+)".*$/, '$1') as keyof FormValues;
        setError(field, { message: first.replace(/^"[^"]+"\s*/, '') });
        requestAnimationFrame(() => {
          const el = document.querySelector(`[name="${field}"]`) as HTMLElement | null;
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (el as HTMLInputElement | null)?.focus?.();
        });
      }
      toast.error(details[0] || data?.message || getApiErrorMessage(err, 'Could not save the vehicle'));
    },
  });

  const { mutateAsync: addBrand, isPending: creatingBrand } = useMutation({
    mutationFn: (name: string) => createBrand({ name, categories: [category] }),
    onSuccess: (brand) => {
      const brandId = brand._id || brand.id || '';
      setValue('brandName', brand.name, { shouldValidate: true });
      setValue('brand', brandId, { shouldValidate: true });
      qc.invalidateQueries({ queryKey: queryKeys.master.brands() });
      toast.success(`Brand “${brand.name}” added`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the brand')),
  });

  return (
    <>
      <SEO title={isEdit ? 'Edit vehicle' : 'Add vehicle'} noindex />
      <form
        onSubmit={handleSubmit((d) => save(d), (errs) => {
          const first = Object.keys(errs)[0] as keyof FormValues | undefined;
          if (first) {
            const el = document.querySelector(`[name="${String(first)}"]`) as HTMLElement | null;
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (el as HTMLInputElement | null)?.focus?.();
          }
          toast.error('Please fix the highlighted fields.');
        })}
        className="space-y-5 pb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" asChild>
              <Link to={ROUTES.admin.vehicles}><ArrowLeft className="size-4" /></Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">{isEdit ? 'Edit vehicle' : 'Add vehicle'}</h1>
              <p className="text-sm text-muted-foreground">Fill in the details below, then save.</p>
            </div>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="mr-1 h-4 w-4" /> Save</>}
          </Button>
        </div>

        <div className="space-y-5">
          <div className={sideBySide(basicsRows, pricingRows)}>
            <Section title="Basics">
              <div className="grid gap-4 sm:grid-cols-2">
                <F label="Category" error={errors.category?.message}>
                  <Select value={category} onValueChange={(v) => setValue('category', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{VEHICLE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="Usage type" error={errors.usageType?.message}>
                  <Select value={usageType} onValueChange={(v) => setValue('usageType', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{USAGE_TYPES.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                {category === 'COMMERCIAL' && (
                  <F label="Commercial sub-category (optional)">
                    <Select
                      value={subCategory || NONE}
                      onValueChange={(v) => setValue('subCategory', v === NONE ? undefined : v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>None</SelectItem>
                        {COMMERCIAL_SUBCATEGORIES.map((s) => <SelectItem key={s} value={s}>{titleCase(s)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </F>
                )}
                <F label="Brand" error={errors.brandName?.message}>
                  <Combobox
                    value={watch('brandName') || ''}
                    onChange={(v) => {
                      setValue('brandName', v, { shouldValidate: true });
                      const b = filteredBrands.find((x) => x.name === v);
                      setValue('brand', (b?._id || b?.id) ?? '', { shouldValidate: true });
                    }}
                    onCreate={(name) => { if (name) void addBrand(name); }}
                    options={filteredBrands.map((b) => ({ value: b.name, label: b.name }))}
                    placeholder="Select brand"
                    searchPlaceholder="Search or add a brand…"
                    emptyText={creatingBrand ? 'Adding brand…' : 'No brand found — type to add.'}
                  />
                </F>
                <F label="Model" error={errors.model?.message}><Input {...register('model')} /></F>
                <F label="Variant"><Input {...register('variant')} /></F>
                <F label="Manufacturing year" error={errors.manufacturingYear?.message}><Input type="number" {...register('manufacturingYear')} /></F>
                <F label="Colour"><Input {...register('color')} /></F>
              </div>
            </Section>

            <Section title="Pricing">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 self-end pb-2">
                  <Switch checked={!!isRateOnRequest} onCheckedChange={(v) => setValue('isRateOnRequest', v)} />
                  <span className="text-sm">Rate on request</span>
                </div>
                {!isRateOnRequest && (
                  <>
                    <F label="Price (from)" error={errors.price?.message}><Input type="number" {...register('price')} /></F>
                    <F label="Price (max)" error={errors.priceMax?.message}><Input type="number" {...register('priceMax')} /></F>
                  </>
                )}
                <div className="flex items-center gap-2 self-end pb-2">
                  <Switch checked={!!watch('isPriceNegotiable')} onCheckedChange={(v) => setValue('isPriceNegotiable', v)} />
                  <span className="text-sm">Price negotiable</span>
                </div>
              </div>
            </Section>
          </div>

          <div className={sideBySide(specsRows, conditionRows)}>
            <Section title="Specs & performance">
              <div className="grid gap-4 sm:grid-cols-2">
                <F label="Fuel type" error={errors.fuelType?.message}>
                  <Select value={watch('fuelType') || ''} onValueChange={(v) => setValue('fuelType', v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{FUEL_TYPES.map((f) => <SelectItem key={f} value={f}>{titleCase(f)}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="Transmission" error={errors.transmission?.message}>
                  <Select value={watch('transmission') || ''} onValueChange={(v) => setValue('transmission', v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{TRANSMISSIONS.map((t) => <SelectItem key={t} value={t}>{titleCase(t)}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="KM driven" error={errors.kmDriven?.message}><Input type="number" {...register('kmDriven')} /></F>
                <F label="Ownership" error={errors.ownerCount?.message}>
                  <Select value={watch('ownerCount') || ''} onValueChange={(v) => setValue('ownerCount', v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{OWNER_COUNTS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="Seats"><Input type="number" {...register('seats')} /></F>
                <F label="Engine (cc)"><Input type="number" {...register('engineCapacityCc')} /></F>
                <F label="Power (bhp)"><Input type="number" {...register('powerBhp')} /></F>
                <F label="Torque (Nm)"><Input type="number" {...register('torqueNm')} /></F>
                <F label="Mileage (kmpl)"><Input type="number" {...register('mileageKmpl')} /></F>
                <F label="Battery (kWh)"><Input type="number" {...register('batteryCapacityKwh')} /></F>
              </div>
            </Section>

            <Section title="Condition & history">
              <div className="grid gap-4 sm:grid-cols-2">
                <F label="Accident history" error={errors.accidentHistory?.message}>
                  <Select value={watch('accidentHistory') || ''} onValueChange={(v) => setValue('accidentHistory', v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{ACCIDENT_HISTORY.map((a) => <SelectItem key={a} value={a}>{titleCase(a)}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="Tyre condition" error={errors.tyreCondition?.message}>
                  <Select value={watch('tyreCondition') || ''} onValueChange={(v) => setValue('tyreCondition', v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{TYRE_CONDITIONS.map((t) => <SelectItem key={t} value={t}>{titleCase(t)}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="Inspection score (1–10)"><Input type="number" {...register('inspectionScore')} /></F>
                <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('floodDamage')} onCheckedChange={(v) => setValue('floodDamage', v)} /> <span className="text-sm">Flood damaged</span></div>
                <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('serviceHistoryAvailable')} onCheckedChange={(v) => setValue('serviceHistoryAvailable', v)} /> <span className="text-sm">Service history available</span></div>
                <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('isInspected')} onCheckedChange={(v) => setValue('isInspected', v)} /> <span className="text-sm">Inspected</span></div>
              </div>
              <F label="Modifications"><Textarea rows={2} {...register('modifications')} /></F>
            </Section>
          </div>

          {isCommercial ? (
            <div className={sideBySide(commercialRows, locationRows)}>
              <Section title="Commercial details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <F label="GVW (kg)"><Input type="number" {...register('grossVehicleWeightKg')} /></F>
                  <F label="Payload capacity (kg)"><Input type="number" {...register('payloadCapacityKg')} /></F>
                  <F label="Unladen weight (kg)"><Input type="number" {...register('unladenWeightKg')} /></F>
                  <F label="Number of tyres"><Input type="number" {...register('numberOfTyres')} /></F>
                  <F label="Wheelbase (mm)"><Input type="number" {...register('wheelbaseMm')} /></F>
                  <F label="Fuel tank (L)"><Input type="number" {...register('tankCapacityLitres')} /></F>
                  <F label="Axle configuration">
                    <Select value={watch('axleConfiguration') || ''} onValueChange={(v) => setValue('axleConfiguration', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{AXLE_CONFIGURATIONS.map((a) => <SelectItem key={a} value={a}>{titleCase(a)}</SelectItem>)}</SelectContent>
                    </Select>
                  </F>
                  <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('hasAc')} onCheckedChange={(v) => setValue('hasAc', v)} /> <span className="text-sm">Air conditioned</span></div>
                  <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('hasGpsTelematics')} onCheckedChange={(v) => setValue('hasGpsTelematics', v)} /> <span className="text-sm">GPS / telematics</span></div>
                </div>
              </Section>

              <Section title="Location">
                <div className="grid gap-4 sm:grid-cols-2">
                  <F label="State" error={errors.locationState?.message}>
                    <Combobox
                      value={watch('locationState') || ''}
                      onChange={(v) => setValue('locationState', v, { shouldValidate: true })}
                      onCreate={(name) => { if (name) addState.mutate(name); }}
                      options={states.map((s) => ({ value: s, label: s }))}
                      placeholder="Select state"
                      searchPlaceholder="Search or add a state�"
                      emptyText={addState.isPending ? 'Adding state�' : 'No state found � type to add.'}
                    />
                  </F>
                  <F label="City" error={errors.locationCity?.message}><Input {...register('locationCity')} /></F>
                  <F label="Pincode" error={errors.locationPincode?.message}><Input inputMode="numeric" {...register('locationPincode')} /></F>
                  <F label="Yard name"><Input {...register('yardName')} /></F>
                </div>
              </Section>
            </div>
          ) : isCaravan ? (
            <div className={sideBySide(caravanRows, locationRows)}>
              <Section title="Caravan details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <F label="Water tank (L)"><Input type="number" {...register('waterTankLitres')} /></F>
                  <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('hasKitchenette')} onCheckedChange={(v) => setValue('hasKitchenette', v)} /> <span className="text-sm">Kitchenette</span></div>
                  <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('hasToilet')} onCheckedChange={(v) => setValue('hasToilet', v)} /> <span className="text-sm">Toilet</span></div>
                  <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('solarPanel')} onCheckedChange={(v) => setValue('solarPanel', v)} /> <span className="text-sm">Solar panel</span></div>
                  <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('awning')} onCheckedChange={(v) => setValue('awning', v)} /> <span className="text-sm">Awning</span></div>
                </div>
              </Section>

              <Section title="Location">
                <div className="grid gap-4 sm:grid-cols-2">
                  <F label="State" error={errors.locationState?.message}>
                    <Combobox
                      value={watch('locationState') || ''}
                      onChange={(v) => setValue('locationState', v, { shouldValidate: true })}
                      onCreate={(name) => { if (name) addState.mutate(name); }}
                      options={states.map((s) => ({ value: s, label: s }))}
                      placeholder="Select state"
                      searchPlaceholder="Search or add a state�"
                      emptyText={addState.isPending ? 'Adding state�' : 'No state found � type to add.'}
                    />
                  </F>
                  <F label="City" error={errors.locationCity?.message}><Input {...register('locationCity')} /></F>
                  <F label="Pincode" error={errors.locationPincode?.message}><Input inputMode="numeric" {...register('locationPincode')} /></F>
                  <F label="Yard name"><Input {...register('yardName')} /></F>
                </div>
              </Section>
            </div>
          ) : (
            <div className={sideBySide(locationRows, publishRows)}>
              <Section title="Location">
                <div className="grid gap-4 sm:grid-cols-2">
                  <F label="State" error={errors.locationState?.message}>
                    <Combobox
                      value={watch('locationState') || ''}
                      onChange={(v) => setValue('locationState', v, { shouldValidate: true })}
                      onCreate={(name) => { if (name) addState.mutate(name); }}
                      options={states.map((s) => ({ value: s, label: s }))}
                      placeholder="Select state"
                      searchPlaceholder="Search or add a state�"
                      emptyText={addState.isPending ? 'Adding state�' : 'No state found � type to add.'}
                    />
                  </F>
                  <F label="City" error={errors.locationCity?.message}><Input {...register('locationCity')} /></F>
                  <F label="Pincode" error={errors.locationPincode?.message}><Input inputMode="numeric" {...register('locationPincode')} /></F>
                  <F label="Yard name"><Input {...register('yardName')} /></F>
                </div>
              </Section>

              <Section title="Publish">
                <div className="grid gap-4 sm:grid-cols-2">
                  <F label="Status">
                    <Select value={watch('status') || 'DRAFT'} onValueChange={(v) => setValue('status', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{VEHICLE_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </F>
                  <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('isFeatured')} onCheckedChange={(v) => setValue('isFeatured', v)} /> <span className="text-sm">Feature on homepage</span></div>
                </div>
              </Section>
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:items-start">
            <Section title="Photos">
              <MediaUpload items={images} onChange={setImages} max={15} tags={IMAGE_TAGS} label="Add photo" />
              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  Changes are saved when you press Save — removed photos are deleted, new ones uploaded.
                </p>
              )}
            </Section>

            <Section title="Description & features">
              <div className="grid gap-4">
                <F label="Video URL (optional)"><Input {...register('videoUrl')} /></F>
                <F label="Highlights (comma separated)"><Textarea rows={2} placeholder="Single owner, Full service history" {...register('highlights')} /></F>
                <F label="Features (comma separated)"><Textarea rows={2} placeholder="Air conditioning, ABS, Airbags" {...register('features')} /></F>
                <F label="Description"><Textarea rows={4} {...register('description')} /></F>
              </div>
            </Section>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="mr-1 h-4 w-4" /> Save vehicle</>}
          </Button>
        </div>
      </form>
    </>
  );
}

async function removeVehicleImagesSafe(vehicleId: string, imageId: string) {
  try {
    await removeVehicleImage(vehicleId, imageId);
  } catch {
    // Deleting a single photo failing shouldn't abort the whole save.
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-xl border p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function F({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className={cn('space-y-1.5', error && '[&_input]:border-destructive [&_textarea]:border-destructive [&_[data-slot=select-trigger]]:border-destructive [&_[data-slot=select-trigger]]:ring-1 [&_[data-slot=select-trigger]]:ring-destructive/30')}>
      <Label className={cn('text-xs', error && 'text-destructive')}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

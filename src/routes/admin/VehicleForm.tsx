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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { SEO } from '@/components/common/SEO';
import { MediaUpload, type MediaItem } from '@/components/common/MediaUpload';
import {
  getAdminVehicle, createVehicle, updateVehicle, addVehicleImages, addVehicleImageUrls, removeVehicleImage,
} from '@/services/vehicle.service';
import { listBrands, listLocations } from '@/services/master.service';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/constants/routes';
import {
  VEHICLE_CATEGORIES, USAGE_TYPES, COMMERCIAL_SUBCATEGORIES, BODY_TYPES_BY_CATEGORY,
  FUEL_TYPES, TRANSMISSIONS, BS_NORMS, OWNER_COUNTS, VEHICLE_STATUSES,
  ROAD_TAX_TYPES, ACCIDENT_HISTORY, TYRE_CONDITIONS, REGISTRATION_TYPES,
  PERMIT_TYPES, AXLE_CONFIGURATIONS, CABIN_TYPES,
} from '@/constants/vehicleEnums';
import { registrationNumberSchema, pincodeSchema } from '@/lib/validations';
import { getApiErrorMessage, titleCase } from '@/lib/utils';
import type { Vehicle } from '@/types/vehicle.types';

const IMAGE_TAGS = ['EXTERIOR', 'INTERIOR', 'ENGINE', 'ODOMETER', 'DOCUMENTS', 'TYRES', 'FRONT', 'BACK', 'SIDE'];

const optNum = z.preprocess(
  (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
  z.number().optional(),
);
const optStr = z.string().trim().optional().or(z.literal(''));

const schema = z.object({
  category: z.enum(['TWO_WHEELER', 'THREE_WHEELER', 'PASSENGER_CAR', 'COMMERCIAL', 'CARAVAN_MOTORHOME']),
  usageType: z.enum(['PRIVATE', 'COMMERCIAL']),
  subCategory: optStr,
  bodyType: optStr,
  brand: z.string().min(1, 'Brand is required'),
  brandName: z.string().trim().min(1, 'Brand is required'),
  model: z.string().trim().min(1, 'Model is required'),
  variant: optStr,
  manufacturingYear: z.coerce.number().int().min(1980),
  color: optStr,
  fuelType: z.string().min(1, 'Fuel type is required'),
  transmission: z.string().min(1, 'Transmission is required'),
  bsNorm: optStr,
  engineCapacityCc: optNum,
  powerBhp: optNum,
  torqueNm: optNum,
  mileageKmpl: optNum,
  batteryCapacityKwh: optNum,
  rangeKm: optNum,
  kmDriven: z.coerce.number().min(0, 'KM driven is required'),
  ownerCount: z.string().min(1, 'Select ownership'),
  seats: optNum,
  numberOfKeys: optNum,
  price: z.coerce.number().min(1000, 'Price must be at least ₹1,000'),
  isPriceNegotiable: z.boolean().optional(),
  emiStartingFrom: optNum,
  description: optStr,
  features: optStr,
  highlights: optStr,
  videoUrl: optStr,
  status: z.string().optional(),
  isFeatured: z.boolean().optional(),
  registrationNumber: z.union([registrationNumberSchema, z.literal('')]).optional(),
  registrationState: z.string().min(1, 'Registered state is required'),
  rtoCode: optStr,
  registrationCity: optStr,
  registrationType: optStr,
  rcAvailable: z.boolean().optional(),
  roadTax: z.string().min(1, 'Road tax status is required'),
  roadTaxValidTill: optStr,
  permitType: optStr,
  fastagInstalled: z.boolean().optional(),
  chassisNumber: optStr,
  engineNumber: optStr,
  accidentHistory: z.string().min(1, 'Accident history is required'),
  floodDamage: z.boolean().optional(),
  serviceHistoryAvailable: z.boolean().optional(),
  lastServiceDate: optStr,
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
  cabinType: optStr,
  tankCapacityLitres: optNum,
  hasAc: z.boolean().optional(),
  hasGpsTelematics: z.boolean().optional(),
  sleepingCapacity: optNum,
  hasKitchenette: z.boolean().optional(),
  hasToilet: z.boolean().optional(),
  waterTankLitres: optNum,
  solarPanel: z.boolean().optional(),
  awning: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: Partial<FormValues> = {
  category: 'PASSENGER_CAR',
  usageType: 'PRIVATE',
  status: 'DRAFT',
  manufacturingYear: new Date().getFullYear() - 3,
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

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (existing) {
      reset({
        ...existing,
        features: (existing.features ?? []).join(', '),
        highlights: (existing.highlights ?? []).join(', '),
        brand: (existing as any).brand || '',
      } as any);
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
    }
  }, [existing, reset]);

  const category = watch('category');
  const usageType = watch('usageType');
  const bodyTypes = BODY_TYPES_BY_CATEGORY[category] ?? [];
  const states = (locations ?? []).map((l) => l.state);
  const filteredBrands = (brands ?? []).filter((b) => !b.categories?.length || b.categories.includes(category));
  const isCommercial = category === 'COMMERCIAL' || usageType === 'COMMERCIAL';
  const isCaravan = category === 'CARAVAN_MOTORHOME';

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
    onSuccess: (vehicle) => {
      toast.success(isEdit ? 'Vehicle updated' : 'Vehicle created');
      qc.invalidateQueries({ queryKey: ['vehicles', 'admin'] });
      navigate(ROUTES.admin.vehicles);
      return vehicle;
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the vehicle')),
  });

  return (
    <>
      <SEO title={isEdit ? 'Edit vehicle' : 'Add vehicle'} noindex />
      <form onSubmit={handleSubmit((d) => save(d))} className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" asChild>
              <Link to={ROUTES.admin.vehicles}><ArrowLeft className="size-4" /></Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">{isEdit ? 'Edit vehicle' : 'Add vehicle'}</h1>
              <p className="text-sm text-muted-foreground">Fields marked with the required validation must be filled.</p>
            </div>
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="mr-1 h-4 w-4" /> Save</>}
          </Button>
        </div>

        <Tabs defaultValue="details">
          <TabsList className="flex-wrap">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="legal">Documents & location</TabsTrigger>
            <TabsTrigger value="media">Photos & publish</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Section title="Basics">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <F label="Category" error={errors.category?.message}>
                  <Select value={category} onValueChange={(v) => { setValue('category', v as any); setValue('bodyType', ''); }}>
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
                  <F label="Commercial sub-category">
                    <Select value={watch('subCategory') || ''} onValueChange={(v) => setValue('subCategory', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{COMMERCIAL_SUBCATEGORIES.map((s) => <SelectItem key={s} value={s}>{titleCase(s)}</SelectItem>)}</SelectContent>
                    </Select>
                  </F>
                )}
                {bodyTypes.length > 0 && (
                  <F label="Body type">
                    <Select value={watch('bodyType') || ''} onValueChange={(v) => setValue('bodyType', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{bodyTypes.map((b) => <SelectItem key={b} value={b}>{titleCase(b)}</SelectItem>)}</SelectContent>
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
                    options={filteredBrands.map((b) => ({ value: b.name, label: b.name }))}
                    placeholder="Select brand"
                    searchPlaceholder="Search brand…"
                    emptyText="No brand found."
                  />
                </F>
                <F label="Model" error={errors.model?.message}><Input {...register('model')} /></F>
                <F label="Variant"><Input {...register('variant')} /></F>
                <F label="Manufacturing year" error={errors.manufacturingYear?.message}><Input type="number" {...register('manufacturingYear')} /></F>
                <F label="Colour"><Input {...register('color')} /></F>
                <F label="Price (₹)" error={errors.price?.message}><Input type="number" {...register('price')} /></F>
                <F label="EMI starting from (₹, optional)"><Input type="number" {...register('emiStartingFrom')} /></F>
                <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('isPriceNegotiable')} onCheckedChange={(v) => setValue('isPriceNegotiable', v)} /> <span className="text-sm">Price negotiable</span></div>
              </div>
            </Section>

            <Section title="Specs & performance">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <F label="BS norm">
                  <Select value={watch('bsNorm') || ''} onValueChange={(v) => setValue('bsNorm', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{BS_NORMS.map((b) => <SelectItem key={b} value={b}>{titleCase(b)}</SelectItem>)}</SelectContent>
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
                <F label="Number of keys"><Input type="number" {...register('numberOfKeys')} /></F>
                <F label="Engine (cc)"><Input type="number" {...register('engineCapacityCc')} /></F>
                <F label="Power (bhp)"><Input type="number" {...register('powerBhp')} /></F>
                <F label="Torque (Nm)"><Input type="number" {...register('torqueNm')} /></F>
                <F label="Mileage (kmpl)"><Input type="number" {...register('mileageKmpl')} /></F>
                <F label="Battery (kWh)"><Input type="number" {...register('batteryCapacityKwh')} /></F>
                <F label="Range (km)"><Input type="number" {...register('rangeKm')} /></F>
              </div>
            </Section>

            <Section title="Condition & history">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <F label="Last service date"><Input type="date" {...register('lastServiceDate')} /></F>
                <F label="Inspection score (1–10)"><Input type="number" {...register('inspectionScore')} /></F>
                <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('floodDamage')} onCheckedChange={(v) => setValue('floodDamage', v)} /> <span className="text-sm">Flood damaged</span></div>
                <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('serviceHistoryAvailable')} onCheckedChange={(v) => setValue('serviceHistoryAvailable', v)} /> <span className="text-sm">Service history available</span></div>
                <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('isInspected')} onCheckedChange={(v) => setValue('isInspected', v)} /> <span className="text-sm">Inspected</span></div>
              </div>
              <F label="Modifications"><Textarea rows={2} {...register('modifications')} /></F>
            </Section>

            {isCommercial && (
              <Section title="Commercial details">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <F label="Cabin type">
                    <Select value={watch('cabinType') || ''} onValueChange={(v) => setValue('cabinType', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{CABIN_TYPES.map((c) => <SelectItem key={c} value={c}>{titleCase(c)}</SelectItem>)}</SelectContent>
                    </Select>
                  </F>
                  <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('hasAc')} onCheckedChange={(v) => setValue('hasAc', v)} /> <span className="text-sm">Air conditioned</span></div>
                  <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('hasGpsTelematics')} onCheckedChange={(v) => setValue('hasGpsTelematics', v)} /> <span className="text-sm">GPS / telematics</span></div>
                </div>
              </Section>
            )}

            {isCaravan && (
              <Section title="Caravan details">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <F label="Sleeping capacity"><Input type="number" {...register('sleepingCapacity')} /></F>
                  <F label="Water tank (L)"><Input type="number" {...register('waterTankLitres')} /></F>
                  <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('hasKitchenette')} onCheckedChange={(v) => setValue('hasKitchenette', v)} /> <span className="text-sm">Kitchenette</span></div>
                  <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('hasToilet')} onCheckedChange={(v) => setValue('hasToilet', v)} /> <span className="text-sm">Toilet</span></div>
                  <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('solarPanel')} onCheckedChange={(v) => setValue('solarPanel', v)} /> <span className="text-sm">Solar panel</span></div>
                  <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('awning')} onCheckedChange={(v) => setValue('awning', v)} /> <span className="text-sm">Awning</span></div>
                </div>
              </Section>
            )}
          </TabsContent>

          <TabsContent value="legal" className="space-y-4">
            <Section title="Registration & documents">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <F label="Registration number" error={errors.registrationNumber?.message}><Input placeholder="MH12AB1234" {...register('registrationNumber')} /></F>
                <F label="Registered state" error={errors.registrationState?.message}>
                  <Select value={watch('registrationState') || ''} onValueChange={(v) => setValue('registrationState', v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="RTO code"><Input {...register('rtoCode')} /></F>
                <F label="Registration city"><Input {...register('registrationCity')} /></F>
                <F label="Registration type">
                  <Select value={watch('registrationType') || ''} onValueChange={(v) => setValue('registrationType', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{REGISTRATION_TYPES.map((r) => <SelectItem key={r} value={r}>{titleCase(r)}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="Road tax" error={errors.roadTax?.message}>
                  <Select value={watch('roadTax') || ''} onValueChange={(v) => setValue('roadTax', v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{ROAD_TAX_TYPES.map((r) => <SelectItem key={r} value={r}>{titleCase(r)}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="Road tax valid till"><Input type="date" {...register('roadTaxValidTill')} /></F>
                <F label="Permit type">
                  <Select value={watch('permitType') || ''} onValueChange={(v) => setValue('permitType', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{PERMIT_TYPES.map((p) => <SelectItem key={p} value={p}>{titleCase(p)}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="Chassis number"><Input {...register('chassisNumber')} /></F>
                <F label="Engine number"><Input {...register('engineNumber')} /></F>
                <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('rcAvailable')} onCheckedChange={(v) => setValue('rcAvailable', v)} /> <span className="text-sm">RC available</span></div>
                <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('fastagInstalled')} onCheckedChange={(v) => setValue('fastagInstalled', v)} /> <span className="text-sm">FASTag installed</span></div>
              </div>
            </Section>

            <Section title="Location">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <F label="State" error={errors.locationState?.message}>
                  <Select value={watch('locationState') || ''} onValueChange={(v) => setValue('locationState', v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="City" error={errors.locationCity?.message}><Input {...register('locationCity')} /></F>
                <F label="Pincode" error={errors.locationPincode?.message}><Input inputMode="numeric" {...register('locationPincode')} /></F>
                <F label="Yard name"><Input {...register('yardName')} /></F>
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
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

            <Section title="Publish">
              <div className="grid gap-4 sm:grid-cols-2">
                <F label="Status">
                  <Select value={watch('status') || 'DRAFT'} onValueChange={(v) => setValue('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{VEHICLE_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <div className="flex items-center gap-2 self-end pb-2"><Switch checked={!!watch('isFeatured')} onCheckedChange={(v) => setValue('isFeatured', v)} /> <span className="text-sm">Feature on homepage</span></div>
              </div>
            </Section>
          </TabsContent>
        </Tabs>

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
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

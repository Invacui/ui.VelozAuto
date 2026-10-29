import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { SEO } from '@/components/common/SEO';
import { MediaUpload, type MediaItem } from '@/components/common/MediaUpload';
import { createSellRequest } from '@/services/sellRequest.service';
import { uploadImages } from '@/services/upload.service';
import { listBrands } from '@/services/master.service';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { VEHICLE_CONDITIONS } from '@/constants/vehicleEnums';
import { phoneSchema } from '@/lib/validations';
import { getApiErrorMessage } from '@/lib/utils';
import type { CreateSellRequestDto, SellRequestImage, SellImageTag } from '@/types/sellRequest.types';

/** Used only if the master-brand API is unavailable, so the picker is never empty. */
const FALLBACK_MAKES = [
  'Maruti Suzuki', 'Hyundai', 'Tata Motors', 'Mahindra', 'Honda', 'Toyota', 'Kia', 'MG Motor',
  'Skoda', 'Renault', 'Volkswagen', 'Nissan', 'Mercedes-Benz', 'BMW', 'Audi', 'Ford',
  'Ashok Leyland', 'Eicher', 'BharatBenz', 'Force Motors', 'Isuzu', 'Piaggio',
  'Bajaj Auto', 'TVS', 'Hero MotoCorp', 'Royal Enfield', 'Yamaha', 'KTM', 'Ola Electric', 'Ather Energy',
];

const numeric = (message: string) =>
  z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)),
    z.number({ invalid_type_error: message }),
  );

const currentYear = new Date().getFullYear();

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name'),
  email: z.string().trim().email('Enter a valid email address').optional().or(z.literal('')),
  phone: phoneSchema,
  brandName: z.string().trim().min(1, 'Please select a make'),
  brand: z.string().optional().or(z.literal('')),
  model: z.string().trim().min(1, 'Please enter the model'),
  manufacturingYear: numeric('Enter the year')
    .refine((n) => Number.isInteger(n), 'Enter a valid year')
    .refine((n) => (n as number) >= 1980 && (n as number) <= currentYear + 1, 'Enter a valid year'),
  kmDriven: numeric('Enter the mileage').refine((n) => (n as number) >= 0, 'Enter the mileage'),
  condition: z.string().min(1, 'Select the vehicle condition'),
  description: z.string().trim().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export default function Sell() {
  const { user } = useAuth();
  const [images, setImages] = useState<MediaItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const {
    data: brands,
    isLoading: brandsLoading,
  } = useQuery({ queryKey: queryKeys.master.brands(), queryFn: () => listBrands() });

  const liveBrands = useMemo(
    () => (brands ?? []).map((b) => ({ id: b._id || b.id || '', name: b.name })),
    [brands],
  );
  const brandOptions = liveBrands.length > 0
    ? liveBrands
    : FALLBACK_MAKES.map((name) => ({ id: '', name }));

  const {
    register, handleSubmit, setValue, watch, formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    mode: 'onTouched',
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      brandName: '',
      brand: '',
      model: '',
      manufacturingYear: '' as any,
      kmDriven: '' as any,
      condition: '',
      description: '',
    },
  });

  const values = watch();

  const { mutateAsync } = useMutation({ mutationFn: createSellRequest });

  const onSubmit = handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      let uploaded: SellRequestImage[] = [];
      const files = images.filter((i) => i.file);
      if (files.length > 0) {
        const res = await uploadImages(files.map((i) => i.file!) as File[]);
        uploaded = res.map((r, idx) => ({
          url: r.url,
          s3Key: r.s3Key,
          tag: (images[idx]?.tag as SellImageTag) || 'FRONT',
        }));
      }

      const payload: CreateSellRequestDto = {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone,
        brandName: data.brandName,
        brand: data.brand || undefined,
        model: data.model,
        manufacturingYear: data.manufacturingYear,
        kmDriven: data.kmDriven,
        condition: data.condition,
        description: data.description || undefined,
        sellerType: 'INDIVIDUAL',
        images: uploaded,
      };
      const created = await mutateAsync(payload);
      setCreatedId(created.id || created._id);
      toast.success('Request submitted!');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not submit your request'));
    } finally {
      setSubmitting(false);
    }
  });

  if (createdId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Request submitted</h1>
        <p className="mt-2 text-muted-foreground">
          Thanks{values.name ? `, ${values.name}` : ''}. Our team will review your vehicle and call
          you with a transparent valuation — usually within 48 hours.
        </p>
        <div className="mt-4 rounded-lg border bg-muted/40 p-3 text-sm">
          Request ID: <span className="font-mono font-semibold">{createdId}</span>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline"><Link to={ROUTES.home}>Back to home</Link></Button>
          {user && <Button asChild><Link to={ROUTES.account.sellRequests}>View my requests</Link></Button>}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Sell your vehicle"
        description="Get a transparent valuation for your car, bike, commercial vehicle or caravan. Tell us a little about what you're driving — usually within 48 hours."
        noindex
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          {/* Left — pitch */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Ready for your next move?
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Turn your current vehicle into momentum.
            </h1>
            <p className="mt-4 text-muted-foreground">
              Tell us a little about what you're driving. We'll give you a transparent valuation and a
              straightforward next step — usually within 48 hours.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> No obligation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Any make or model
              </li>
            </ul>
          </div>

          {/* Right — form */}
          <Card>
            <CardContent className="pt-4">
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <Field label="Full name" error={errors.name?.message}>
                  <Input placeholder="Alex Morgan" autoComplete="name" {...register('name')} />
                </Field>

                <Field label="Email address (optional)" error={errors.email?.message}>
                  <Input type="email" placeholder="alex@company.com" autoComplete="email" {...register('email')} />
                </Field>

                <Field label="Phone number" error={errors.phone?.message}>
                  <Input inputMode="numeric" placeholder="98765 43210" autoComplete="tel" {...register('phone')} />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Vehicle make" error={errors.brandName?.message}>
                    {brandsLoading ? (
                      <div className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-input/20 px-3 text-sm text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading makes…
                      </div>
                    ) : (
                      <Combobox
                        value={values.brandName}
                        onChange={(v) => {
                          setValue('brandName', v, { shouldValidate: true });
                          const b = brandOptions.find((x) => x.name === v);
                          setValue('brand', b?.id || '');
                        }}
                        options={brandOptions.map((b) => ({ value: b.name, label: b.name }))}
                        placeholder="Select make"
                        searchPlaceholder="Search make…"
                        emptyText="No make found."
                      />
                    )}
                  </Field>

                  <Field label="Model" error={errors.model?.message}>
                    <Input placeholder="e.g. Ford Transit" {...register('model')} />
                  </Field>

                  <Field label="Year" error={errors.manufacturingYear?.message}>
                    <Input type="number" inputMode="numeric" placeholder="2021" {...register('manufacturingYear')} />
                  </Field>

                  <Field label="Mileage (km)" error={errors.kmDriven?.message}>
                    <Input type="number" inputMode="numeric" placeholder="62,000" {...register('kmDriven')} />
                  </Field>
                </div>

                <Field label="Vehicle condition" error={errors.condition?.message}>
                  <Select
                    value={values.condition || undefined}
                    onValueChange={(v) => setValue('condition', v, { shouldValidate: true })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_CONDITIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Anything else we should know? (optional)">
                  <Textarea
                    rows={4}
                    placeholder="Service history, modifications, accessories…"
                    {...register('description')}
                  />
                </Field>

                <Field label="Add photos (optional)">
                  <MediaUpload
                    items={images}
                    onChange={setImages}
                    max={6}
                    tags={['FRONT', 'BACK', 'SIDES', 'INTERIOR', 'ODOMETER', 'ENGINE', 'TYRES', 'RC_COPY']}
                    label="Add photo"
                  />
                </Field>

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting
                    ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Submitting…</>
                    : <><Sparkles className="mr-1 h-4 w-4" /> Get my valuation</>}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By submitting you agree to be contacted about your vehicle. No obligation to sell.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

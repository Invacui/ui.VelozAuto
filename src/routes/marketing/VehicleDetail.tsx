import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Heart, Share2, MapPin, Gauge, Fuel, Calendar, Cog, User, ShieldCheck,
  Phone, MessageSquare, CheckCircle2, Info, Scale, Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/common/SEO';
import { EmptyState } from '@/components/common/EmptyState';
import { VehicleGallery } from '@/components/vehicle/VehicleGallery';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { BuyRequestModal } from '@/components/vehicle/BuyRequestModal';
import { EmiCalculator } from '@/components/vehicle/EmiCalculator';
import { getBySlug, getSimilar } from '@/services/vehicle.service';
import { addToWishlist, removeFromWishlist, getWishlist } from '@/services/wishlist.service';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { SITE_URL } from '@/lib/seo';
import { CATEGORY_LABELS } from '@/constants/vehicleEnums';
import {
  cn, formatCurrency, formatINRCompact, formatKm, maskRegNumber, titleCase,
} from '@/lib/utils';
import type { Vehicle } from '@/types/vehicle.types';

export default function VehicleDetail() {
  const { slug = '' } = useParams();
  const { isAuthenticated } = useAuth();
  const qc = useQueryClient();
  const [buyOpen, setBuyOpen] = useState(false);

  const { data: vehicle, isLoading, isError } = useQuery({
    queryKey: queryKeys.vehicles.slug(slug),
    queryFn: () => getBySlug(slug),
    enabled: !!slug,
  });

  const { data: similar } = useQuery({
    queryKey: queryKeys.vehicles.similar(vehicle?.id || ''),
    queryFn: () => getSimilar(vehicle!.id),
    enabled: !!vehicle?.id,
  });

  const { data: wishlist } = useQuery({
    queryKey: queryKeys.wishlist.list(),
    queryFn: () => getWishlist({ limit: 100 }),
    enabled: isAuthenticated,
  });
  const isWishlisted = !!wishlist?.data?.some((v) => v.id === vehicle?.id);

  const wishlistMutation = useMutation({
    mutationFn: async () => {
      if (!vehicle) return;
      if (isWishlisted) await removeFromWishlist(vehicle.id);
      else await addToWishlist(vehicle.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wishlist.list() });
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    },
    onError: () => toast.error('Please log in to use your wishlist'),
  });

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Skeleton className="aspect-[4/3] rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !vehicle) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          title="Vehicle not found"
          description="This listing may have been sold or removed."
          action={<Button asChild><Link to={ROUTES.vehicles}>Browse vehicles</Link></Button>}
        />
      </div>
    );
  }

  const v = vehicle;
  const title = `${v.manufacturingYear} ${v.brandName} ${v.model}${v.variant ? ` ${v.variant}` : ''}`;
  const location = [v.locationCity, v.locationState].filter(Boolean).join(', ');

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  const specGroups: { title: string; rows: [string, string | number | null | undefined][] }[] = [
    {
      title: 'Core details',
      rows: [
        ['Category', CATEGORY_LABELS[v.category] || titleCase(v.category)],
        ['Usage type', titleCase(v.usageType)],
        ['Sub-category', v.subCategory ? titleCase(v.subCategory) : undefined],
        ['Body type', v.bodyType ? titleCase(v.bodyType) : undefined],
        ['Brand', v.brandName],
        ['Model', v.model],
        ['Variant', v.variant],
        ['Manufactured', v.manufacturingYear],
        ['Colour', v.color],
        ['Seats', v.seats],
        ['Number of keys', v.numberOfKeys],
      ],
    },
    {
      title: 'Powertrain & performance',
      rows: [
        ['Fuel type', titleCase(v.fuelType)],
        ['Transmission', titleCase(v.transmission)],
        ['BS norm', v.bsNorm ? titleCase(v.bsNorm) : undefined],
        ['Engine capacity', v.engineCapacityCc ? `${v.engineCapacityCc} cc` : undefined],
        ['Power', v.powerBhp ? `${v.powerBhp} bhp` : undefined],
        ['Torque', v.torqueNm ? `${v.torqueNm} Nm` : undefined],
        ['Mileage', v.mileageKmpl ? `${v.mileageKmpl} kmpl` : undefined],
        ['Battery capacity', v.batteryCapacityKwh ? `${v.batteryCapacityKwh} kWh` : undefined],
        ['Range', v.rangeKm ? `${v.rangeKm} km` : undefined],
        ['KM driven', formatKm(v.kmDriven)],
        ['Owners', v.ownerCount ? titleCase(v.ownerCount) : undefined],
      ],
    },
    {
      title: 'Registration & legal',
      rows: [
        ['Registration no.', maskRegNumber(v.registrationNumber)],
        ['Registered state', v.registrationState],
        ['RTO code', v.rtoCode],
        ['Registration city', v.registrationCity],
        ['Registration type', v.registrationType ? titleCase(v.registrationType) : undefined],
        ['RC available', v.rcAvailable ? 'Yes' : 'No'],
        ['RC type', v.rcType ? titleCase(v.rcType) : undefined],
        ['Ownership transfer', v.ownershipTransferStatus ? titleCase(v.ownershipTransferStatus) : undefined],
        ['Road tax', v.roadTax ? titleCase(v.roadTax) : undefined],
        ['Road tax valid till', v.roadTaxValidTill],
        ['Permit type', v.permitType ? titleCase(v.permitType) : undefined],
        ['FASTag', v.fastagInstalled ? 'Installed' : 'Not installed'],
      ],
    },
    {
      title: 'Condition & history',
      rows: [
        ['Accident history', v.accidentHistory ? titleCase(v.accidentHistory) : undefined],
        ['Flood damaged', v.floodDamage ? 'Yes' : 'No'],
        ['Service history', v.serviceHistoryAvailable ? 'Available' : 'Not available'],
        ['Last service', v.lastServiceDate],
        ['Tyre condition', v.tyreCondition ? titleCase(v.tyreCondition) : undefined],
        ['Modifications', v.modifications],
        ['Inspection score', v.inspectionScore != null ? `${v.inspectionScore}/100` : undefined],
        ['Warranty', v.warrantyMonths ? `${v.warrantyMonths} months / ${formatKm(v.warrantyKm)}` : undefined],
      ],
    },
  ];

  if (v.category === 'COMMERCIAL' || v.usageType === 'COMMERCIAL') {
    specGroups.push({
      title: 'Commercial specifications',
      rows: [
        ['GVW', v.grossVehicleWeightKg ? `${v.grossVehicleWeightKg} kg` : undefined],
        ['Payload capacity', v.payloadCapacityKg ? `${v.payloadCapacityKg} kg` : undefined],
        ['Unladen weight', v.unladenWeightKg ? `${v.unladenWeightKg} kg` : undefined],
        ['Axle configuration', v.axleConfiguration ? titleCase(v.axleConfiguration) : undefined],
        ['Tyres', v.numberOfTyres],
        ['Wheelbase', v.wheelbaseMm ? `${v.wheelbaseMm} mm` : undefined],
        ['Body length', v.bodyLengthFt ? `${v.bodyLengthFt} ft` : undefined],
        ['Cabin type', v.cabinType ? titleCase(v.cabinType) : undefined],
        ['Fuel tank', v.tankCapacityLitres ? `${v.tankCapacityLitres} L` : undefined],
        ['Seating capacity', v.seatingCapacity],
        ['AC', v.hasAc ? 'Yes' : 'No'],
        ['GPS / telematics', v.hasGpsTelematics ? 'Yes' : 'No'],
      ],
    });
  }

  if (v.category === 'CARAVAN_MOTORHOME') {
    specGroups.push({
      title: 'Caravan / motorhome',
      rows: [
        ['Sleeping capacity', v.sleepingCapacity],
        ['Kitchenette', v.hasKitchenette ? 'Yes' : 'No'],
        ['Toilet', v.hasToilet ? 'Yes' : 'No'],
        ['Generator', v.hasGenerator ? 'Yes' : 'No'],
        ['Water tank', v.waterTankLitres ? `${v.waterTankLitres} L` : undefined],
        ['Solar panel', v.solarPanel ? 'Yes' : 'No'],
        ['Awning', v.awning ? 'Yes' : 'No'],
        ['Build type', v.buildType ? titleCase(v.buildType) : undefined],
        ['RTO modification', v.rtoModificationApproved ? 'Approved' : 'Not approved'],
        ['Dimensions', [v.lengthFt, v.widthFt, v.heightFt].every(Boolean) ? `${v.lengthFt} × ${v.widthFt} × ${v.heightFt} ft` : undefined],
      ],
    });
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    image: v.images?.map((i) => i.url),
    description: v.description || `${title} for sale`,
    brand: { '@type': 'Brand', name: v.brandName },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: v.price,
      availability: v.status === 'SOLD' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      url: `${SITE_URL}${ROUTES.vehicleDetail(v.slug)}`,
    },
  };

  return (
    <>
      <SEO title={title} description={v.description || `${title} — ${formatINRCompact(v.price)}`} image={v.images?.[0]?.url} type="product" jsonLd={productJsonLd} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="text-xs text-muted-foreground">
          <Link to={ROUTES.home} className="hover:text-foreground">Home</Link> /{' '}
          <Link to={ROUTES.vehicles} className="hover:text-foreground">Vehicles</Link> /{' '}
          <span className="text-foreground">{title}</span>
        </nav>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_22rem]">
          {/* Left column */}
          <div className="space-y-6">
            <VehicleGallery images={v.images ?? []} title={title} />

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{CATEGORY_LABELS[v.category] || titleCase(v.category)}</Badge>
              {v.isInspected && <Badge variant="success"><ShieldCheck className="h-3 w-3" /> Inspected</Badge>}
              {v.isFeatured && <Badge>Featured</Badge>}
              <Badge variant="secondary">{titleCase(v.status)}</Badge>
            </div>

            <Card>
              <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { icon: Calendar, label: 'Year', value: v.manufacturingYear },
                  { icon: Gauge, label: 'KM driven', value: formatKm(v.kmDriven) },
                  { icon: Fuel, label: 'Fuel', value: titleCase(v.fuelType) },
                  { icon: Cog, label: 'Transmission', value: titleCase(v.transmission) },
                  { icon: User, label: 'Owners', value: v.ownerCount ? titleCase(v.ownerCount) : '—' },
                  { icon: Star, label: 'Colour', value: v.color || '—' },
                  { icon: MapPin, label: 'Location', value: location || '—' },
                  { icon: Scale, label: 'Body type', value: v.bodyType ? titleCase(v.bodyType) : '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
                      <p className="truncate text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {v.highlights && v.highlights.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Highlights</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {v.highlights.map((h) => (
                    <span key={h} className="rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">{h}</span>
                  ))}
                </CardContent>
              </Card>
            )}

            {v.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{v.description}</p>
                </CardContent>
              </Card>
            )}

            {specGroups.map((group) => (
              <Card key={group.title}>
                <CardHeader><CardTitle>{group.title}</CardTitle></CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                    {group.rows
                      .filter(([, val]) => val !== undefined && val !== null && val !== '' && val !== '—')
                      .map(([label, val]) => (
                        <div key={label} className="flex justify-between gap-4 border-b border-dashed py-1.5 text-sm last:border-0">
                          <dt className="text-muted-foreground">{label}</dt>
                          <dd className="text-right font-medium">{String(val)}</dd>
                        </div>
                      ))}
                  </dl>
                </CardContent>
              </Card>
            ))}

            {v.features && v.features.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Features</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {v.features.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-green-600" /> {f}
                    </span>
                  ))}
                </CardContent>
              </Card>
            )}

            <p className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              For your privacy and security, sensitive details like the full registration number,
              chassis/engine numbers and inspection reports are shared only after a request is
              confirmed with our team.
            </p>
          </div>

          {/* Right column (sticky) */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-2xl font-bold">{formatINRCompact(v.price)}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(v.price)}</p>
                  {v.isPriceNegotiable && <Badge variant="success" className="mt-1">Price negotiable</Badge>}
                </div>
                {v.emiStartingFrom && (
                  <p className="text-sm text-muted-foreground">
                    EMI from <span className="font-semibold text-foreground">{formatCurrency(v.emiStartingFrom)}/mo</span>
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  <Button size="lg" className="h-11" onClick={() => setBuyOpen(true)}>
                    <MessageSquare className="mr-1 h-4 w-4" /> Enquire / Buy request
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => wishlistMutation.mutate()}>
                      <Heart className={cn('mr-1 h-4 w-4', isWishlisted && 'fill-primary text-primary')} />
                      {isWishlisted ? 'Saved' : 'Save'}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={share}>
                      <Share2 className="mr-1 h-4 w-4" /> Share
                    </Button>
                  </div>
                </div>
                {v.locationCity && (
                  <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {location}
                  </p>
                )}
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> Request a callback from our team
                </p>
              </CardContent>
            </Card>

            <EmiCalculator defaultPrice={v.price} compact />
          </div>
        </div>

        {/* Similar */}
        {(similar ?? []).length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold">Similar vehicles</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(similar ?? []).slice(0, 4).map((s) => <VehicleCard key={s.id} vehicle={s} />)}
            </div>
          </section>
        )}
      </div>

      <BuyRequestModal open={buyOpen} onOpenChange={setBuyOpen} vehicle={v} />
    </>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Car, IndianRupee, Phone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/common/SEO';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { getMySellRequests, trackSellRequests } from '@/services/sellRequest.service';
import { queryKeys } from '@/lib/queryKeys';
import {
  SELL_REQUEST_STATUS_LABELS, SELL_REQUEST_STATUS_TONE, SELL_REQUEST_STATUS_FLOW,
} from '@/constants/statusMaps';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { SellRequest } from '@/types/sellRequest.types';

export default function SellRequests() {
  const { isAuthenticated } = useAuth();
  const [phone, setPhone] = useState('');
  const [trackPhone, setTrackPhone] = useState('');

  const mineQuery = useQuery({
    queryKey: queryKeys.sellRequests.mine({ limit: 20 }),
    queryFn: () => getMySellRequests({ limit: 20 }),
    enabled: isAuthenticated,
  });

  const trackQuery = useQuery({
    queryKey: queryKeys.sellRequests.track(trackPhone),
    queryFn: () => trackSellRequests(trackPhone, { limit: 20 }),
    enabled: !isAuthenticated && trackPhone.length === 10,
  });

  const items = isAuthenticated ? mineQuery.data?.data ?? [] : trackQuery.data?.data ?? [];
  const loading = isAuthenticated ? mineQuery.isLoading : trackQuery.isFetching;

  return (
    <>
      <SEO title="My sell requests" noindex />
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">My sell requests</h1>
            <p className="text-sm text-muted-foreground">Follow your vehicle through inspection to offer.</p>
          </div>
          <Button asChild><Link to={ROUTES.sell}>Sell a vehicle</Link></Button>
        </div>

        {!isAuthenticated && (
          <Card>
            <CardContent className="space-y-3">
              <p className="text-sm">
                <Phone className="mr-1 inline h-4 w-4 text-primary" />
                Submitted as a guest? Enter the mobile number you used to track your requests.
              </p>
              <form
                className="flex items-end gap-2"
                onSubmit={(e) => { e.preventDefault(); setTrackPhone(phone.trim()); }}
              >
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">Mobile number</Label>
                  <Input inputMode="numeric" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
                </div>
                <Button type="submit" disabled={phone.length !== 10}><Search className="mr-1 h-4 w-4" /> Track</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Car className="h-6 w-6 text-muted-foreground" />}
            title={trackPhone ? 'No requests found' : 'No sell requests yet'}
            description={trackPhone ? 'We couldn’t find any requests for that number.' : 'Get a free inspection and a fair instant offer.'}
            action={!trackPhone ? <Button asChild><Link to={ROUTES.sell}>Sell your vehicle</Link></Button> : undefined}
          />
        ) : (
          <div className="space-y-4">
            {items.map((r) => <SellRequestCard key={r._id || r.id} request={r} />)}
          </div>
        )}
      </div>
    </>
  );
}

function SellRequestCard({ request: r }: { request: SellRequest }) {
  const currentIdx = SELL_REQUEST_STATUS_FLOW.indexOf(r.status);
  const rejected = r.status === 'REJECTED';
  const tone = SELL_REQUEST_STATUS_TONE[r.status];

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">
              {r.manufacturingYear} {r.brandName || (typeof r.brand === 'object' && r.brand ? r.brand.name : '')} {r.model}
            </p>
            <p className="text-xs text-muted-foreground">
              Requested {formatDate(r.createdAt)} · Expected {formatCurrency(r.expectedPrice)}
            </p>
          </div>
          <span className={cn(
            'rounded-full border px-2.5 py-0.5 text-xs font-medium',
            tone === 'success' && 'border-green-200 bg-green-100 text-green-700',
            tone === 'danger' && 'border-red-200 bg-red-100 text-red-700',
            tone === 'warning' && 'border-amber-200 bg-amber-100 text-amber-700',
            tone === 'info' && 'border-blue-200 bg-blue-100 text-blue-700',
            tone === 'default' && 'bg-muted text-muted-foreground',
          )}>
            {SELL_REQUEST_STATUS_LABELS[r.status]}
          </span>
        </div>

        {r.status === 'OFFER_MADE' && r.offerPrice != null && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-3">
            <IndianRupee className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Our offer</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(r.offerPrice)}</p>
            </div>
          </div>
        )}

        {rejected && r.rejectionReason && (
          <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{r.rejectionReason}</p>
        )}

        {/* Pipeline */}
        {!rejected && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {SELL_REQUEST_STATUS_FLOW.map((status, i) => {
              const done = i <= currentIdx;
              return (
                <div key={status} className="flex shrink-0 items-center gap-1">
                  <div className="flex flex-col items-center gap-1">
                    <span className={cn(
                      'h-2.5 w-2.5 rounded-full',
                      done ? 'bg-primary' : 'bg-muted',
                    )} />
                    <span className={cn('whitespace-nowrap text-[10px]', done ? 'text-foreground' : 'text-muted-foreground')}>
                      {SELL_REQUEST_STATUS_LABELS[status]}
                    </span>
                  </div>
                  {i < SELL_REQUEST_STATUS_FLOW.length - 1 && (
                    <span className={cn('mb-4 h-px w-6', i < currentIdx ? 'bg-primary' : 'bg-muted')} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {r.inspectionDate && (
          <p className="text-xs text-muted-foreground">Inspection scheduled for {formatDate(r.inspectionDate)}</p>
        )}

        {r.listedVehicle && typeof r.listedVehicle === 'object' && (
          <Button asChild size="sm" variant="outline">
            <Link to={ROUTES.vehicleDetail(r.listedVehicle.slug)}>View listing</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, CheckCircle2, Circle, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SEO } from '@/components/common/SEO';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Pagination } from '@/components/common/Pagination';
import { getMyBuyRequests } from '@/services/buyRequest.service';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/constants/routes';
import {
  BUY_REQUEST_STATUS_LABELS, BUY_REQUEST_STATUS_TONE, BUY_REQUEST_STATUS_FLOW,
} from '@/constants/statusMaps';
import { cn, formatDate, formatDateTime } from '@/lib/utils';
import { getBudgetRangeLabel } from '@/constants/vehicleEnums';
import type { BuyRequest } from '@/types/buyRequest.types';

export default function BuyRequests() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<BuyRequest | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.buyRequests.mine({ page, limit: 10 }),
    queryFn: () => getMyBuyRequests({ page, limit: 10 }),
  });

  const items = data?.data ?? [];

  return (
    <>
      <SEO title="My buy requests" noindex />
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">My buy requests</h1>
            <p className="text-sm text-muted-foreground">Track the status of vehicles you&apos;re interested in.</p>
          </div>
          <Button variant="outline" asChild><Link to={ROUTES.vehicles}>Browse vehicles</Link></Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6 text-muted-foreground" />}
            title="No buy requests yet"
            description="When you enquire about a vehicle, it will appear here."
            action={<Button asChild><Link to={ROUTES.vehicles}>Browse vehicles</Link></Button>}
          />
        ) : (
          <div className="space-y-3">
            {items.map((r) => {
              const v = typeof r.vehicle === 'string' ? null : r.vehicle;
              return (
                <Card key={r._id || r.id}>
                  <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      {v?.primaryImage ? (
                        <img src={v.primaryImage} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Car className="h-5 w-5" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{v?.title || 'Vehicle request'}</p>
                        <p className="text-xs text-muted-foreground">
                          {v ? `${v.manufacturingYear} · ${v.fuelType} · ${v.locationCity || '—'}` : 'Vehicle no longer listed'}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Requested {formatDate(r.createdAt)}
                          {r.budget ? ` · Budget ${getBudgetRangeLabel(r.budget)}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge label={BUY_REQUEST_STATUS_LABELS[r.status]} tone={BUY_REQUEST_STATUS_TONE[r.status]} />
                      <Button size="sm" variant="outline" onClick={() => setSelected(r)}>Details</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {data && data.pagination.totalPages > 1 && (
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={setPage} />
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Buy request details</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Progress</h3>
                  <ol className="space-y-3">
                    {BUY_REQUEST_STATUS_FLOW.map((status) => {
                      const historyEntry = selected.statusHistory?.find((h) => h.to === status);
                      const reached = !!historyEntry || status === selected.status;
                      const isCurrent = status === selected.status;
                      return (
                        <li key={status} className="flex items-start gap-3">
                          {reached ? (
                            <CheckCircle2 className={cn('mt-0.5 h-4 w-4 shrink-0', isCurrent ? 'text-primary' : 'text-green-600')} />
                          ) : (
                            <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                          )}
                          <div>
                            <p className={cn('text-sm', reached ? 'font-medium' : 'text-muted-foreground')}>
                              {BUY_REQUEST_STATUS_LABELS[status]}
                            </p>
                            {historyEntry?.at && <p className="text-xs text-muted-foreground">{formatDateTime(historyEntry.at)}</p>}
                            {historyEntry?.note && <p className="text-xs text-muted-foreground">{historyEntry.note}</p>}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 text-sm">
                  <Detail label="Name" value={selected.name} />
                  <Detail label="Phone" value={selected.phone} />
                  {selected.city && <Detail label="City" value={selected.city} />}
                  {selected.budget && <Detail label="Budget" value={getBudgetRangeLabel(selected.budget)} />}
                  {selected.wantsTestDrive != null && <Detail label="Test drive" value={selected.wantsTestDrive ? 'Requested' : 'Not needed'} />}
                  {selected.needsFinance != null && <Detail label="Finance" value={selected.needsFinance ? 'Needed' : 'Not needed'} />}
                </div>

                {selected.message && (
                  <div className="rounded-lg border p-3 text-sm">
                    <p className="text-xs font-medium text-muted-foreground">Your message</p>
                    <p>{selected.message}</p>
                  </div>
                )}

                {v_slug(selected) && (
                  <Button asChild variant="outline" className="w-full">
                    <Link to={ROUTES.vehicleDetail(v_slug(selected)!)}>View vehicle</Link>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function v_slug(r: BuyRequest): string | null {
  return typeof r.vehicle === 'string' ? null : r.vehicle.slug ?? null;
}

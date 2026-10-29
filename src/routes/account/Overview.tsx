import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Car, Heart, MessagesSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/common/SEO';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { getMyBuyRequests } from '@/services/buyRequest.service';
import { getMySellRequests } from '@/services/sellRequest.service';
import { getWishlist } from '@/services/wishlist.service';
import { getMyTickets } from '@/services/chat.service';
import { queryKeys } from '@/lib/queryKeys';
import { BUY_REQUEST_STATUS_LABELS, BUY_REQUEST_STATUS_TONE, SELL_REQUEST_STATUS_LABELS, SELL_REQUEST_STATUS_TONE } from '@/constants/statusMaps';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/lib/utils';

export default function AccountOverview() {
  const { user } = useAuth();

  const buy = useQuery({ queryKey: queryKeys.buyRequests.mine({ limit: 3 }), queryFn: () => getMyBuyRequests({ limit: 3 }) });
  const sell = useQuery({ queryKey: queryKeys.sellRequests.mine({ limit: 3 }), queryFn: () => getMySellRequests({ limit: 3 }) });
  const wishlist = useQuery({ queryKey: queryKeys.wishlist.list({ limit: 1 }), queryFn: () => getWishlist({ limit: 1 }) });
  const tickets = useQuery({ queryKey: queryKeys.chat.mine({ limit: 1 }), queryFn: () => getMyTickets({ limit: 1 }) });

  const stats = [
    { label: 'Buy requests', value: buy.data?.pagination.totalItems ?? 0, icon: ShoppingBag, to: ROUTES.account.buyRequests },
    { label: 'Sell requests', value: sell.data?.pagination.totalItems ?? 0, icon: Car, to: ROUTES.account.sellRequests },
    { label: 'Wishlist', value: wishlist.data?.pagination.totalItems ?? 0, icon: Heart, to: ROUTES.wishlist },
    { label: 'Chats', value: tickets.data?.pagination.totalItems ?? 0, icon: MessagesSquare, to: ROUTES.account.chats },
  ];

  return (
    <>
      <SEO title="My account" noindex />
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Hi {user?.name?.split(' ')[0]}, welcome back</h1>
          <p className="text-sm text-muted-foreground">Track your buy and sell requests, saved vehicles and chats.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, to }) => (
            <Link key={label} to={to}>
              <Card className="transition-colors hover:border-primary">
                <CardContent className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Recent buy requests</h2>
                <Button variant="ghost" size="sm" asChild><Link to={ROUTES.account.buyRequests}>View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
              </div>
              {buy.isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (buy.data?.data ?? []).length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">No buy requests yet. <Link to={ROUTES.vehicles} className="text-primary hover:underline">Browse vehicles</Link></p>
              ) : (
                <ul className="divide-y">
                  {(buy.data?.data ?? []).map((r) => {
                    const v = typeof r.vehicle === 'string' ? null : r.vehicle;
                    return (
                      <li key={r._id || r.id} className="flex items-center justify-between gap-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{v?.title || 'Vehicle request'}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                        </div>
                        <StatusBadge label={BUY_REQUEST_STATUS_LABELS[r.status]} tone={BUY_REQUEST_STATUS_TONE[r.status]} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Recent sell requests</h2>
                <Button variant="ghost" size="sm" asChild><Link to={ROUTES.account.sellRequests}>View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button>
              </div>
              {sell.isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (sell.data?.data ?? []).length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">No sell requests yet. <Link to={ROUTES.sell} className="text-primary hover:underline">Sell your vehicle</Link></p>
              ) : (
                <ul className="divide-y">
                  {(sell.data?.data ?? []).map((r) => (
                    <li key={r._id || r.id} className="flex items-center justify-between gap-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{r.manufacturingYear} {r.brandName || ''} {r.model}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                      </div>
                      <StatusBadge label={SELL_REQUEST_STATUS_LABELS[r.status]} tone={SELL_REQUEST_STATUS_TONE[r.status]} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

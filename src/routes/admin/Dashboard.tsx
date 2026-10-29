import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Car, Eye, ShoppingBag, BadgeIndianRupee, Users, MessagesSquare, IndianRupee, TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/common/SEO';
import { StatCard } from '@/components/admin/StatCard';
import { Chart } from '@/components/admin/Chart';
import { getDashboard } from '@/services/admin.service';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/constants/routes';
import { CATEGORY_LABELS } from '@/constants/vehicleEnums';
import { useAuth } from '@/hooks/useAuth';
import { formatINRCompact, relativeTime } from '@/lib/utils';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: queryKeys.admin.dashboard(), queryFn: getDashboard });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const { vehicles, requests, users, chats, growth, activity } = data;

  const categoryEntries = Object.entries(vehicles.byCategory || {});
  const categorySeries = categoryEntries.map(([, v]) => v);
  const categoryLabels = categoryEntries.map(([k]) => CATEGORY_LABELS[k] || k);

  return (
    <>
      <SEO title="Admin dashboard" noindex />
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your marketplace activity.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total vehicles" value={vehicles.total} icon={Car} hint={`${vehicles.active} active · ${vehicles.sold} sold`} />
          <StatCard label="Total views" value={vehicles.totalViews.toLocaleString('en-IN')} icon={Eye} tone="default" />
          <StatCard label="Avg. price" value={formatINRCompact(vehicles.avgPrice)} icon={IndianRupee} tone="success" />
          {isAdmin && (
            <>
              <StatCard label="New buy requests" value={requests.buyNew} icon={ShoppingBag} tone="warning" hint={`${requests.buyThisWeek} this week`} />
              <StatCard label="Pending sell requests" value={requests.sellPending} icon={BadgeIndianRupee} tone="warning" hint={`${requests.sellThisWeek} this week`} />
              <StatCard label="Users" value={users.total} icon={Users} tone="default" hint={`+${users.thisWeek} this week`} />
              <StatCard label="Open chats" value={chats.open} icon={MessagesSquare} tone="danger" />
            </>
          )}
          <StatCard label="Draft listings" value={vehicles.draft} icon={Car} tone="default" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="size-4" /> Weekly activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Chart
                type="bar"
                height={260}
                series={[{
                  name: 'This week',
                  data: [
                    growth?.vehiclesThisWeek ?? 0,
                    growth?.buyThisWeek ?? 0,
                    growth?.sellThisWeek ?? 0,
                    growth?.usersThisWeek ?? 0,
                  ],
                }]}
                options={{
                  chart: { toolbar: { show: false } },
                  plotOptions: { bar: { borderRadius: 4, columnWidth: '45%' } },
                  colors: ['hsl(var(--primary))'],
                  xaxis: { categories: ['Vehicles', 'Buy requests', 'Sell requests', 'New users'] },
                  dataLabels: { enabled: false },
                  grid: { strokeDashArray: 4 },
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Listings by category</CardTitle></CardHeader>
            <CardContent>
              {categorySeries.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No data yet.</p>
              ) : (
                <Chart
                  type="donut"
                  height={260}
                  series={categorySeries}
                  options={{
                    labels: categoryLabels,
                    legend: { position: 'bottom' },
                    dataLabels: { enabled: true },
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Recent activity</CardTitle></CardHeader>
          <CardContent>
            {!activity || activity.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <ul className="divide-y">
                {activity.map((a) => {
                  const to = a.type === 'BUY_REQUEST' ? ROUTES.admin.buyRequests : ROUTES.admin.sellRequests;
                  return (
                    <li key={`${a.type}-${a.id}`} className="flex items-center justify-between gap-3 py-2.5">
                      <Link to={to} className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{a.title}</p>
                        {a.subtitle && <p className="truncate text-xs text-muted-foreground">{a.subtitle}</p>}
                      </Link>
                      <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(a.at)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

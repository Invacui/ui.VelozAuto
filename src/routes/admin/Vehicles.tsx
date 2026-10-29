import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SEO } from '@/components/common/SEO';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { listAllVehicles, updateVehicleStatus, deleteVehicle } from '@/services/vehicle.service';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/constants/routes';
import { VEHICLE_CATEGORIES, VEHICLE_STATUSES, CATEGORY_LABELS } from '@/constants/vehicleEnums';
import { formatINRCompact, formatKm, formatDate, getApiErrorMessage, titleCase } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import type { VehicleCard, VehicleStatus } from '@/types/vehicle.types';

export default function AdminVehicles() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('__all__');
  const [category, setCategory] = useState<string>('__all__');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<VehicleCard | null>(null);
  const debouncedQ = useDebounce(q, 350);

  const params = {
    page,
    limit: 15,
    q: debouncedQ || undefined,
    status: status === '__all__' ? undefined : status,
    category: category === '__all__' ? undefined : category,
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.vehicles.adminAll(params),
    queryFn: () => listAllVehicles(params),
  });

  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ id, s }: { id: string; s: VehicleStatus }) => updateVehicleStatus(id, s),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['vehicles', 'admin'] }); },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not update status')),
  });

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    onSuccess: () => { toast.success('Vehicle deleted'); setToDelete(null); qc.invalidateQueries({ queryKey: ['vehicles', 'admin'] }); },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete vehicle')),
  });

  const columns: Column<VehicleCard>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (v) => {
        const thumb =
          v.primaryImage || v.images?.find((i) => i.isPrimary)?.url || v.images?.[0]?.url || null;
        return (
          <div className="flex items-center gap-3">
            {thumb ? (
              <img src={thumb} alt="" className="h-10 w-14 shrink-0 rounded object-cover" />
            ) : (
              <span className="h-10 w-14 shrink-0 rounded bg-muted" />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {v.title || [v.brandName, v.model, v.variant].filter(Boolean).join(' ')}
              </p>
              <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[v.category] || titleCase(v.category)}</p>
            </div>
          </div>
        );
      },
    },
    { key: 'price', header: 'Price', render: (v) => <span className="font-medium">{formatINRCompact(v.price)}</span> },
    { key: 'km', header: 'KM', render: (v) => formatKm(v.kmDriven) },
    { key: 'year', header: 'Year', render: (v) => v.manufacturingYear },
    { key: 'city', header: 'City', render: (v) => v.locationCity || '—' },
    {
      key: 'postedBy',
      header: 'Posted by',
      render: (v) =>
        v.postedBy ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{v.postedBy.companyName || v.postedBy.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {v.postedBy.companyName ? v.postedBy.name : v.postedBy.email}
            </p>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: 'views', header: 'Views', render: (v) => v.views ?? 0 },
    {
      key: 'status',
      header: 'Status',
      render: (v) => (
        <Select value={v.status} onValueChange={(s) => changeStatus({ id: v.id, s: s as VehicleStatus })}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            {VEHICLE_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      ),
    },
    { key: 'created', header: 'Added', render: (v) => formatDate(v.createdAt) },
    {
      key: 'actions',
      header: '',
      render: (v) => (
        <div className="flex items-center gap-1">
          <Button size="icon-sm" variant="ghost" asChild aria-label="View">
            <Link to={ROUTES.vehicleDetail(v.slug)} target="_blank"><ExternalLink className="size-3.5" /></Link>
          </Button>
          <Button size="icon-sm" variant="ghost" aria-label="Edit" onClick={() => navigate(ROUTES.admin.vehicleEdit(v.id))}>
            <Pencil className="size-3.5" />
          </Button>
          <Button size="icon-sm" variant="ghost" aria-label="Delete" onClick={() => setToDelete(v)}>
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <SEO title="Vehicles" noindex />
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Vehicles</h1>
            <p className="text-sm text-muted-foreground">Manage your vehicle listings.</p>
          </div>
          <Button asChild><Link to={ROUTES.admin.vehicleNew}><Plus className="mr-1 h-4 w-4" /> Add vehicle</Link></Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search vehicles…" className="h-8 w-56 pl-8" />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All statuses</SelectItem>
              {VEHICLE_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-44"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All categories</SelectItem>
              {VEHICLE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          rows={data?.data ?? []}
          rowKey={(v) => v.id}
          loading={isLoading}
          empty="No vehicles match your filters."
        />

        {data && data.pagination.totalPages > 1 && (
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={setPage} />
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete this vehicle?"
        description={`“${toDelete?.title}” will be removed from the marketplace. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={() => toDelete && remove(toDelete.id)}
      />
    </>
  );
}

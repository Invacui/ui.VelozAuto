import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, Phone, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { SEO } from '@/components/common/SEO';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { listBuyRequests, updateBuyRequest } from '@/services/buyRequest.service';
import { listUsers } from '@/services/admin.service';
import { queryKeys } from '@/lib/queryKeys';
import {
  BUY_REQUEST_STATUS_LABELS, BUY_REQUEST_STATUS_TONE, BUY_REQUEST_STATUS_FLOW,
} from '@/constants/statusMaps';
import { formatDateTime, getApiErrorMessage } from '@/lib/utils';
import { getBudgetRangeLabel } from '@/constants/vehicleEnums';
import { useDebounce } from '@/hooks/useDebounce';
import type { BuyRequest, BuyRequestStatus } from '@/types/buyRequest.types';

const assigneeName = (a: BuyRequest['assignedTo']): string =>
  a && typeof a === 'object' ? a.name : '';

export default function AdminBuyRequests() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('__all__');
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<BuyRequest | null>(null);
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState<BuyRequestStatus | '__none__'>('__none__');
  const [assignTo, setAssignTo] = useState<string>('__none__');
  const debouncedQ = useDebounce(q, 350);

  const params = {
    page,
    limit: 15,
    q: debouncedQ || undefined,
    status: status === '__all__' ? undefined : status,
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.buyRequests.list(params),
    queryFn: () => listBuyRequests(params),
  });

  const { data: staff } = useQuery({
    queryKey: queryKeys.admin.users({ limit: 100 }),
    queryFn: () => listUsers({ limit: 100 }),
  });
  const staffList = (staff?.data ?? []).filter((u) => u.role === 'EMPLOYEE' || u.role === 'ADMIN');

  const open = (r: BuyRequest) => {
    setActive(r);
    setNewStatus('__none__');
    setAssignTo(typeof r.assignedTo === 'object' && r.assignedTo ? r.assignedTo.id : '__none__');
    setNote('');
  };

  const { mutate: save, isPending } = useMutation({
    mutationFn: (payload: any) => updateBuyRequest(active!.id || active!._id, payload),
    onSuccess: (updated) => {
      toast.success('Buy request updated');
      qc.invalidateQueries({ queryKey: ['buyRequests', 'list'] });
      setActive(updated);
      setNote('');
      setNewStatus('__none__');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not update the request')),
  });

  const apply = () => {
    const payload: any = {};
    if (newStatus !== '__none__') payload.status = newStatus;
    if (assignTo !== '__none__') payload.assignedTo = assignTo === '__unassign__' ? null : assignTo;
    if (note.trim()) payload.note = note.trim();
    if (Object.keys(payload).length === 0) { toast.error('Nothing to update'); return; }
    save(payload);
  };

  const columns: Column<BuyRequest>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: (r) => (
        <div>
          <p className="text-sm font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.phone}</p>
        </div>
      ),
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (r) => (
        <span className="text-sm">{(r.vehicle && typeof r.vehicle === 'object' && (r.vehicle as any).title) || '—'}</span>
      ),
    },
    { key: 'city', header: 'City', render: (r) => r.city || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge label={BUY_REQUEST_STATUS_LABELS[r.status]} tone={BUY_REQUEST_STATUS_TONE[r.status]} />,
    },
    { key: 'assigned', header: 'Assigned', render: (r) => assigneeName(r.assignedTo) || <span className="text-muted-foreground">Unassigned</span> },
    { key: 'created', header: 'Received', render: (r) => formatDateTime(r.createdAt) },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <Button size="icon-sm" variant="ghost" aria-label="View" onClick={() => open(r)}>
          <Eye className="size-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <SEO title="Buy requests" noindex />
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold">Buy requests</h1>
          <p className="text-sm text-muted-foreground">Leads from customers interested in a listed vehicle.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name or phone…" className="h-8 w-60 pl-8" />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-48"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All statuses</SelectItem>
              {BUY_REQUEST_STATUS_FLOW.map((s) => <SelectItem key={s} value={s}>{BUY_REQUEST_STATUS_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          rows={data?.data ?? []}
          rowKey={(r) => r.id || r._id}
          loading={isLoading}
          empty="No buy requests match your filters."
        />

        {data && data.pagination.totalPages > 1 && (
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={setPage} />
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Buy request
                  <StatusBadge label={BUY_REQUEST_STATUS_LABELS[active.status]} tone={BUY_REQUEST_STATUS_TONE[active.status]} />
                </DialogTitle>
                <DialogDescription>Received {formatDateTime(active.createdAt)}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p className="flex items-center gap-2"><Phone className="size-3.5 text-muted-foreground" /> {active.phone}</p>
                {active.email && <p className="flex items-center gap-2"><Mail className="size-3.5 text-muted-foreground" /> {active.email}</p>}
                {active.city && <p>City: {active.city}</p>}
                {active.budget && <p>Budget: {getBudgetRangeLabel(active.budget)}</p>}
                {active.wantsTestDrive && <p className="flex items-center gap-2"><Calendar className="size-3.5 text-muted-foreground" /> Test drive requested{active.testDriveDate ? ` · ${active.testDriveDate}` : ''}</p>}
                {active.needsFinance && <p>Needs finance: Yes</p>}
                {active.hasExchangeVehicle && <p>Exchange: {active.exchangeDetails || 'Yes'}</p>}
              </div>

              {active.message && (
                <div className="rounded-lg border bg-muted/40 p-3 text-sm">{active.message}</div>
              )}

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Update status</Label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Keep current</SelectItem>
                      {BUY_REQUEST_STATUS_FLOW.map((s) => <SelectItem key={s} value={s}>{BUY_REQUEST_STATUS_LABELS[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Assign to</Label>
                  <Select value={assignTo} onValueChange={setAssignTo}>
                    <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Keep current</SelectItem>
                      <SelectItem value="__unassign__">Unassign</SelectItem>
                      {staffList.map((u) => <SelectItem key={u._id} value={u._id}>{u.name} · {u.role}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Add note (internal)</Label>
                <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note visible to staff only…" />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setActive(null)}>Close</Button>
                <Button onClick={apply} disabled={isPending}>Save changes</Button>
              </div>

              {(active.internalNotes?.length || active.statusHistory?.length) ? (
                <div className="space-y-3">
                  <Separator />
                  {active.internalNotes && active.internalNotes.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Internal notes</p>
                      <ul className="space-y-2">
                        {active.internalNotes.map((n, i) => (
                          <li key={i} className="rounded-md bg-muted/40 p-2 text-sm">
                            <p>{n.note}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDateTime(n.at)}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {active.statusHistory && active.statusHistory.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Status history</p>
                      <ul className="space-y-1 text-sm">
                        {active.statusHistory.map((h, i) => (
                          <li key={i} className="flex items-center justify-between gap-2">
                            <span>{BUY_REQUEST_STATUS_LABELS[h.to as BuyRequestStatus] || h.to}{h.note ? ` · ${h.note}` : ''}</span>
                            <span className="text-[11px] text-muted-foreground">{formatDateTime(h.at)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

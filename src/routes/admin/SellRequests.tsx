import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, Phone, Mail, ArrowRight, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { listSellRequests, updateSellRequest, convertSellRequest } from '@/services/sellRequest.service';
import { listUsers } from '@/services/admin.service';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/constants/routes';
import {
  SELL_REQUEST_STATUS_LABELS, SELL_REQUEST_STATUS_TONE, SELL_REQUEST_STATUS_FLOW,
} from '@/constants/statusMaps';
import { formatCurrency, formatKm, formatDateTime, getApiErrorMessage, titleCase } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import type { SellRequest, SellRequestStatus, ConvertResult } from '@/types/sellRequest.types';

const assigneeName = (a: SellRequest['assignedTo']): string =>
  a && typeof a === 'object' ? a.name : '';
const brandLabel = (b: SellRequest['brand']): string =>
  b ? (typeof b === 'object' ? b.name : '') : '';

export default function AdminSellRequests() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('__all__');
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<SellRequest | null>(null);
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState<SellRequestStatus | '__none__'>('__none__');
  const [assignTo, setAssignTo] = useState('__none__');
  const [offerPrice, setOfferPrice] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspector, setInspector] = useState('__none__');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showConvert, setShowConvert] = useState(false);
  const [conv, setConv] = useState({ price: '', state: '', city: '', pincode: '', yard: '', featured: false, description: '' });
  const [created, setCreated] = useState<ConvertResult | null>(null);
  const debouncedQ = useDebounce(q, 350);

  const params = {
    page,
    limit: 15,
    q: debouncedQ || undefined,
    status: status === '__all__' ? undefined : status,
  };

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.sellRequests.list(params),
    queryFn: () => listSellRequests(params),
  });

  const { data: staff } = useQuery({
    queryKey: queryKeys.admin.users({ limit: 100 }),
    queryFn: () => listUsers({ limit: 100 }),
  });
  const staffList = (staff?.data ?? []).filter((u) => u.role === 'EMPLOYEE' || u.role === 'ADMIN');

  const open = (r: SellRequest) => {
    setActive(r);
    setNewStatus('__none__');
    setAssignTo(typeof r.assignedTo === 'object' && r.assignedTo ? r.assignedTo.id : '__none__');
    setOfferPrice(r.offerPrice ? String(r.offerPrice) : '');
    setInspectionDate(r.inspectionDate ? r.inspectionDate.slice(0, 10) : '');
    setInspector(typeof r.inspector === 'object' && r.inspector ? r.inspector.id : '__none__');
    setRejectionReason(r.rejectionReason || '');
    setNote('');
    setShowConvert(false);
    setCreated(null);
    setConv({
      price: r.expectedPrice ? String(r.expectedPrice) : '',
      state: r.registrationState || '',
      city: r.city || '',
      pincode: r.pincode || '',
      yard: '',
      featured: false,
      description: r.description || '',
    });
  };

  const { mutate: save, isPending } = useMutation({
    mutationFn: (payload: any) => updateSellRequest(active!.id || active!._id, payload),
    onSuccess: (updated) => {
      toast.success('Sell request updated');
      qc.invalidateQueries({ queryKey: ['sellRequests', 'list'] });
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
    if (offerPrice.trim()) payload.offerPrice = Number(offerPrice);
    if (inspectionDate) payload.inspectionDate = inspectionDate;
    if (inspector !== '__none__') payload.inspector = inspector === '__unassign__' ? null : inspector;
    if (rejectionReason.trim()) payload.rejectionReason = rejectionReason.trim();
    if (note.trim()) payload.note = note.trim();
    if (Object.keys(payload).length === 0) { toast.error('Nothing to update'); return; }
    save(payload);
  };

  const { mutate: doConvert, isPending: converting } = useMutation({
    mutationFn: () => {
      const override: any = {};
      if (conv.price.trim()) override.price = Number(conv.price);
      if (conv.state) override.locationState = conv.state;
      if (conv.city) override.locationCity = conv.city;
      if (conv.pincode) override.locationPincode = conv.pincode;
      if (conv.yard) override.yardName = conv.yard;
      if (conv.description) override.description = conv.description;
      if (conv.featured) override.isFeatured = true;
      return convertSellRequest(active!.id || active!._id, { override });
    },
    onSuccess: (res) => {
      toast.success('Listing created from sell request');
      setCreated(res);
      qc.invalidateQueries({ queryKey: ['sellRequests', 'list'] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not convert to a listing')),
  });

  const columns: Column<SellRequest>[] = [
    {
      key: 'seller',
      header: 'Seller',
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
        <div>
          <p className="text-sm">{[brandLabel(r.brand) || r.brandName, r.model].filter(Boolean).join(' ')}</p>
          <p className="text-xs text-muted-foreground">{titleCase(r.category)} · {r.manufacturingYear} · {formatKm(r.kmDriven)}</p>
        </div>
      ),
    },
    { key: 'expected', header: 'Expected', render: (r) => <span className="font-medium">{formatCurrency(r.expectedPrice)}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge label={SELL_REQUEST_STATUS_LABELS[r.status]} tone={SELL_REQUEST_STATUS_TONE[r.status]} />,
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
      <SEO title="Sell requests" noindex />
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold">Sell requests</h1>
          <p className="text-sm text-muted-foreground">Vehicles submitted by sellers for evaluation and purchase.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name or phone…" className="h-8 w-60 pl-8" />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-52"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All statuses</SelectItem>
              {(Object.keys(SELL_REQUEST_STATUS_LABELS) as SellRequestStatus[]).map((s) => <SelectItem key={s} value={s}>{SELL_REQUEST_STATUS_LABELS[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          rows={data?.data ?? []}
          rowKey={(r) => r.id || r._id}
          loading={isLoading}
          empty="No sell requests match your filters."
        />

        {data && data.pagination.totalPages > 1 && (
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={setPage} />
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {active && !created && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Sell request
                  <StatusBadge label={SELL_REQUEST_STATUS_LABELS[active.status]} tone={SELL_REQUEST_STATUS_TONE[active.status]} />
                </DialogTitle>
                <DialogDescription>Received {formatDateTime(active.createdAt)}</DialogDescription>
              </DialogHeader>

              {!showConvert ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border p-3">
                      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Vehicle</p>
                      <p className="text-sm font-medium">{[brandLabel(active.brand) || active.brandName, active.model, active.variant].filter(Boolean).join(' ')}</p>
                      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span>{titleCase(active.category)}</span>
                        <span>{titleCase(active.usageType)}</span>
                        <span>{active.manufacturingYear}</span>
                        <span>{formatKm(active.kmDriven)}</span>
                        <span>{titleCase(active.fuelType)}</span>
                        <span>{titleCase(active.transmission)}</span>
                        <span>{titleCase(active.registrationState)}</span>
                        <span>{active.registrationNumber || 'No reg.'}</span>
                        <span>Insurance: {titleCase(active.insuranceType)}</span>
                        <span>Loan: {titleCase(active.loanStatus)}</span>
                        <span>Accident: {titleCase(active.accidentHistory)}</span>
                        <span>Tyres: {titleCase(active.tyreCondition)}</span>
                        <span>Condition: {titleCase(active.condition)}</span>
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Seller</p>
                      <p className="flex items-center gap-2 text-sm"><Phone className="size-3.5 text-muted-foreground" /> {active.phone}</p>
                      {active.email && <p className="flex items-center gap-2 text-sm"><Mail className="size-3.5 text-muted-foreground" /> {active.email}</p>}
                      {(active.city || active.pincode) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[active.city, active.pincode].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-medium">Expected: {formatCurrency(active.expectedPrice)}</p>
                      {active.sellerType && <p className="text-xs text-muted-foreground">Seller type: {titleCase(active.sellerType)}</p>}
                    </div>
                  </div>

                  {active.description && <div className="rounded-lg border bg-muted/40 p-3 text-sm">{active.description}</div>}

                  {active.images && active.images.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Photos</p>
                      <div className="flex flex-wrap gap-2">
                        {active.images.map((img, i) => (
                          <div key={i} className="relative h-20 w-24 overflow-hidden rounded-md border">
                            <img src={img.url} alt={img.tag} className="h-full w-full object-cover" />
                            <span className="absolute bottom-0 left-0 right-0 bg-black/55 px-1 py-0.5 text-[9px] text-white">{titleCase(img.tag)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Status</Label>
                      <Select value={newStatus} onValueChange={(v) => setNewStatus(v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Keep current</SelectItem>
                          {(Object.keys(SELL_REQUEST_STATUS_LABELS) as SellRequestStatus[]).map((s) => <SelectItem key={s} value={s}>{SELL_REQUEST_STATUS_LABELS[s]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Offer price (₹)</Label>
                      <Input type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Inspection date</Label>
                      <Input type="date" value={inspectionDate} onChange={(e) => setInspectionDate(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Inspector</Label>
                      <Select value={inspector} onValueChange={setInspector}>
                        <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Keep current</SelectItem>
                          <SelectItem value="__unassign__">Unassign</SelectItem>
                          {staffList.map((u) => <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>)}
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
                    <div className="space-y-1.5">
                      <Label className="text-xs">Rejection reason</Label>
                      <Input value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="If rejecting…" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Add note (internal)</Label>
                    <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Button variant="outline" onClick={() => setShowConvert(true)}>
                      Convert to listing <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setActive(null)}>Close</Button>
                      <Button onClick={apply} disabled={isPending}>Save changes</Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                    Create a live listing from this sell request. Fields default from the submission — override where needed.
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Listing price (₹)</Label>
                      <Input type="number" value={conv.price} onChange={(e) => setConv({ ...conv, price: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Location state</Label>
                      <Input value={conv.state} onChange={(e) => setConv({ ...conv, state: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Location city</Label>
                      <Input value={conv.city} onChange={(e) => setConv({ ...conv, city: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Location pincode</Label>
                      <Input value={conv.pincode} onChange={(e) => setConv({ ...conv, pincode: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Yard name</Label>
                      <Input value={conv.yard} onChange={(e) => setConv({ ...conv, yard: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2 self-end pb-2">
                      <Switch checked={conv.featured} onCheckedChange={(v) => setConv({ ...conv, featured: v })} />
                      <span className="text-sm">Feature listing</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Description override</Label>
                    <Textarea rows={3} value={conv.description} onChange={(e) => setConv({ ...conv, description: e.target.value })} />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowConvert(false)}>Back</Button>
                    <Button onClick={() => doConvert()} disabled={converting}>
                      {converting ? 'Creating listing…' : 'Create listing'}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}

          {created && (
            <>
              <DialogHeader>
                <DialogTitle>Listing created</DialogTitle>
                <DialogDescription>The sell request is now a live vehicle listing.</DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border bg-green-50 p-3 text-sm text-green-800">
                The vehicle has been created{created.slug ? ` with slug “${created.slug}”` : ''}.
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" asChild>
                  <Link to={ROUTES.admin.sellRequests} onClick={() => setActive(null)}>Back to list</Link>
                </Button>
                {created.slug && (
                  <Button asChild>
                    <Link to={ROUTES.vehicleDetail(created.slug)} target="_blank">
                      View listing <ExternalLink className="ml-1 h-4 w-4" />
                    </Link>
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

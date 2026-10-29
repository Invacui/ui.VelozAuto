import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { SEO } from '@/components/common/SEO';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
  listBrands, createBrand, updateBrand, deleteBrand,
  listModels, createModel, updateModel, deleteModel,
  listLocations, createLocation, updateLocation, deleteLocation,
  listFeatures, createFeature, updateFeature, deleteFeature,
} from '@/services/master.service';
import { queryKeys } from '@/lib/queryKeys';
import { VEHICLE_CATEGORIES, CATEGORY_LABELS } from '@/constants/vehicleEnums';
import { getApiErrorMessage, titleCase } from '@/lib/utils';
import type { Brand, VehicleModel, Location, Feature, CityEntry } from '@/types/master.types';

const FEATURE_CATEGORIES = ['SAFETY', 'COMFORT', 'EXTERIOR', 'INTERIOR', 'TECH', 'COMMERCIAL'];

export default function MasterData() {
  return (
    <>
      <SEO title="Master data" noindex />
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold">Master data</h1>
          <p className="text-sm text-muted-foreground">Reference data used across listings, filters and forms.</p>
        </div>
        <Tabs defaultValue="brands">
          <TabsList>
            <TabsTrigger value="brands">Brands</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>
          <TabsContent value="brands" className="mt-4"><BrandsTab /></TabsContent>
          <TabsContent value="models" className="mt-4"><ModelsTab /></TabsContent>
          <TabsContent value="locations" className="mt-4"><LocationsTab /></TabsContent>
          <TabsContent value="features" className="mt-4"><FeaturesTab /></TabsContent>
        </Tabs>
      </div>
    </>
  );
}

/* ---------------- Brands ---------------- */
function BrandsTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Brand | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Brand | null>(null);
  const [form, setForm] = useState<any>({ name: '', categories: [], logo: '', country: '', isActive: true, sortOrder: 0 });

  const { data, isLoading } = useQuery({ queryKey: queryKeys.master.brands({ all: true }), queryFn: () => listBrands({ all: true }) });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['master', 'brands'] });

  const save = useMutation({
    mutationFn: () => (editing ? updateBrand(editing._id, form) : createBrand(form)),
    onSuccess: () => { toast.success(editing ? 'Brand updated' : 'Brand created'); invalidate(); setOpen(false); },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not save brand')),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: () => { toast.success('Brand deleted'); invalidate(); setToDelete(null); },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not delete brand')),
  });

  const startNew = () => { setEditing(null); setForm({ name: '', categories: [], logo: '', country: '', isActive: true, sortOrder: 0 }); setOpen(true); };
  const startEdit = (b: Brand) => { setEditing(b); setForm({ ...b, categories: b.categories ?? [] }); setOpen(true); };

  const columns: Column<Brand>[] = [
    { key: 'name', header: 'Name', render: (b) => <span className="text-sm font-medium">{b.name}</span> },
    { key: 'categories', header: 'Categories', render: (b) => <span className="text-xs text-muted-foreground">{(b.categories ?? []).map((c) => CATEGORY_LABELS[c] || c).join(', ') || 'All'}</span> },
    { key: 'country', header: 'Country', render: (b) => b.country || '—' },
    { key: 'active', header: 'Status', render: (b) => <StatusBadge label={b.isActive ? 'Active' : 'Inactive'} tone={b.isActive ? 'success' : 'default'} /> },
    {
      key: 'actions', header: '',
      render: (b) => (
        <div className="flex gap-1">
          <Button size="icon-sm" variant="ghost" onClick={() => startEdit(b)}><Pencil className="size-3.5" /></Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setToDelete(b)}><Trash2 className="size-3.5 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button size="sm" onClick={startNew}><Plus className="mr-1 h-4 w-4" /> Add brand</Button></div>
      <DataTable columns={columns} rows={data ?? []} rowKey={(b) => b._id} loading={isLoading} empty="No brands yet." />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit brand' : 'Add brand'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Country</Label><Input value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Logo URL</Label><Input value={form.logo || ''} onChange={(e) => setForm({ ...form, logo: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label className="text-xs">Categories (leave empty for all)</Label>
              <div className="flex flex-wrap gap-3">
                {VEHICLE_CATEGORIES.map((c) => (
                  <label key={c.value} className="flex items-center gap-1.5 text-xs">
                    <Checkbox checked={form.categories?.includes(c.value)} onCheckedChange={(v) => setForm({ ...form, categories: v ? [...(form.categories || []), c.value] : (form.categories || []).filter((x: string) => x !== c.value) })} />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={!!form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /><span className="text-sm">Active</span></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button></div>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title="Delete brand?" description={toDelete?.name} destructive confirmLabel="Delete" loading={remove.isPending} onConfirm={() => toDelete && remove.mutate(toDelete._id)} />
    </div>
  );
}

/* ---------------- Models ---------------- */
function ModelsTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<VehicleModel | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<VehicleModel | null>(null);
  const [form, setForm] = useState<any>({ brand: '', name: '', category: 'PASSENGER_CAR', bodyTypes: '', fuelOptions: '', transmissionOptions: '', priceMin: '', priceMax: '', isActive: true });

  const { data, isLoading } = useQuery({ queryKey: queryKeys.master.models(), queryFn: () => listModels() });
  const { data: brands } = useQuery({ queryKey: queryKeys.master.brands({ all: true }), queryFn: () => listBrands({ all: true }) });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['master', 'models'] });

  const save = useMutation({
    mutationFn: () => {
      const payload: any = {
        brand: form.brand, name: form.name, category: form.category,
        bodyTypes: splitCsv(form.bodyTypes), fuelOptions: splitCsv(form.fuelOptions),
        transmissionOptions: splitCsv(form.transmissionOptions),
        priceRange: { min: numOrUndef(form.priceMin), max: numOrUndef(form.priceMax) },
        isActive: form.isActive,
      };
      return editing ? updateModel(editing._id, payload) : createModel(payload);
    },
    onSuccess: () => { toast.success(editing ? 'Model updated' : 'Model created'); invalidate(); setOpen(false); },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not save model')),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteModel(id),
    onSuccess: () => { toast.success('Model deleted'); invalidate(); setToDelete(null); },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not delete model')),
  });

  const startNew = () => { setEditing(null); setForm({ brand: '', name: '', category: 'PASSENGER_CAR', bodyTypes: '', fuelOptions: '', transmissionOptions: '', priceMin: '', priceMax: '', isActive: true }); setOpen(true); };
  const startEdit = (m: VehicleModel) => {
    setEditing(m);
    setForm({
      brand: typeof m.brand === 'object' ? m.brand.id : m.brand,
      name: m.name, category: m.category,
      bodyTypes: (m.bodyTypes ?? []).join(', '), fuelOptions: (m.fuelOptions ?? []).join(', '),
      transmissionOptions: (m.transmissionOptions ?? []).join(', '),
      priceMin: m.priceRange?.min ?? '', priceMax: m.priceRange?.max ?? '', isActive: m.isActive,
    });
    setOpen(true);
  };

  const columns: Column<VehicleModel>[] = [
    { key: 'name', header: 'Model', render: (m) => <span className="text-sm font-medium">{m.name}</span> },
    { key: 'brand', header: 'Brand', render: (m) => (typeof m.brand === 'object' ? m.brand.name : '—') },
    { key: 'category', header: 'Category', render: (m) => CATEGORY_LABELS[m.category] || m.category },
    { key: 'active', header: 'Status', render: (m) => <StatusBadge label={m.isActive ? 'Active' : 'Inactive'} tone={m.isActive ? 'success' : 'default'} /> },
    {
      key: 'actions', header: '',
      render: (m) => (
        <div className="flex gap-1">
          <Button size="icon-sm" variant="ghost" onClick={() => startEdit(m)}><Pencil className="size-3.5" /></Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setToDelete(m)}><Trash2 className="size-3.5 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button size="sm" onClick={startNew}><Plus className="mr-1 h-4 w-4" /> Add model</Button></div>
      <DataTable columns={columns} rows={data ?? []} rowKey={(m) => m._id} loading={isLoading} empty="No models yet." />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit model' : 'Add model'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Brand</Label>
              <Select value={form.brand} onValueChange={(v) => setForm({ ...form, brand: v })}>
                <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>{(brands ?? []).map((b) => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{VEHICLE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Body types (comma separated)</Label><Input value={form.bodyTypes} onChange={(e) => setForm({ ...form, bodyTypes: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Fuel options (comma separated)</Label><Input value={form.fuelOptions} onChange={(e) => setForm({ ...form, fuelOptions: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Transmission options (comma separated)</Label><Input value={form.transmissionOptions} onChange={(e) => setForm({ ...form, transmissionOptions: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Price min</Label><Input type="number" value={form.priceMin} onChange={(e) => setForm({ ...form, priceMin: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Price max</Label><Input type="number" value={form.priceMax} onChange={(e) => setForm({ ...form, priceMax: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={!!form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /><span className="text-sm">Active</span></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button></div>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title="Delete model?" description={toDelete?.name} destructive confirmLabel="Delete" loading={remove.isPending} onConfirm={() => toDelete && remove.mutate(toDelete._id)} />
    </div>
  );
}

/* ---------------- Locations ---------------- */
function LocationsTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Location | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Location | null>(null);
  const [form, setForm] = useState<any>({ state: '', stateCode: '', cities: [] as CityEntry[], isActive: true });

  const { data, isLoading } = useQuery({ queryKey: queryKeys.master.locations(), queryFn: listLocations });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['master', 'locations'] });

  const save = useMutation({
    mutationFn: () => (editing ? updateLocation(editing._id, form) : createLocation(form)),
    onSuccess: () => { toast.success(editing ? 'Location updated' : 'Location created'); invalidate(); setOpen(false); },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not save location')),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteLocation(id),
    onSuccess: () => { toast.success('Location deleted'); invalidate(); setToDelete(null); },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not delete location')),
  });

  const startNew = () => { setEditing(null); setForm({ state: '', stateCode: '', cities: [], isActive: true }); setOpen(true); };
  const startEdit = (l: Location) => { setEditing(l); setForm({ ...l, cities: l.cities ?? [] }); setOpen(true); };
  const addCity = () => setForm({ ...form, cities: [...form.cities, { name: '', rtoCodes: [] }] });
  const setCity = (i: number, patch: Partial<CityEntry>) => setForm({ ...form, cities: form.cities.map((c: CityEntry, idx: number) => (idx === i ? { ...c, ...patch } : c)) });
  const delCity = (i: number) => setForm({ ...form, cities: form.cities.filter((_: any, idx: number) => idx !== i) });

  const columns: Column<Location>[] = [
    { key: 'state', header: 'State', render: (l) => <span className="text-sm font-medium">{l.state}</span> },
    { key: 'code', header: 'Code', render: (l) => l.stateCode },
    { key: 'cities', header: 'Cities', render: (l) => <span className="text-xs text-muted-foreground">{(l.cities ?? []).map((c) => c.name).join(', ') || '—'}</span> },
    { key: 'active', header: 'Status', render: (l) => <StatusBadge label={l.isActive ? 'Active' : 'Inactive'} tone={l.isActive ? 'success' : 'default'} /> },
    {
      key: 'actions', header: '',
      render: (l) => (
        <div className="flex gap-1">
          <Button size="icon-sm" variant="ghost" onClick={() => startEdit(l)}><Pencil className="size-3.5" /></Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setToDelete(l)}><Trash2 className="size-3.5 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button size="sm" onClick={startNew}><Plus className="mr-1 h-4 w-4" /> Add state</Button></div>
      <DataTable columns={columns} rows={data ?? []} rowKey={(l) => l._id} loading={isLoading} empty="No locations yet." />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit state' : 'Add state'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">State name</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">State code</Label><Input value={form.stateCode} onChange={(e) => setForm({ ...form, stateCode: e.target.value })} placeholder="MH" /></div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label className="text-xs">Cities</Label><Button size="sm" variant="outline" onClick={addCity}><Plus className="mr-1 h-3.5 w-3.5" /> City</Button></div>
              {form.cities.map((c: CityEntry, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <Input className="h-8" placeholder="City name" value={c.name} onChange={(e) => setCity(i, { name: e.target.value })} />
                  <Input className="h-8" placeholder="RTO codes (comma sep)" value={(c.rtoCodes ?? []).join(', ')} onChange={(e) => setCity(i, { rtoCodes: splitCsv(e.target.value) })} />
                  <Button size="icon-sm" variant="ghost" onClick={() => delCity(i)}><X className="size-3.5" /></Button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2"><Switch checked={!!form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /><span className="text-sm">Active</span></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button></div>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title="Delete state?" description={toDelete?.state} destructive confirmLabel="Delete" loading={remove.isPending} onConfirm={() => toDelete && remove.mutate(toDelete._id)} />
    </div>
  );
}

/* ---------------- Features ---------------- */
function FeaturesTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Feature | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Feature | null>(null);
  const [form, setForm] = useState<any>({ name: '', category: 'SAFETY', applicableCategories: [], isActive: true });

  const { data, isLoading } = useQuery({ queryKey: queryKeys.master.features(), queryFn: () => listFeatures() });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['master', 'features'] });

  const save = useMutation({
    mutationFn: () => (editing ? updateFeature(editing._id, form) : createFeature(form)),
    onSuccess: () => { toast.success(editing ? 'Feature updated' : 'Feature created'); invalidate(); setOpen(false); },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not save feature')),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteFeature(id),
    onSuccess: () => { toast.success('Feature deleted'); invalidate(); setToDelete(null); },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not delete feature')),
  });

  const startNew = () => { setEditing(null); setForm({ name: '', category: 'SAFETY', applicableCategories: [], isActive: true }); setOpen(true); };
  const startEdit = (f: Feature) => { setEditing(f); setForm({ ...f, applicableCategories: f.applicableCategories ?? [] }); setOpen(true); };

  const columns: Column<Feature>[] = [
    { key: 'name', header: 'Feature', render: (f) => <span className="text-sm font-medium">{f.name}</span> },
    { key: 'category', header: 'Category', render: (f) => titleCase(f.category) },
    { key: 'applies', header: 'Applies to', render: (f) => <span className="text-xs text-muted-foreground">{(f.applicableCategories ?? []).map((c) => CATEGORY_LABELS[c] || c).join(', ') || 'All'}</span> },
    { key: 'active', header: 'Status', render: (f) => <StatusBadge label={f.isActive ? 'Active' : 'Inactive'} tone={f.isActive ? 'success' : 'default'} /> },
    {
      key: 'actions', header: '',
      render: (f) => (
        <div className="flex gap-1">
          <Button size="icon-sm" variant="ghost" onClick={() => startEdit(f)}><Pencil className="size-3.5" /></Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setToDelete(f)}><Trash2 className="size-3.5 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button size="sm" onClick={startNew}><Plus className="mr-1 h-4 w-4" /> Add feature</Button></div>
      <DataTable columns={columns} rows={data ?? []} rowKey={(f) => f._id} loading={isLoading} empty="No features yet." />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit feature' : 'Add feature'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FEATURE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{titleCase(c)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Applies to (empty = all)</Label>
              <div className="flex flex-wrap gap-3">
                {VEHICLE_CATEGORIES.map((c) => (
                  <label key={c.value} className="flex items-center gap-1.5 text-xs">
                    <Checkbox checked={form.applicableCategories?.includes(c.value)} onCheckedChange={(v) => setForm({ ...form, applicableCategories: v ? [...(form.applicableCategories || []), c.value] : (form.applicableCategories || []).filter((x: string) => x !== c.value) })} />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={!!form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /><span className="text-sm">Active</span></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button></div>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title="Delete feature?" description={toDelete?.name} destructive confirmLabel="Delete" loading={remove.isPending} onConfirm={() => toDelete && remove.mutate(toDelete._id)} />
    </div>
  );
}

function splitCsv(s?: string): string[] {
  return (s || '').split(',').map((x) => x.trim()).filter(Boolean);
}
function numOrUndef(s?: string): number | undefined {
  if (s === undefined || s === '') return undefined;
  const n = Number(s);
  return Number.isNaN(n) ? undefined : n;
}

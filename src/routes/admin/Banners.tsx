import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SEO } from '@/components/common/SEO';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { listBanners, createBanner, updateBanner, deleteBanner } from '@/services/content.service';
import { queryKeys } from '@/lib/queryKeys';
import { getApiErrorMessage, titleCase } from '@/lib/utils';
import type { Banner, BannerPosition } from '@/types/content.types';

const POSITIONS: BannerPosition[] = ['HERO', 'SELL_STRIP', 'CATEGORIES', 'FOOTER'];

export default function AdminBanners() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Banner | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Banner | null>(null);
  const [form, setForm] = useState<any>({ title: '', subtitle: '', image: '', link: '', position: 'HERO', sortOrder: 0, isActive: true });

  const { data, isLoading } = useQuery({ queryKey: queryKeys.content.banners(), queryFn: () => listBanners() });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['content', 'banners'] });

  const save = useMutation({
    mutationFn: () => (editing ? updateBanner(editing._id, form) : createBanner(form)),
    onSuccess: () => { toast.success(editing ? 'Banner updated' : 'Banner created'); invalidate(); setOpen(false); },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not save banner')),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onSuccess: () => { toast.success('Banner deleted'); invalidate(); setToDelete(null); },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not delete banner')),
  });

  const startNew = () => { setEditing(null); setForm({ title: '', subtitle: '', image: '', link: '', position: 'HERO', sortOrder: 0, isActive: true }); setOpen(true); };
  const startEdit = (b: Banner) => { setEditing(b); setForm({ ...b }); setOpen(true); };

  const columns: Column<Banner>[] = [
    { key: 'preview', header: '', render: (b) => b.image ? <img src={b.image} alt="" className="h-10 w-20 rounded object-cover" /> : <span className="block h-10 w-20 rounded bg-muted" /> },
    { key: 'title', header: 'Title', render: (b) => <div><p className="text-sm font-medium">{b.title}</p>{b.subtitle && <p className="text-xs text-muted-foreground">{b.subtitle}</p>}</div> },
    { key: 'position', header: 'Position', render: (b) => <StatusBadge label={titleCase(b.position)} tone="info" /> },
    { key: 'order', header: 'Order', render: (b) => b.sortOrder ?? 0 },
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
    <>
      <SEO title="Banners" noindex />
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Banners</h1><p className="text-sm text-muted-foreground">Homepage and marketing banners.</p></div>
          <Button size="sm" onClick={startNew}><Plus className="mr-1 h-4 w-4" /> Add banner</Button>
        </div>
        <DataTable columns={columns} rows={data ?? []} rowKey={(b) => b._id} loading={isLoading} empty="No banners yet." />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit banner' : 'Add banner'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Subtitle</Label><Input value={form.subtitle || ''} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
            {form.image && <img src={form.image} alt="" className="h-24 w-full rounded-md border object-cover" />}
            <div className="space-y-1.5"><Label className="text-xs">Link</Label><Input value={form.link || ''} onChange={(e) => setForm({ ...form, link: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Position</Label>
                <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{POSITIONS.map((p) => <SelectItem key={p} value={p}>{titleCase(p)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Sort order</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={!!form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /><span className="text-sm">Active</span></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title="Delete banner?" description={toDelete?.title} destructive confirmLabel="Delete" loading={remove.isPending} onConfirm={() => toDelete && remove.mutate(toDelete._id)} />
    </>
  );
}

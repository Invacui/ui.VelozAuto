import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SEO } from '@/components/common/SEO';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '@/services/content.service';
import { queryKeys } from '@/lib/queryKeys';
import { getApiErrorMessage } from '@/lib/utils';
import type { Testimonial } from '@/types/content.types';

export default function AdminTestimonials() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<any>({ name: '', city: '', role: '', quote: '', rating: 5, avatar: '', isActive: true, sortOrder: 0 });

  const { data, isLoading } = useQuery({ queryKey: queryKeys.content.testimonials(), queryFn: listTestimonials });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['content', 'testimonials'] });

  const save = useMutation({
    mutationFn: () => (editing ? updateTestimonial(editing._id, form) : createTestimonial(form)),
    onSuccess: () => { toast.success(editing ? 'Testimonial updated' : 'Testimonial created'); invalidate(); setOpen(false); },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not save testimonial')),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteTestimonial(id),
    onSuccess: () => { toast.success('Testimonial deleted'); invalidate(); setToDelete(null); },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not delete testimonial')),
  });

  const startNew = () => { setEditing(null); setForm({ name: '', city: '', role: '', quote: '', rating: 5, avatar: '', isActive: true, sortOrder: 0 }); setOpen(true); };
  const startEdit = (t: Testimonial) => { setEditing(t); setForm({ ...t }); setOpen(true); };

  const columns: Column<Testimonial>[] = [
    { key: 'name', header: 'Name', render: (t) => <div><p className="text-sm font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{[t.role, t.city].filter(Boolean).join(' · ')}</p></div> },
    { key: 'quote', header: 'Quote', render: (t) => <span className="line-clamp-2 max-w-md text-sm text-muted-foreground">{t.quote}</span> },
    { key: 'rating', header: 'Rating', render: (t) => <span className="flex items-center gap-0.5">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />)}</span> },
    { key: 'active', header: 'Status', render: (t) => <StatusBadge label={t.isActive ? 'Active' : 'Inactive'} tone={t.isActive ? 'success' : 'default'} /> },
    {
      key: 'actions', header: '',
      render: (t) => (
        <div className="flex gap-1">
          <Button size="icon-sm" variant="ghost" onClick={() => startEdit(t)}><Pencil className="size-3.5" /></Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setToDelete(t)}><Trash2 className="size-3.5 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <SEO title="Testimonials" noindex />
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Testimonials</h1><p className="text-sm text-muted-foreground">Customer reviews shown on the site.</p></div>
          <Button size="sm" onClick={startNew}><Plus className="mr-1 h-4 w-4" /> Add testimonial</Button>
        </div>
        <DataTable columns={columns} rows={data ?? []} rowKey={(t) => t._id} loading={isLoading} empty="No testimonials yet." />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit testimonial' : 'Add testimonial'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">City</Label><Input value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Role / title</Label><Input value={form.role || ''} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Rating (1–5)</Label><Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Quote</Label><Textarea rows={3} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Avatar URL</Label><Input value={form.avatar || ''} onChange={(e) => setForm({ ...form, avatar: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Switch checked={!!form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /><span className="text-sm">Active</span></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title="Delete testimonial?" description={toDelete?.name} destructive confirmLabel="Delete" loading={remove.isPending} onConfirm={() => toDelete && remove.mutate(toDelete._id)} />
    </>
  );
}

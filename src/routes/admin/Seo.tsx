import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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
import { listSeoSettings, upsertSeoSetting, deleteSeoSetting } from '@/services/content.service';
import { queryKeys } from '@/lib/queryKeys';
import { getApiErrorMessage } from '@/lib/utils';
import type { SeoSetting } from '@/types/content.types';

export default function AdminSeo() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<SeoSetting | null>(null);
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<SeoSetting | null>(null);
  const [form, setForm] = useState<any>({ path: '', title: '', description: '', keywords: '', ogImage: '', canonical: '', noindex: false });

  const { data, isLoading } = useQuery({ queryKey: queryKeys.content.seoSettings(), queryFn: listSeoSettings });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['content', 'seoSettings'] });

  const save = useMutation({
    mutationFn: () => upsertSeoSetting({ ...form, keywords: (form.keywords || '').split(',').map((s: string) => s.trim()).filter(Boolean) }),
    onSuccess: () => { toast.success('SEO setting saved'); invalidate(); setOpen(false); },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not save SEO setting')),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteSeoSetting(id),
    onSuccess: () => { toast.success('SEO setting deleted'); invalidate(); setToDelete(null); },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not delete SEO setting')),
  });

  const startNew = () => { setEditing(null); setForm({ path: '', title: '', description: '', keywords: '', ogImage: '', canonical: '', noindex: false }); setOpen(true); };
  const startEdit = (s: SeoSetting) => { setEditing(s); setForm({ ...s, keywords: (s.keywords ?? []).join(', ') }); setOpen(true); };

  const columns: Column<SeoSetting>[] = [
    { key: 'path', header: 'Path', render: (s) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{s.path}</code> },
    { key: 'title', header: 'Title', render: (s) => <span className="text-sm font-medium">{s.title}</span> },
    { key: 'description', header: 'Description', render: (s) => <span className="line-clamp-2 max-w-lg text-sm text-muted-foreground">{s.description}</span> },
    { key: 'index', header: 'Indexing', render: (s) => <StatusBadge label={s.noindex ? 'No-index' : 'Indexed'} tone={s.noindex ? 'warning' : 'success'} /> },
    {
      key: 'actions', header: '',
      render: (s) => (
        <div className="flex gap-1">
          <Button size="icon-sm" variant="ghost" onClick={() => startEdit(s)}><Pencil className="size-3.5" /></Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setToDelete(s)}><Trash2 className="size-3.5 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <SEO title="SEO" noindex />
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">SEO</h1><p className="text-sm text-muted-foreground">Per-path meta titles and descriptions.</p></div>
          <Button size="sm" onClick={startNew}><Plus className="mr-1 h-4 w-4" /> Add setting</Button>
        </div>
        <DataTable columns={columns} rows={data ?? []} rowKey={(s) => s._id} loading={isLoading} empty="No SEO settings yet." />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit SEO setting' : 'Add SEO setting'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Path</Label><Input value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} placeholder="/vehicles" disabled={!!editing} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Meta title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Meta description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Keywords (comma separated)</Label><Input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">OG image URL</Label><Input value={form.ogImage || ''} onChange={(e) => setForm({ ...form, ogImage: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Canonical URL</Label><Input value={form.canonical || ''} onChange={(e) => setForm({ ...form, canonical: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Switch checked={!!form.noindex} onCheckedChange={(v) => setForm({ ...form, noindex: v })} /><span className="text-sm">Exclude from search (noindex)</span></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title="Delete SEO setting?" description={toDelete?.path} destructive confirmLabel="Delete" loading={remove.isPending} onConfirm={() => toDelete && remove.mutate(toDelete._id)} />
    </>
  );
}

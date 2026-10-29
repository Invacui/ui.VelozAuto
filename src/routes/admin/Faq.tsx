import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, HelpCircle } from 'lucide-react';
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
import { EmptyState } from '@/components/common/EmptyState';
import {
  listFaqCategories, createFaqCategory, updateFaqCategory, deleteFaqCategory,
  listFaqArticles, createFaqArticle, updateFaqArticle, deleteFaqArticle,
} from '@/services/content.service';
import { queryKeys } from '@/lib/queryKeys';
import { cn, getApiErrorMessage } from '@/lib/utils';
import type { FaqCategory, FaqArticle } from '@/types/content.types';

export default function AdminFaq() {
  const qc = useQueryClient();
  const [activeCat, setActiveCat] = useState<FaqCategory | null>(null);

  const [catOpen, setCatOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<FaqCategory | null>(null);
  const [catForm, setCatForm] = useState<any>({ name: '', description: '', order: 0, isActive: true });
  const [catToDelete, setCatToDelete] = useState<FaqCategory | null>(null);

  const [artOpen, setArtOpen] = useState(false);
  const [editingArt, setEditingArt] = useState<FaqArticle | null>(null);
  const [artForm, setArtForm] = useState<any>({ question: '', answer: '', order: 0, isActive: true });
  const [artToDelete, setArtToDelete] = useState<FaqArticle | null>(null);

  const { data: categories, isLoading: loadingCats } = useQuery({ queryKey: queryKeys.content.faqCategories(), queryFn: listFaqCategories });
  const invalidateCats = () => qc.invalidateQueries({ queryKey: ['content', 'faqCategories'] });

  useEffect(() => {
    if (categories && categories.length > 0 && !activeCat) setActiveCat(categories[0]);
  }, [categories, activeCat]);

  const { data: articles, isLoading: loadingArts } = useQuery({
    queryKey: queryKeys.content.faqArticles({ category: activeCat?._id }),
    queryFn: () => listFaqArticles({ category: activeCat!._id }),
    enabled: !!activeCat,
  });
  const invalidateArts = () => qc.invalidateQueries({ queryKey: ['content', 'faqArticles'] });

  const saveCat = useMutation({
    mutationFn: () => (editingCat ? updateFaqCategory(editingCat._id, catForm) : createFaqCategory(catForm)),
    onSuccess: () => { toast.success(editingCat ? 'Category updated' : 'Category created'); invalidateCats(); setCatOpen(false); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const removeCat = useMutation({
    mutationFn: (id: string) => deleteFaqCategory(id),
    onSuccess: () => { toast.success('Category deleted'); setActiveCat(null); invalidateCats(); setCatToDelete(null); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const saveArt = useMutation({
    mutationFn: () => {
      const payload = { ...artForm, category: activeCat!._id };
      return editingArt ? updateFaqArticle(editingArt._id, payload) : createFaqArticle(payload);
    },
    onSuccess: () => { toast.success(editingArt ? 'Article updated' : 'Article created'); invalidateArts(); setArtOpen(false); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const removeArt = useMutation({
    mutationFn: (id: string) => deleteFaqArticle(id),
    onSuccess: () => { toast.success('Article deleted'); invalidateArts(); setArtToDelete(null); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const columns: Column<FaqArticle>[] = [
    { key: 'question', header: 'Question', render: (a) => <span className="text-sm font-medium">{a.question}</span> },
    { key: 'answer', header: 'Answer', render: (a) => <span className="line-clamp-2 max-w-lg text-sm text-muted-foreground">{a.answer}</span> },
    { key: 'active', header: 'Status', render: (a) => <StatusBadge label={a.isActive ? 'Active' : 'Inactive'} tone={a.isActive ? 'success' : 'default'} /> },
    {
      key: 'actions', header: '',
      render: (a) => (
        <div className="flex gap-1">
          <Button size="icon-sm" variant="ghost" onClick={() => { setEditingArt(a); setArtForm({ ...a, category: undefined }); setArtOpen(true); }}><Pencil className="size-3.5" /></Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setArtToDelete(a)}><Trash2 className="size-3.5 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <SEO title="FAQ" noindex />
      <div className="space-y-5">
        <div><h1 className="text-xl font-bold">FAQ</h1><p className="text-sm text-muted-foreground">Manage help categories and questions.</p></div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          {/* Categories */}
          <div className="rounded-lg border">
            <div className="flex items-center justify-between border-b p-3">
              <span className="text-sm font-semibold">Categories</span>
              <Button size="icon-sm" variant="ghost" onClick={() => { setEditingCat(null); setCatForm({ name: '', description: '', order: 0, isActive: true }); setCatOpen(true); }}><Plus className="size-4" /></Button>
            </div>
            <ul className="divide-y">
              {loadingCats ? <li className="p-4 text-center text-sm text-muted-foreground">Loading…</li> : (categories ?? []).map((c) => (
                <li key={c._id}>
                  <button
                    type="button"
                    onClick={() => setActiveCat(c)}
                    className={cn('flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-muted/60', activeCat?._id === c._id && 'bg-muted')}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.slug}</p>
                    </div>
                    <div className="flex shrink-0 gap-0.5">
                      <Button size="icon-sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingCat(c); setCatForm({ ...c }); setCatOpen(true); }}><Pencil className="size-3.5" /></Button>
                      <Button size="icon-sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setCatToDelete(c); }}><Trash2 className="size-3.5 text-destructive" /></Button>
                    </div>
                  </button>
                </li>
              ))}
              {!loadingCats && (categories ?? []).length === 0 && <li className="p-4 text-center text-sm text-muted-foreground">No categories.</li>}
            </ul>
          </div>

          {/* Articles */}
          <div className="space-y-3">
            {activeCat ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">{activeCat.name} — questions</h2>
                  <Button size="sm" onClick={() => { setEditingArt(null); setArtForm({ question: '', answer: '', order: 0, isActive: true }); setArtOpen(true); }}><Plus className="mr-1 h-4 w-4" /> Add question</Button>
                </div>
                <DataTable columns={columns} rows={articles ?? []} rowKey={(a) => a._id} loading={loadingArts} empty="No questions in this category yet." />
              </>
            ) : (
              <EmptyState icon={<HelpCircle className="h-6 w-6 text-gray-400" />} title="No category selected" description="Create or pick a category to manage its questions." />
            )}
          </div>
        </div>
      </div>

      {/* Category dialog */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCat ? 'Edit category' : 'Add category'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Name</Label><Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Description</Label><Textarea rows={2} value={catForm.description || ''} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Order</Label><Input type="number" value={catForm.order} onChange={(e) => setCatForm({ ...catForm, order: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-2"><Switch checked={!!catForm.isActive} onCheckedChange={(v) => setCatForm({ ...catForm, isActive: v })} /><span className="text-sm">Active</span></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setCatOpen(false)}>Cancel</Button><Button onClick={() => saveCat.mutate()} disabled={saveCat.isPending}>Save</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Article dialog */}
      <Dialog open={artOpen} onOpenChange={setArtOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingArt ? 'Edit question' : 'Add question'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Question</Label><Input value={artForm.question} onChange={(e) => setArtForm({ ...artForm, question: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Answer</Label><Textarea rows={5} value={artForm.answer} onChange={(e) => setArtForm({ ...artForm, answer: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Order</Label><Input type="number" value={artForm.order} onChange={(e) => setArtForm({ ...artForm, order: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-2"><Switch checked={!!artForm.isActive} onCheckedChange={(v) => setArtForm({ ...artForm, isActive: v })} /><span className="text-sm">Active</span></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setArtOpen(false)}>Cancel</Button><Button onClick={() => saveArt.mutate()} disabled={saveArt.isPending}>Save</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!catToDelete} onOpenChange={(o) => !o && setCatToDelete(null)} title="Delete category?" description={catToDelete?.name} destructive confirmLabel="Delete" loading={removeCat.isPending} onConfirm={() => catToDelete && removeCat.mutate(catToDelete._id)} />
      <ConfirmDialog open={!!artToDelete} onOpenChange={(o) => !o && setArtToDelete(null)} title="Delete question?" description={artToDelete?.question} destructive confirmLabel="Delete" loading={removeArt.isPending} onConfirm={() => artToDelete && removeArt.mutate(artToDelete._id)} />
    </>
  );
}

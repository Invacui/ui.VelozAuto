import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/common/SEO';
import { getSiteSettings, updateSiteSettings } from '@/services/content.service';
import { queryKeys } from '@/lib/queryKeys';
import { getApiErrorMessage } from '@/lib/utils';
import type { SiteSetting } from '@/types/content.types';

const EMPTY: SiteSetting = {
  siteName: 'Veloz Auto',
  tagline: '', phone: '', email: '', address: '', whatsapp: '', footerText: '', workingHours: '',
  social: { facebook: '', instagram: '', linkedin: '', youtube: '' },
  defaultMeta: { title: '', description: '', image: '' },
};

export default function AdminSettings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: queryKeys.content.siteSettings(), queryFn: getSiteSettings });
  const [form, setForm] = useState<SiteSetting>(EMPTY);

  useEffect(() => { if (data) setForm({ ...EMPTY, ...data }); }, [data]);

  const save = useMutation({
    mutationFn: () => updateSiteSettings(form),
    onSuccess: () => { toast.success('Settings saved'); qc.invalidateQueries({ queryKey: queryKeys.content.siteSettings() }); },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not save settings')),
  });

  const set = (patch: Partial<SiteSetting>) => setForm((f) => ({ ...f, ...patch }));
  const setSocial = (patch: Partial<NonNullable<SiteSetting['social']>>) => setForm((f) => ({ ...f, social: { ...f.social, ...patch } }));
  const setMeta = (patch: Partial<NonNullable<SiteSetting['defaultMeta']>>) => setForm((f) => ({ ...f, defaultMeta: { ...f.defaultMeta, ...patch } }));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      <SEO title="Site settings" noindex />
      <form
        className="space-y-5"
        onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
      >
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Site settings</h1><p className="text-sm text-muted-foreground">Global contact details, social links and defaults.</p></div>
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="mr-1 h-4 w-4" /> Save</>}
          </Button>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">General</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-xs">Site name</Label><Input value={form.siteName} onChange={(e) => set({ siteName: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Tagline</Label><Input value={form.tagline || ''} onChange={(e) => set({ tagline: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Phone</Label><Input value={form.phone || ''} onChange={(e) => set({ phone: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">WhatsApp</Label><Input value={form.whatsapp || ''} onChange={(e) => set({ whatsapp: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input value={form.email || ''} onChange={(e) => set({ email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Working hours</Label><Input value={form.workingHours || ''} onChange={(e) => set({ workingHours: e.target.value })} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label className="text-xs">Address</Label><Textarea rows={2} value={form.address || ''} onChange={(e) => set({ address: e.target.value })} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Social links</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label className="text-xs">Facebook</Label><Input value={form.social?.facebook || ''} onChange={(e) => setSocial({ facebook: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Instagram</Label><Input value={form.social?.instagram || ''} onChange={(e) => setSocial({ instagram: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">LinkedIn</Label><Input value={form.social?.linkedin || ''} onChange={(e) => setSocial({ linkedin: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">YouTube</Label><Input value={form.social?.youtube || ''} onChange={(e) => setSocial({ youtube: e.target.value })} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Default meta & footer</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-1.5"><Label className="text-xs">Default meta title</Label><Input value={form.defaultMeta?.title || ''} onChange={(e) => setMeta({ title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Default meta description</Label><Textarea rows={2} value={form.defaultMeta?.description || ''} onChange={(e) => setMeta({ description: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Default OG image URL</Label><Input value={form.defaultMeta?.image || ''} onChange={(e) => setMeta({ image: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Footer text</Label><Textarea rows={2} value={form.footerText || ''} onChange={(e) => set({ footerText: e.target.value })} /></div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="mr-1 h-4 w-4" /> Save settings</>}
          </Button>
        </div>
      </form>
    </>
  );
}

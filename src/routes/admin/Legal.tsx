import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/common/SEO';
import { getSiteSettings, updateSiteSettings } from '@/services/content.service';
import { queryKeys } from '@/lib/queryKeys';
import { getApiErrorMessage } from '@/lib/utils';

const previewClass =
  'min-h-[28rem] overflow-y-auto rounded-md border p-4 text-sm leading-relaxed text-muted-foreground [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2:first-child]:mt-0 [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_strong]:text-foreground';

export default function AdminLegal() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.content.siteSettings(),
    queryFn: getSiteSettings,
  });
  const [terms, setTerms] = useState('');
  const [privacy, setPrivacy] = useState('');

  useEffect(() => {
    if (!data) return;
    setTerms(data.termsContent ?? '');
    setPrivacy(data.privacyContent ?? '');
  }, [data]);

  const save = useMutation({
    mutationFn: () => updateSiteSettings({ termsContent: terms, privacyContent: privacy }),
    onSuccess: () => {
      toast.success('Legal pages saved');
      qc.invalidateQueries({ queryKey: queryKeys.content.siteSettings() });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not save legal pages')),
  });

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
      <SEO title="Legal pages" noindex />
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Legal pages</h1>
            <p className="text-sm text-muted-foreground">
              Edit the Terms &amp; Conditions and Privacy Policy shown on the public site. Markdown is
              supported.
            </p>
          </div>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="mr-1 h-4 w-4" /> Save</>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Page content</CardTitle></CardHeader>
          <CardContent>
            <Tabs defaultValue="terms">
              <TabsList>
                <TabsTrigger value="terms">Terms &amp; Conditions</TabsTrigger>
                <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
              </TabsList>

              <TabsContent value="terms" className="mt-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="terms-content">Terms content (Markdown)</Label>
                    <Textarea
                      id="terms-content"
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      className="min-h-[28rem] font-mono text-xs"
                      placeholder="## 1. Acceptance of terms…"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Preview</Label>
                    <div className={previewClass}>
                      <ReactMarkdown>{terms || '_Nothing to preview yet._'}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="privacy" className="mt-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="privacy-content">Privacy content (Markdown)</Label>
                    <Textarea
                      id="privacy-content"
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value)}
                      className="min-h-[28rem] font-mono text-xs"
                      placeholder="## 1. Who we are…"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Preview</Label>
                    <div className={previewClass}>
                      <ReactMarkdown>{privacy || '_Nothing to preview yet._'}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="mr-1 h-4 w-4" /> Save legal pages</>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

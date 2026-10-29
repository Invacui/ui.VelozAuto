import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { listContacts, updateContact } from '@/services/content.service';
import { queryKeys } from '@/lib/queryKeys';
import { formatDateTime, getApiErrorMessage, titleCase } from '@/lib/utils';
import type { Contact } from '@/types/content.types';

const CONTACT_STATUSES: Contact['status'][] = ['NEW', 'IN_PROGRESS', 'RESOLVED'];
const tone = (s: Contact['status']) => (s === 'NEW' ? 'info' : s === 'IN_PROGRESS' ? 'warning' : 'success');

export default function AdminContacts() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('__all__');
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<Contact | null>(null);
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState<Contact['status'] | '__none__'>('__none__');

  const params = { page, limit: 15, status: status === '__all__' ? undefined : status };
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.content.contacts(params),
    queryFn: () => listContacts(params),
  });

  const open = (c: Contact) => { setActive(c); setNote(c.adminNotes || ''); setNewStatus('__none__'); };

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      const payload: any = {};
      if (note !== (active?.adminNotes || '')) payload.adminNotes = note;
      if (newStatus !== '__none__') payload.status = newStatus;
      return updateContact(active!._id, payload);
    },
    onSuccess: (updated) => {
      toast.success('Contact updated');
      qc.invalidateQueries({ queryKey: ['content', 'contacts'] });
      setActive(updated);
      setNewStatus('__none__');
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not update contact')),
  });

  const columns: Column<Contact>[] = [
    { key: 'name', header: 'Name', render: (c) => <div><p className="text-sm font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.email}</p></div> },
    { key: 'subject', header: 'Subject', render: (c) => <span className="text-sm">{c.subject}</span> },
    { key: 'message', header: 'Message', render: (c) => <span className="line-clamp-2 max-w-md text-sm text-muted-foreground">{c.message}</span> },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge label={titleCase(c.status)} tone={tone(c.status)} /> },
    { key: 'created', header: 'Received', render: (c) => formatDateTime(c.createdAt) },
    {
      key: 'actions', header: '',
      render: (c) => <Button size="icon-sm" variant="ghost" aria-label="View" onClick={() => open(c)}><Eye className="size-3.5" /></Button>,
    },
  ];

  return (
    <>
      <SEO title="Contact messages" noindex />
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Contact messages</h1><p className="text-sm text-muted-foreground">Enquiries submitted through the contact form.</p></div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All statuses</SelectItem>
              {CONTACT_STATUSES.map((s) => <SelectItem key={s} value={s}>{titleCase(s)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <DataTable columns={columns} rows={data?.data ?? []} rowKey={(c) => c._id} loading={isLoading} empty="No contact messages." />

        {data && data.pagination.totalPages > 1 && (
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} onPageChange={setPage} />
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">{active.subject} <StatusBadge label={titleCase(active.status)} tone={tone(active.status)} /></DialogTitle>
                <DialogDescription>{formatDateTime(active.createdAt)}</DialogDescription>
              </DialogHeader>
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2"><Mail className="size-3.5 text-muted-foreground" /> {active.email}</p>
                {active.phone && <p className="flex items-center gap-2"><Phone className="size-3.5 text-muted-foreground" /> {active.phone}</p>}
              </div>
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">{active.message}</div>
              <Separator />
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Keep current</SelectItem>
                    {CONTACT_STATUSES.map((s) => <SelectItem key={s} value={s}>{titleCase(s)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Internal notes</Label>
                <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setActive(null)}>Close</Button>
                <Button onClick={() => save()} disabled={isPending}>Save</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, MessagesSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { SEO } from '@/components/common/SEO';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { EmptyState } from '@/components/common/EmptyState';
import { listTickets, updateTicket } from '@/services/chat.service';
import { listUsers } from '@/services/admin.service';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/hooks/useAuth';
import { useAdminSocket } from '@/hooks/useAdminSocket';
import { cn, getApiErrorMessage, relativeTime, titleCase } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import type { ChatTicket, ChatTicketStatus, ChatPriority } from '@/types/chat.types';

const STATUS_LABELS: Record<ChatTicketStatus, string> = {
  OPEN: 'Open', IN_PROGRESS: 'In progress', RESOLVED: 'Resolved', CLOSED: 'Closed',
};
const statusTone = (s: ChatTicketStatus) =>
  s === 'OPEN' ? 'info' : s === 'IN_PROGRESS' ? 'warning' : s === 'RESOLVED' ? 'success' : 'default';

export default function AdminChat() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('__all__');
  const [selected, setSelected] = useState<ChatTicket | null>(null);
  const debouncedQ = useDebounce(q, 350);
  useAdminSocket(true);

  const { data: staff } = useQuery({
    queryKey: queryKeys.admin.users({ limit: 100 }),
    queryFn: () => listUsers({ limit: 100 }),
  });
  const staffList = (staff?.data ?? []).filter((u) => u.role === 'EMPLOYEE' || u.role === 'ADMIN');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.chat.list({ q: debouncedQ || undefined, status: status === '__all__' ? undefined : status }),
    queryFn: () => listTickets({ q: debouncedQ || undefined, status: status === '__all__' ? undefined : status, limit: 50 }),
  });
  const tickets = data?.data ?? [];

  const { mutate: patch } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateTicket(id, payload),
    onSuccess: (updated) => {
      toast.success('Ticket updated');
      setSelected(updated);
      qc.invalidateQueries({ queryKey: ['chat'] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not update the ticket')),
  });

  const assignedId = selected && typeof selected.assignedTo === 'object' && selected.assignedTo ? selected.assignedTo.id : '__none__';

  return (
    <>
      <SEO title="Chat" noindex />
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold">Chat</h1>
          <p className="text-sm text-muted-foreground">Support conversations with customers.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          {/* Inbox */}
          <div className="flex max-h-[78vh] flex-col rounded-lg border">
            <div className="space-y-2 border-b p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search subject…" className="h-8 pl-8" />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All statuses</SelectItem>
                  {(Object.keys(STATUS_LABELS) as ChatTicketStatus[]).map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <p className="p-4 text-center text-sm text-muted-foreground">Loading…</p>
              ) : tickets.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">No tickets.</p>
              ) : (
                <ul className="divide-y">
                  {tickets.map((t) => {
                    const id = t._id || t.id!;
                    const name = typeof t.user === 'object' && t.user ? t.user.name : 'Customer';
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => setSelected(t)}
                          className={cn('w-full px-3 py-2.5 text-left transition-colors hover:bg-muted/60', (selected?._id || selected?.id) === id && 'bg-muted')}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium">{t.subject}</p>
                            {(t.unreadCount ?? 0) > 0 && <Badge variant="default" className="shrink-0">{t.unreadCount}</Badge>}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{name} · {t.ticketId}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <StatusBadge label={STATUS_LABELS[t.status]} tone={statusTone(t.status)} />
                            <span className="text-[11px] text-muted-foreground">{t.lastMessageAt ? relativeTime(t.lastMessageAt) : relativeTime(t.createdAt)}</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Conversation */}
          <div className="min-h-[60vh]">
            {!selected ? (
              <EmptyState icon={<MessagesSquare className="h-6 w-6 text-gray-400" />} title="Select a conversation" description="Choose a ticket from the inbox to view and reply." />
            ) : (
              <div className="flex h-[78vh] flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2 rounded-lg border p-2">
                  <Select value={selected.status} onValueChange={(v) => patch({ id: selected._id || selected.id!, payload: { status: v } })}>
                    <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>{(Object.keys(STATUS_LABELS) as ChatTicketStatus[]).map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={selected.priority} onValueChange={(v) => patch({ id: selected._id || selected.id!, payload: { priority: v as ChatPriority } })}>
                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => <SelectItem key={p} value={p}>{titleCase(p)}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={assignedId} onValueChange={(v) => patch({ id: selected._id || selected.id!, payload: { assignedTo: v === '__unassign__' ? null : v } })}>
                    <SelectTrigger className="h-8 w-44"><SelectValue placeholder="Assign…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__unassign__">Unassigned</SelectItem>
                      {staffList.map((u) => <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <span className="ml-auto text-xs text-muted-foreground">{titleCase(selected.category)}</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ChatWindow ticket={selected} currentUserId={user?._id || user?.id || ''} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

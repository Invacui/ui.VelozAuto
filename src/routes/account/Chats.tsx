import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessagesSquare, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SEO } from '@/components/common/SEO';
import { EmptyState } from '@/components/common/EmptyState';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { getMyTickets, createTicket } from '@/services/chat.service';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn, getApiErrorMessage, relativeTime } from '@/lib/utils';
import type { ChatTicket } from '@/types/chat.types';

export default function AccountChats() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.chat.mine({ limit: 30 }),
    queryFn: () => getMyTickets({ limit: 30 }),
  });

  const tickets = data?.data ?? [];
  const active = tickets.find((t) => (t._id || t.id) === activeId) || tickets[0] || null;

  const { mutate: create, isPending } = useMutation({
    mutationFn: () => createTicket({ subject, description, category: 'OTHER' }),
    onSuccess: (t) => {
      toast.success('Conversation started');
      qc.invalidateQueries({ queryKey: queryKeys.chat.mine() });
      setNewOpen(false);
      setSubject('');
      setDescription('');
      setActiveId(t._id || t.id!);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not start the conversation')),
  });

  return (
    <>
      <SEO title="Chats" noindex />
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Chats</h1>
          <p className="text-sm text-muted-foreground">Talk to our team about buy and sell requests.</p>
        </div>
        <Button onClick={() => setNewOpen(true)}><Plus className="mr-1 h-4 w-4" /> New chat</Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={<MessagesSquare className="h-6 w-6 text-muted-foreground" />}
          title="No conversations yet"
          description="Start a chat and our team will help you right away."
          action={<Button onClick={() => setNewOpen(true)}>Start a chat</Button>}
        />
      ) : (
        <div className="grid h-[70vh] gap-4 lg:grid-cols-[18rem_1fr]">
          <aside className="overflow-y-auto rounded-xl border">
            {tickets.map((t) => {
              const id = t._id || t.id!;
              return (
                <button
                  key={id}
                  onClick={() => setActiveId(id)}
                  className={cn(
                    'flex w-full flex-col items-start gap-1 border-b p-3 text-left transition-colors hover:bg-muted/60',
                    active && (active._id || active.id) === id && 'bg-muted',
                  )}
                >
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{t.subject}</span>
                    {t.status === 'OPEN' && <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />}
                  </span>
                  <span className="text-xs text-muted-foreground">{relativeTime(t.lastMessageAt || t.createdAt)}</span>
                </button>
              );
            })}
          </aside>
          <div className="min-h-0 rounded-xl border">
            {active && user && (
              <ChatWindow ticket={active} currentUserId={user.id || (user as any)._id} />
            )}
          </div>
        </div>
      )}

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Start a new chat</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Question about a listing" />
            </div>
            <div className="space-y-1.5">
              <Label>Message (optional)</Label>
              <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button className="w-full" disabled={subject.trim().length < 3 || isPending} onClick={() => create()}>
              {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Starting…</> : 'Start chat'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

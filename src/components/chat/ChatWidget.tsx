import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { createTicket, getMyTickets } from '@/services/chat.service';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/hooks/useAuth';
import { cn, getApiErrorMessage } from '@/lib/utils';
import type { ChatTicket } from '@/types/chat.types';

/** Floating support-chat launcher rendered on the marketing site. */
export function ChatWidget() {
  const { isAuthenticated, user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  // Fetch the user's most recent open ticket to resume the conversation.
  const { data: ticketPage } = useQuery({
    queryKey: queryKeys.chat.mine({ limit: 1 }),
    queryFn: () => getMyTickets({ limit: 1 }),
    enabled: isAuthenticated && open,
  });

  const latestTicket: ChatTicket | undefined = ticketPage?.data?.[0];
  const activeTicket = activeTicketId
    ? ticketPage?.data?.find((t) => (t._id || t.id) === activeTicketId) || latestTicket
    : latestTicket;

  const createMutation = useMutation({
    mutationFn: () => createTicket({ subject, description, category: 'OTHER' }),
    onSuccess: (ticket) => {
      toast.success('Chat started — our team will reply shortly.');
      qc.invalidateQueries({ queryKey: queryKeys.chat.mine({ limit: 1 }) });
      setActiveTicketId(ticket._id || ticket.id!);
      setSubject('');
      setDescription('');
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className={cn(
          'fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-lg transition-transform hover:scale-105 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-4 w-4" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[32rem] w-[22rem] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl">
          {!isAuthenticated ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <MessageCircle className="h-8 w-8 text-primary" />
              <h3 className="font-semibold">Chat with us</h3>
              <p className="text-sm text-muted-foreground">
                Log in to start a conversation with our support team about any vehicle or request.
              </p>
              <Button asChild className="mt-2">
                <a href="/login?redirect=/">Log in to chat</a>
              </Button>
            </div>
          ) : activeTicket ? (
            <ChatWindow ticket={activeTicket} currentUserId={user!.id} />
          ) : (
            <form
              className="flex flex-1 flex-col gap-3 p-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (subject.trim()) createMutation.mutate();
              }}
            >
              <div>
                <h3 className="font-semibold">Start a conversation</h3>
                <p className="text-xs text-muted-foreground">We usually reply within a few minutes.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="chat-subject">Subject</Label>
                <Input
                  id="chat-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Enquiry about Maruti Swift"
                  required
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="chat-desc">Message</Label>
                <Textarea
                  id="chat-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us what you need help with…"
                  className="h-24 resize-none"
                />
              </div>
              <Button type="submit" disabled={!subject.trim() || createMutation.isPending}>
                Start chat
              </Button>
            </form>
          )}
        </div>
      )}
    </>
  );
}

export default ChatWidget;

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChat } from '@/hooks/useChat';
import { getMessages, sendMessage, sendImage, markRead } from '@/services/chat.service';
import { queryKeys } from '@/lib/queryKeys';
import { cn, getApiErrorMessage, relativeTime } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/auth.slice';
import type { ChatMessage, ChatTicket } from '@/types/chat.types';

interface Props {
  ticket: ChatTicket;
  currentUserId: string;
}

export function ChatWindow({ ticket, currentUserId }: Props) {
  const qc = useQueryClient();
  const user = useAppSelector(selectUser);
  const [text, setText] = useState('');
  const [typingFromOther, setTypingFromOther] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const ticketId = ticket._id || ticket.id!;

  const { data: messages = [], isLoading } = useQuery({
    queryKey: queryKeys.chat.messages(ticketId),
    queryFn: () => getMessages(ticketId),
  });

  const { emitTyping, emitRead } = useChat({
    ticketId,
    onNewMessage: (m: ChatMessage) => {
      qc.setQueryData<ChatMessage[]>(queryKeys.chat.messages(ticketId), (old = []) => {
        if (old.some((x) => (x._id || x.id) === (m._id || m.id))) return old;
        return [...old, m];
      });
    },
    onTyping: (e) => {
      if (e.userId !== currentUserId) setTypingFromOther(e.isTyping);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    markRead(ticketId).catch(() => {});
    emitRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const sendMutation = useMutation({
    mutationFn: (body: string) => sendMessage(ticketId, body),
    onSuccess: (m) => {
      qc.setQueryData<ChatMessage[]>(queryKeys.chat.messages(ticketId), (old = []) => [...old, m]);
      setText('');
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const imageMutation = useMutation({
    mutationFn: (file: File) => sendImage(ticketId, file),
    onSuccess: (m) =>
      qc.setQueryData<ChatMessage[]>(queryKeys.chat.messages(ticketId), (old = []) => [...old, m]),
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const grouped = useMemo(() => messages, [messages]);

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">{ticket.subject}</h3>
        <p className="text-xs text-muted-foreground">
          {ticket.ticketId} · {ticket.status.replace(/_/g, ' ')}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading messages…</p>
        ) : grouped.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No messages yet. Say hello!</p>
        ) : (
          grouped.map((m) => {
            const senderId = typeof m.sender === 'string' ? m.sender : m.sender.id;
            const mine = senderId === currentUserId || (m.senderRole !== 'USER' && user?.role !== 'USER');
            return (
              <div key={m._id || m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-3 py-2 text-sm',
                    mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
                  )}
                >
                  {m.imageUrl && (
                    <img src={m.imageUrl} alt="" className="mb-1 max-h-48 rounded-lg object-cover" />
                  )}
                  {m.message && <p className="whitespace-pre-wrap">{m.message}</p>}
                  <span className={cn('mt-1 block text-[10px]', mine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {relativeTime(m.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        {typingFromOther && <p className="text-xs italic text-muted-foreground">typing…</p>}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex items-center gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const body = text.trim();
          if (body) sendMutation.mutate(body);
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) imageMutation.mutate(f);
            e.target.value = '';
          }}
        />
        <Button type="button" variant="ghost" size="icon" onClick={() => fileRef.current?.click()}>
          <ImagePlus className="h-4 w-4" />
        </Button>
        <Input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            emitTyping(e.target.value.length > 0);
          }}
          placeholder="Type a message…"
        />
        <Button type="submit" size="icon" disabled={!text.trim() || sendMutation.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

export default ChatWindow;

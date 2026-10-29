import { useEffect, useRef, useState, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { selectAccessToken } from '@/store/auth.slice';
import { getSocket } from '@/lib/socket';
import type { ChatMessage } from '@/types/chat.types';

interface UseChatOptions {
  ticketId: string;
  onNewMessage?: (message: ChatMessage) => void;
  onStatusChange?: (status: string) => void;
  onAssignmentChange?: (assignedTo: string) => void;
  onRead?: (e: { userId: string; readAt: string }) => void;
  onTyping?: (e: { userId: string; isTyping: boolean }) => void;
}

/**
 * Subscribe to realtime events for a single chat ticket.
 * Events (shared with the backend socket layer): new_message, ticket_updated,
 * ticket:assigned, ticket:read, ticket:typing.
 */
export function useChat({
  ticketId,
  onNewMessage,
  onStatusChange,
  onAssignmentChange,
  onRead,
  onTyping,
}: UseChatOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const accessToken = useSelector(selectAccessToken);
  const joined = useRef(false);

  const refs = {
    onNewMessage: useRef(onNewMessage),
    onStatusChange: useRef(onStatusChange),
    onAssignmentChange: useRef(onAssignmentChange),
    onRead: useRef(onRead),
    onTyping: useRef(onTyping),
  };
  refs.onNewMessage.current = onNewMessage;
  refs.onStatusChange.current = onStatusChange;
  refs.onAssignmentChange.current = onAssignmentChange;
  refs.onRead.current = onRead;
  refs.onTyping.current = onTyping;

  useEffect(() => {
    if (!accessToken || !ticketId) return;
    if (joined.current) return;

    const s = getSocket(accessToken);

    const handleConnect = () => {
      joined.current = true;
      s.emit('join_ticket_room', ticketId);
    };
    const handleDisconnect = () => {
      joined.current = false;
    };
    const handleError = (err: Error) => {
      console.error('[socket] connect_error', err.message);
    };
    const handleNew = (m: ChatMessage) => refs.onNewMessage.current?.(m);
    const handleUpdated = (d: { status: string }) => refs.onStatusChange.current?.(d.status);
    const handleAssigned = (d: { assignedTo: string }) => refs.onAssignmentChange.current?.(d.assignedTo);
    const handleRead = (d: { userId: string; readAt: string }) => refs.onRead.current?.(d);
    const handleTyping = (d: { userId: string; isTyping: boolean }) => refs.onTyping.current?.(d);

    s.on('connect', handleConnect);
    if (s.connected) handleConnect();
    s.on('disconnect', handleDisconnect);
    s.on('connect_error', handleError);
    s.on('new_message', handleNew);
    s.on('ticket_updated', handleUpdated);
    s.on('ticket:assigned', handleAssigned);
    s.on('ticket:read', handleRead);
    s.on('ticket:typing', handleTyping);

    setSocket(s);

    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      s.off('connect_error', handleError);
      s.off('new_message', handleNew);
      s.off('ticket_updated', handleUpdated);
      s.off('ticket:assigned', handleAssigned);
      s.off('ticket:read', handleRead);
      s.off('ticket:typing', handleTyping);
      joined.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, ticketId]);

  const emitTyping = useCallback(
    (isTyping: boolean) => socket?.emit('ticket:typing', { ticketId, isTyping }),
    [socket, ticketId],
  );
  const emitRead = useCallback(() => socket?.emit('ticket:read', { ticketId }), [socket, ticketId]);

  return { socket, emitTyping, emitRead };
}

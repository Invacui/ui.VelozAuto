import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/auth.slice';
import { getSocket } from '@/lib/socket';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Subscribe staff sessions to the admin notification room events the backend
 * emits (`request:new`, `request:updated`, `ticket:new`, `new_message`,
 * `admin:notification`). Side effects: toast + react-query invalidation so the
 * relevant tables refresh. No-op for anonymous / non-staff users.
 */
export function useAdminSocket(enabled: boolean) {
  const accessToken = useAppSelector(selectAccessToken);
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled || !accessToken) return;
    const s = getSocket(accessToken);

    const onRequestNew = (d: { type: string; id: string; vehicle?: string }) => {
      const label = d.type === 'SELL_REQUEST' ? 'New sell request' : 'New buy request';
      toast.info(label, { description: 'A new request needs your attention.' });
      qc.invalidateQueries({ queryKey: ['buyRequests'] });
      qc.invalidateQueries({ queryKey: ['sellRequests'] });
      qc.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
    };
    const onRequestUpdated = () => {
      qc.invalidateQueries({ queryKey: ['buyRequests'] });
      qc.invalidateQueries({ queryKey: ['sellRequests'] });
      qc.invalidateQueries({ queryKey: queryKeys.admin.dashboard() });
    };
    const onTicketNew = (d: { id: string; subject: string }) => {
      toast.info('New chat ticket', { description: d.subject });
      qc.invalidateQueries({ queryKey: ['chat'] });
    };
    const onNewMessage = (d: { ticketId: string }) => {
      qc.invalidateQueries({ queryKey: ['chat'] });
      if (d?.ticketId) qc.invalidateQueries({ queryKey: queryKeys.chat.messages(d.ticketId) });
    };
    const onNotification = () => {
      qc.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    };

    s.on('request:new', onRequestNew);
    s.on('request:updated', onRequestUpdated);
    s.on('ticket:new', onTicketNew);
    s.on('new_message', onNewMessage);
    s.on('admin:notification', onNotification);

    return () => {
      s.off('request:new', onRequestNew);
      s.off('request:updated', onRequestUpdated);
      s.off('ticket:new', onTicketNew);
      s.off('new_message', onNewMessage);
      s.off('admin:notification', onNotification);
    };
  }, [enabled, accessToken, qc]);
}

export default useAdminSocket;

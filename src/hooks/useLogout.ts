import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '@/store/hooks';
import { clearAuth } from '@/store/auth.slice';
import { logout as logoutApi } from '@/services/auth.service';
import { disconnectSocket } from '@/lib/socket';
import { ROUTES } from '@/constants/routes';

/** Clear Redux auth + storage, notify the backend (best-effort), drop the
 *  query cache and the socket, and redirect to login. */
export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useCallback(() => {
    logoutApi().catch(() => {});
    disconnectSocket();
    dispatch(clearAuth());
    queryClient.clear();
    navigate(ROUTES.login);
  }, [dispatch, navigate, queryClient]);
}

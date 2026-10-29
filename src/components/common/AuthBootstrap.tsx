import { useEffect } from 'react';
import { getMe } from '@/services/auth.service';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAccessToken, updateUser } from '@/store/auth.slice';

/**
 * On app load, sync the Redux user with the freshest backend profile
 * (`GET /auth/me`). The stored user is whatever was returned at login time and
 * can drift (e.g. a profileImage added later), so we refresh it once whenever a
 * token is present. Failures are handled by the axios interceptor
 * (refresh, or clear on a hard 401).
 */
export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;

    getMe()
      .then((user) => {
        if (!cancelled) dispatch(updateUser(user));
      })
      .catch(() => {
        /* ignore — handled by the interceptor (refresh/clear) */
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, accessToken]);

  return null;
}

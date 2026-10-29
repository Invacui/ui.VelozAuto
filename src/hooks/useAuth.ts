import { useAppSelector } from '@/store/hooks';
import { selectUser, selectIsAuthenticated, selectUserRole } from '@/store/auth.slice';
import { useLogout } from './useLogout';

/** Convenience accessor for auth state used across the app. */
export function useAuth() {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectUserRole);
  const logout = useLogout();

  return {
    user,
    role,
    isAuthenticated,
    isAdmin: role === 'ADMIN',
    isStaff: role === 'ADMIN' || role === 'EMPLOYEE',
    logout,
  };
}

import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/store/auth.slice';
import { ROUTES } from '@/constants/routes';
import type { UserRole } from '@/types/auth.types';

/** Landing route for a role — used by guards and post-login redirects. */
export const roleHome = (role?: UserRole | null): string => {
  if (role === 'ADMIN' || role === 'EMPLOYEE') return ROUTES.admin.root;
  return ROUTES.account.root;
};

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate to={`${ROUTES.login}?redirect=${encodeURIComponent(location.pathname)}`} replace />
    );
  }
  return <>{children}</>;
}

interface RoleGuardProps {
  roles: UserRole[];
  children: React.ReactNode;
}

/** Restricts a subtree to a set of roles; other roles go to their own home. */
export function RoleGuard({ roles, children }: RoleGuardProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate to={`${ROUTES.login}?redirect=${encodeURIComponent(location.pathname)}`} replace />
    );
  }
  if (!user || !roles.includes(user.role)) {
    return <Navigate to={roleHome(user?.role)} replace />;
  }
  return <>{children}</>;
}

export function StaffGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard roles={['ADMIN', 'EMPLOYEE']}>{children}</RoleGuard>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard roles={['ADMIN']}>{children}</RoleGuard>;
}

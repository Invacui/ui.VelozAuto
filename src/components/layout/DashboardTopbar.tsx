import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Home, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/auth.slice';
import { toggleSidebar } from '@/store/ui.slice';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '@/services/admin.service';
import { queryKeys } from '@/lib/queryKeys';
import { ROUTES } from '@/constants/routes';
import { useLogout } from '@/hooks/useLogout';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage, relativeTime } from '@/lib/utils';

interface DashboardTopbarProps {
  settingsRoute?: string;
}

export function DashboardTopbar({ settingsRoute = ROUTES.admin.settings }: DashboardTopbarProps) {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const handleLogout = useLogout();
  const { isAdmin } = useAuth();

  const { data } = useQuery({
    queryKey: queryKeys.admin.notifications({ limit: 8 }),
    queryFn: () => listNotifications({ limit: 8 }),
    refetchInterval: 60_000,
    enabled: isAdmin,
  });

  const notifications = data?.data ?? [];
  const unread = notifications.filter((n) => !n.isRead).length;

  const readMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.notifications({ limit: 8 }) }),
  });
  const readAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.notifications({ limit: 8 }) }),
    onError: (e) => getApiErrorMessage(e),
  });

  const initials = user?.name
    ?.split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex h-16 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => dispatch(toggleSidebar())}>
          <Menu className="h-5 w-5" />
        </Button>
        <Link to={ROUTES.home} className="rounded p-2 text-muted-foreground hover:bg-muted" title="Go to home">
          <Home className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                  {unread}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm font-semibold">Notifications</span>
              {unread > 0 && (
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => readAllMutation.mutate()}
                >
                  Mark all read
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">No notifications</p>
            ) : (
              notifications.map((n) => (
                <DropdownMenuItem
                  key={n._id || n.id}
                  className="flex flex-col items-start gap-0.5 py-2"
                  onClick={() => {
                    if (!n.isRead) readMutation.mutate(n._id || n.id!);
                    if (n.link) navigate(n.link);
                  }}
                >
                  <span className="flex w-full items-center gap-2">
                    {!n.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    <span className="truncate text-sm font-medium">{n.title}</span>
                  </span>
                  {n.body && <span className="line-clamp-2 text-xs text-muted-foreground">{n.body}</span>}
                  <span className="text-[10px] text-muted-foreground">{relativeTime(n.createdAt)}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-7 w-7">
                {user?.profileImage && <AvatarImage src={user.profileImage} alt={user.name} />}
                <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm sm:inline">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate(settingsRoute)}>Settings</DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default DashboardTopbar;

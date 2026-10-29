import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, ShoppingBag, MessagesSquare, MoreHorizontal } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

interface TabItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  match: (pathname: string) => boolean;
}

const adminTabs: TabItem[] = [
  { to: ROUTES.admin.root, icon: LayoutDashboard, label: 'Home', match: (p) => p === ROUTES.admin.root },
  {
    to: ROUTES.admin.vehicles,
    icon: Car,
    label: 'Vehicles',
    match: (p) => p.startsWith('/admin/vehicles'),
  },
  {
    to: ROUTES.admin.buyRequests,
    icon: ShoppingBag,
    label: 'Requests',
    match: (p) => p.startsWith('/admin/buy-requests') || p.startsWith('/admin/sell-requests'),
  },
  { to: ROUTES.admin.chat, icon: MessagesSquare, label: 'Chat', match: (p) => p.startsWith('/admin/chat') },
  {
    to: ROUTES.admin.masterData,
    icon: MoreHorizontal,
    label: 'More',
    match: (p) =>
      [
        '/admin/master-data',
        '/admin/users',
        '/admin/banners',
        '/admin/testimonials',
        '/admin/faq',
        '/admin/seo',
        '/admin/contacts',
        '/admin/legal',
        '/admin/settings',
      ].some((x) => p.startsWith(x)),
  },
];

/** Mobile bottom navigation for the admin dashboard. */
export function BottomTabBar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t bg-card py-2 md:hidden">
      {adminTabs.map((tab) => {
        const active = tab.match(pathname);
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 transition active:scale-95',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default BottomTabBar;

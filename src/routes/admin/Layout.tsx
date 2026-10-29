import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Car, ShoppingBag, BadgeIndianRupee, Database, Users,
  MessagesSquare, Image, Quote, HelpCircle, Search, Mail, Scale, Settings,
} from 'lucide-react';
import { DashboardSidebar, type SidebarNavItem } from '@/components/layout/DashboardSidebar';
import { DashboardTopbar } from '@/components/layout/DashboardTopbar';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { useAdminSocket } from '@/hooks/useAdminSocket';
import { ROUTES } from '@/constants/routes';

const mainNavItems: SidebarNavItem[] = [
  { to: ROUTES.admin.dashboard, icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: ROUTES.admin.vehicles, icon: Car, label: 'Vehicles' },
  { to: ROUTES.admin.buyRequests, icon: ShoppingBag, label: 'Buy Requests' },
  { to: ROUTES.admin.sellRequests, icon: BadgeIndianRupee, label: 'Sell Requests' },
  { to: ROUTES.admin.masterData, icon: Database, label: 'Master Data' },
  { to: ROUTES.admin.users, icon: Users, label: 'Users' },
  { to: ROUTES.admin.chat, icon: MessagesSquare, label: 'Chat' },
];

const bottomNavItems: SidebarNavItem[] = [
  { to: ROUTES.admin.banners, icon: Image, label: 'Banners' },
  { to: ROUTES.admin.testimonials, icon: Quote, label: 'Testimonials' },
  { to: ROUTES.admin.faq, icon: HelpCircle, label: 'FAQ' },
  { to: ROUTES.admin.seo, icon: Search, label: 'SEO' },
  { to: ROUTES.admin.contacts, icon: Mail, label: 'Contacts' },
  { to: ROUTES.admin.legal, icon: Scale, label: 'Legal pages' },
  { to: ROUTES.admin.settings, icon: Settings, label: 'Settings' },
];

/**
 * Admin / staff dashboard shell. Access is enforced by StaffGuard in the route
 * tree; the sidebar nav itself is role-agnostic (admins see everything).
 */
export function AdminLayout() {
  useAdminSocket(true);

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <ScrollToTop />
      <DashboardSidebar
        brand="Veloz Auto"
        brandTo={ROUTES.admin.dashboard}
        mainNavItems={mainNavItems}
        bottomNavItems={bottomNavItems}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto p-4 pb-20 scrollbar-thin md:p-6 md:pb-6">
          <Outlet />
        </main>
      </div>
      <BottomTabBar />
    </div>
  );
}

export default AdminLayout;

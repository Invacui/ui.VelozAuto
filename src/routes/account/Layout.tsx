import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Car, Heart, MessagesSquare, UserCog,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { PhoneVerificationDialog } from '@/components/auth/PhoneVerificationDialog';
import { PhoneOnboardingDialog } from '@/components/auth/PhoneOnboardingDialog';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

const NAV = [
  { to: ROUTES.account.overview, label: 'Overview', icon: LayoutDashboard, end: true },
  { to: ROUTES.account.buyRequests, label: 'My Buy Requests', icon: ShoppingBag },
  { to: ROUTES.account.sellRequests, label: 'My Sell Requests', icon: Car },
  { to: ROUTES.account.chats, label: 'Chats', icon: MessagesSquare },
  { to: ROUTES.account.profile, label: 'Profile', icon: UserCog },
];

/** Logged-in user shell: header, account sidebar, routed content. */
export function AccountLayout() {
  const { user } = useAuth();
  const initials = user?.name
    ?.split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
          <aside className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Avatar className="h-11 w-11">
                {user?.profileImage && <AvatarImage src={user.profileImage} alt={user.name} />}
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden flex-col gap-1 lg:flex">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                      isActive && 'bg-muted text-foreground',
                    )
                  }
                >
                  <Icon className="h-4 w-4" /> {label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile horizontal nav */}
            <nav className="flex gap-1 overflow-x-auto pb-1 lg:hidden">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium',
                      isActive ? 'border-primary bg-primary/5 text-primary' : 'text-muted-foreground',
                    )
                  }
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
      <PhoneVerificationDialog />
      <PhoneOnboardingDialog />
    </div>
  );
}

export default AccountLayout;

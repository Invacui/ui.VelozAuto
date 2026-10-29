import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut } from 'lucide-react';
import logoImage from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar, setSidebarOpen, selectSidebarOpen } from '@/store/ui.slice';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useLogout } from '@/hooks/useLogout';
import { cn } from '@/lib/utils';

export interface SidebarNavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  end?: boolean;
}

interface DashboardSidebarProps {
  brand: string;
  brandTo: string;
  mainNavItems: SidebarNavItem[];
  bottomNavItems: SidebarNavItem[];
}

/**
 * Collapsible dashboard sidebar shared by the admin/staff layouts. The nav
 * lists are injected by the caller so each side can show its own routes while
 * keeping the collapse / tooltip / logout behaviour in one place.
 *
 * On mobile (< md) the desktop aside stays hidden and the hamburger in the
 * topbar opens the same nav as a slide-in Sheet drawer.
 */
export function DashboardSidebar({ brand, brandTo, mainNavItems, bottomNavItems }: DashboardSidebarProps) {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectSidebarOpen);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const handleLogout = useLogout();

  const logoutButton = (
    <button
      onClick={handleLogout}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive',
        !isOpen && 'justify-center px-0',
      )}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {isOpen && <span>Log out</span>}
    </button>
  );

  const brandButton = (expanded: boolean) => (
    <button onClick={() => navigate(brandTo)} className="flex min-w-0 items-center gap-2 font-bold text-primary">
      <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        <img src={logoImage} alt={brand} className="h-full w-full scale-150 object-contain" />
      </span>
      {expanded && <span className="truncate text-base">{brand}</span>}
    </button>
  );

  const mainNav = (expanded: boolean) => (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4 scrollbar-thin">
      {mainNavItems.map((item) => (
        <SidebarNavItemRow key={item.to} item={item} isOpen={expanded} />
      ))}
      {!expanded && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleSidebar())}
          className="mx-auto mt-2 h-6 w-6 rounded-full border bg-card shadow-sm"
        >
          <ChevronLeft className="h-3 w-3 rotate-180" />
        </Button>
      )}
    </nav>
  );

  const bottomNav = (expanded: boolean) => (
    <div className={cn('border-t', !expanded && 'mx-auto')}>
      {bottomNavItems.map((item) => (
        <SidebarNavItemRow key={item.to} item={item} isOpen={expanded} />
      ))}
    </div>
  );

  const logoutBlock = (expanded: boolean) => (
    <div className={cn('border-t py-2', !expanded && 'mx-auto')}>
      {expanded ? (
        logoutButton
      ) : (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{logoutButton}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs">Log out</TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'hidden h-full flex-col border-r bg-card transition-all duration-300 md:flex',
          isOpen ? 'w-56' : 'w-16',
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {brandButton(isOpen)}
          {isOpen && (
            <Button variant="ghost" size="icon" onClick={() => dispatch(toggleSidebar())} className="ml-auto">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {mainNav(isOpen)}
        {bottomNav(isOpen)}
        {logoutBlock(isOpen)}
      </aside>

      {/* Mobile drawer — opened by the hamburger in DashboardTopbar. */}
      <Sheet open={isOpen && isMobile} onOpenChange={(open) => dispatch(setSidebarOpen(open))}>
        <SheetContent side="left" className="w-72 overflow-y-auto p-0 scrollbar-thin">
          <SheetTitle className="sr-only">{brand} menu</SheetTitle>
          <div className="flex h-full flex-col" onClick={() => dispatch(setSidebarOpen(false))}>
            <div className="flex h-16 shrink-0 items-center px-4 pr-12">{brandButton(true)}</div>
            {mainNav(true)}
            {bottomNav(true)}
            {logoutBlock(true)}
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}

function SidebarNavItemRow({ item, isOpen }: { item: SidebarNavItem; isOpen: boolean }) {
  const content = (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
        )
      }
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {isOpen && <span>{item.label}</span>}
    </NavLink>
  );

  if (!isOpen) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>
      </Tooltip>
    );
  }
  return content;
}

export default DashboardSidebar;

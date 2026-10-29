import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Car,
  Bike,
  Bus,
  Truck,
  Caravan,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/hooks/useLogout";
import { ROUTES } from "@/constants/routes";
import { VEHICLE_CATEGORIES } from "@/constants/vehicleEnums";
import { getSiteSettings } from "@/services/content.service";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo.png";

const NAV = [
  { to: ROUTES.vehicles, label: "Buy" },
  { to: ROUTES.sell, label: "Sell" },
  { to: ROUTES.emiCalculator, label: "EMI Calculator" },
  { to: ROUTES.compare, label: "Compare" },
  { to: ROUTES.about, label: "About" },
  { to: ROUTES.contact, label: "Contact" },
];

const USEFUL_LINKS = [
  { label: "FAQ", to: ROUTES.faq },
  { label: "Privacy policy", to: ROUTES.privacy },
  { label: "Terms of use", to: ROUTES.terms },
];

const CATEGORY_ICONS: Record<string, typeof Car> = {
  PASSENGER_CAR: Car,
  TWO_WHEELER: Bike,
  THREE_WHEELER: Bus,
  COMMERCIAL: Truck,
  CARAVAN_MOTORHOME: Caravan,
};

type MenuAction = { kind: "link"; to: string } | { kind: "logout" };

interface MenuItem {
  key: string;
  label: string;
  action: MenuAction;
}

/** Staggered entrance for overlay items — CSS replacement for the GSAP timeline. */
const stagger = (open: boolean, index: number): CSSProperties =>
  open ? { transitionDelay: `${0.15 + index * 0.07}s` } : { transitionDelay: "0s" };

export function Header() {
  const { pathname } = useLocation();
  const { user, isStaff, isAuthenticated, logout } = useAuth();
  const handleLogout = useLogout();
  const isLanding = pathname === ROUTES.home;

  const [scrolled, setScrolled] = useState(false);
  const [inHero, setInHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const { data: settings } = useQuery({
    queryKey: queryKeys.content.siteSettings(),
    queryFn: getSiteSettings,
    staleTime: 10 * 60_000,
  });
  const social = settings?.social || {};

  // Transparent-over-hero (landing) vs. blurred/white bar — mirrors ui-mrt.
  useEffect(() => {
    if (!isLanding) {
      setInHero(false);
      return;
    }
    const sync = () => {
      const el = document.getElementById("home-hero");
      const bottom = el ? el.getBoundingClientRect().bottom : 0;
      setScrolled(window.scrollY > 10);
      setInHero(bottom > 0);
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [isLanding]);

  // Overlay: lock scroll, close on route change / Escape.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const textColor =
    isLanding && inHero ? "text-gray-700 hover:text-gray-900" : "text-gray-600 hover:text-gray-900";

  const bgColor = !isLanding
    ? "bg-white shadow-sm"
    : inHero
    ? "bg-white/50 backdrop-blur-lg"
    : "bg-white/70 backdrop-blur-lg shadow-sm";

  const menuItems: MenuItem[] = [
    { key: "home", label: "Home", action: { kind: "link", to: ROUTES.home } },
    ...NAV.map((item) => ({
      key: item.to,
      label: item.label,
      action: { kind: "link", to: item.to } as MenuAction,
    })),
    { key: "wishlist", label: "Wishlist", action: { kind: "link", to: ROUTES.wishlist } },
    ...(isStaff
      ? [
          {
            key: "dashboard",
            label: "Dashboard",
            action: { kind: "link", to: ROUTES.admin.root } as MenuAction,
          },
        ]
      : isAuthenticated
      ? [
          {
            key: "account",
            label: "My account",
            action: { kind: "link", to: ROUTES.account.overview } as MenuAction,
          },
        ]
      : []),
    ...(isAuthenticated
      ? [{ key: "logout", label: "Log out", action: { kind: "logout" } as MenuAction }]
      : []),
  ];

  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const renderMenuItem = (item: MenuItem, index: number) => {
    const className =
      "w-fit py-3 font-Rubik text-3xl font-semibold tracking-wide transition-colors duration-300 sm:text-[34px]";

    return (
      <li
        key={item.key}
        data-menu-item
        style={stagger(menuOpen, index)}
        className={cn(
          "relative list-none transition-all duration-500 ease-out",
          menuOpen ? "translate-y-0 opacity-100 blur-0" : "translate-y-7 opacity-0 blur-[10px]"
        )}>
        <div className="group relative">
          <div className="relative flex items-center gap-3 transition-all duration-400 ease-menu-ease group-hover:pl-6">
            <span className="absolute left-0 h-2.5 w-2.5 scale-0 rounded-full bg-white/40 transition-transform duration-400 ease-menu-ease group-hover:scale-100 group-hover:bg-primary" />
            {item.action.kind === "logout" ? (
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  handleLogout();
                }}
                className={cn(className, "text-white/80 hover:text-primary")}>
                <LogOut className="mr-4 inline-block h-6 w-6 align-middle" />
                {item.label}
              </button>
            ) : (
              <NavLink
                to={item.action.to}
                onClick={closeMenu}
                end={item.action.to === ROUTES.home}
                className={({ isActive }) =>
                  cn(className, isActive ? "text-primary" : "text-white/80 hover:text-primary")
                }>
                {item.label}
              </NavLink>
            )}
          </div>
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-px w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full"
          />
        </div>
      </li>
    );
  };

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!menuOpen}
      className={cn(
        "invisible fixed inset-0 z-[70] overflow-y-auto bg-black transition-all duration-500 ease-out",
        menuOpen ? "visible opacity-100" : "invisible opacity-0"
      )}>
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col px-4 py-6 sm:px-6 md:px-10 lg:px-8">
        {/* Close */}
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMenu}
            className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border border-white/80 text-white transition-colors hover:text-primary">
            <X className="h-8 w-8 font-light" />
          </button>
        </div>

        <div className="flex flex-wrap gap-14 lg:gap-0">
          {/* ── LEFT: profile + big nav ── */}
          <div className="flex flex-1 flex-col lg:col-span-5 lg:pr-12">
            {user && (
              <div
                data-menu-item
                style={stagger(menuOpen, 0)}
                className="mb-10 flex items-center gap-4 transition-all duration-500 ease-out">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-2xl font-semibold text-white">
                    {initials || <UserIcon className="h-6 w-6" />}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-white">{user.name}</p>
                  <p className="truncate text-sm text-white/60">{user.email}</p>
                </div>
              </div>
            )}

            <p className="mb-1 ml-12 text-xs uppercase tracking-[0.4em] text-white/40">Navigate</p>

            <nav aria-label="Menu" className="flex w-full flex-col border-white/10 sm:w-1/2">
              <ul className="m-0 flex list-none flex-col gap-0 p-0">
                {menuItems.map((item, i) => renderMenuItem(item, user ? i + 1 : i))}
              </ul>
            </nav>
          </div>

          {/* Mid border */}
          <span className="hidden h-screen border-l border-white/10 lg:block" />

          {/* ── RIGHT: categories + links + account + contact ── */}
          <div className="relative h-fit flex-1 py-4 lg:col-span-7 lg:py-24 lg:pl-12">
            <div className="flex flex-wrap gap-12">
              <div
                data-menu-item
                style={stagger(menuOpen, 0)}
                className="transition-all duration-500 ease-out sm:col-span-8">
                <h6 className="mb-6 text-xs uppercase tracking-[0.4em] text-white/40">
                  Browse by category
                </h6>
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {VEHICLE_CATEGORIES.map((c) => {
                    const Icon = CATEGORY_ICONS[c.value] || Car;
                    return (
                      <li key={c.value} className="m-0 list-none p-0">
                        <Link
                          to={`${ROUTES.vehicles}?category=${c.value}`}
                          onClick={closeMenu}
                          className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/10">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/70 transition-colors group-hover:bg-primary group-hover:text-white">
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-base font-medium text-white/90 group-hover:text-white">
                              {c.label}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div
                data-menu-item
                style={stagger(menuOpen, 1)}
                className="transition-all duration-500 ease-out sm:col-span-4">
                <h6 className="mb-6 text-xs uppercase tracking-[0.4em] text-white/40">
                  Useful links
                </h6>
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {USEFUL_LINKS.map((link) => (
                    <li key={link.label} className="m-0 list-none p-0">
                      <NavLink
                        to={link.to}
                        onClick={closeMenu}
                        className="relative py-1.5 pl-1 text-xs font-semibold tracking-widest text-white/60 transition-colors duration-300 hover:text-primary">
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                data-menu-item
                style={stagger(menuOpen, 2)}
                className="flex items-end gap-4 transition-all duration-500 ease-out">
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook">
                    <Facebook className="h-12 w-12 rounded-full border p-2 text-white/60 transition-colors hover:text-primary" />
                  </a>
                )}
                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter">
                    <Twitter className="h-12 w-12 rounded-full border p-2 text-white/60 transition-colors hover:text-primary" />
                  </a>
                )}
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram">
                    <Instagram className="h-12 w-12 rounded-full border p-2 text-white/60 transition-colors hover:text-primary" />
                  </a>
                )}
                {social.youtube && (
                  <a
                    href={social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube">
                    <Youtube className="h-12 w-12 rounded-full border p-2 text-white/60 transition-colors hover:text-primary" />
                  </a>
                )}
              </div>

              <div
                data-menu-item
                style={stagger(menuOpen, 3)}
                className="flex-1 transition-all duration-500 ease-out">
                <h6 className="mb-6 text-xs uppercase tracking-[0.4em] text-white/40">Account</h6>
                {isAuthenticated ? (
                  <ul className="m-0 flex list-none flex-col gap-1 p-0">
                    <li className="m-0 list-none p-0">
                      <NavLink
                        to={isStaff ? ROUTES.admin.root : ROUTES.account.overview}
                        onClick={closeMenu}
                        className="relative py-1.5 pl-1 text-xs font-semibold tracking-widest text-white/60 transition-colors duration-300 hover:text-primary">
                        <LayoutDashboard className="mr-2 inline-block h-3 w-3" />
                        {isStaff ? "Dashboard" : "My account"}
                      </NavLink>
                    </li>
                    <li className="m-0 list-none p-0">
                      <button
                        type="button"
                        onClick={() => {
                          closeMenu();
                          handleLogout();
                        }}
                        className="relative py-1.5 pl-1 text-xs font-semibold tracking-widest text-white/60 transition-colors duration-300 hover:text-primary">
                        <LogOut className="mr-2 inline-block h-3 w-3" />
                        Log out
                      </button>
                    </li>
                  </ul>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button asChild className="w-32">
                      <Link to={ROUTES.login} onClick={closeMenu}>
                        Log in
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="w-32 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                      <Link to={ROUTES.signup} onClick={closeMenu}>
                        Sign up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div
              data-menu-item
              style={stagger(menuOpen, 4)}
              className="mt-12 border-t border-white/10 pt-8 transition-all duration-500 ease-out">
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h6 className="mb-3 text-xs uppercase tracking-[0.4em] text-white/40">
                    Head Office
                  </h6>
                  <p className="text-sm leading-relaxed text-white/60">
                    {settings?.address || "Moosapet, Hyderabad, Telangana, India"}
                  </p>
                </div>
                <div>
                  <h6 className="mb-3 text-xs uppercase tracking-[0.4em] text-white/40">Contact</h6>
                  {settings?.email && (
                    <a
                      href={`mailto:${settings.email}`}
                      className="block text-sm text-white/60 transition-colors hover:text-primary">
                      <Mail className="mr-2 inline-block h-4 w-4" />
                      {settings.email}
                    </a>
                  )}
                  {settings?.phone && (
                    <p className="mt-1 text-sm text-white/60">
                      <Phone className="mr-2 inline-block h-4 w-4" />
                      {settings.phone}
                    </p>
                  )}
                  {settings?.address && (
                    <p className="mt-1 text-sm text-white/60">
                      <MapPin className="mr-2 inline-block h-4 w-4" />
                      {settings.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <nav
        className={cn(
          isLanding
            ? "fixed inset-x-0 z-50 transition-all duration-150 ease-out"
            : "sticky top-0 z-40 transition-all",
          bgColor
        )}>
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to={ROUTES.home} className="flex shrink-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#017BFF]  sm:size-10">
              <img
                src={logoImage}
                alt="Veloz Auto"
                className="scale-150 h-full w-full object-contain [filter:invert(37%)_sepia(93%)_saturate(5043%)_hue-rotate(200deg)_brightness(101%)_contrast(105%)]"
              />
            </span>
            <span
              className={cn(
                "hidden font-Incompleeta mb-1.5 text-xl leading-none tracking-wide transition-colors duration-300 sm:flex sm:h-16 sm:items-center !text-primary ",
                textColor
              )}>
              VELOZ AUTO
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="group relative py-1.5 text-sm font-medium">
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "transition-colors duration-300",
                        isActive ? "text-primary" : textColor
                      )}>
                      {item.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute -bottom-0.5 left-1/2 h-[3px] w-1/3 -translate-x-1/2 rounded-full bg-primary",
                        "origin-center transition-all duration-300 ease-out",
                        isActive
                          ? "opacity-100 scale-x-100"
                          : "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100"
                      )}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
            {!isAuthenticated && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                  className={cn(
                    "hidden sm:inline-flex",
                    isLanding && inHero && "hover:bg-white/60"
                  )}>
                  <Link to={ROUTES.login}>Log in</Link>
                </Button>
                <Button size="sm" asChild className=" hidden sm:inline-flex">
                  <Link to={ROUTES.signup}>Sign up</Link>
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className={cn("relative z-[80]", textColor)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Portaled to <body> so no ancestor CSS can trap this fixed overlay. */}
      {typeof document !== "undefined" && createPortal(overlay, document.body)}
    </>
  );
}

export default Header;

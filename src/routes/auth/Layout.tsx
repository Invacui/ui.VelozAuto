import { Link, Outlet } from 'react-router-dom';
import { ShieldCheck, BadgeCheck, TrendingUp } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import logoImage from '@/assets/logo.png';

const perks = [
  { icon: BadgeCheck, text: '200+ quality checks on every inspected vehicle' },
  { icon: ShieldCheck, text: 'Transparent pricing with no hidden charges' },
  { icon: TrendingUp, text: 'Instant offers when you sell your vehicle' },
];

/** Split-screen shell for the auth pages (login / signup / reset). */
export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Link to={ROUTES.home} className="flex items-center gap-3">
          <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 p-0.5">
            <img src={logoImage} alt="Veloz Auto" className="h-full w-full object-contain" />
          </span>
          <span className="flex h-14 items-center font-Incompleeta text-2xl leading-none tracking-wide">
            VELOZ AUTO
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our{' '}
          <Link to={ROUTES.terms} className="underline hover:text-foreground">Terms</Link> and{' '}
          <Link to={ROUTES.privacy} className="underline hover:text-foreground">Privacy Policy</Link>.
        </p>
      </div>

      {/* Right: brand panel */}
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-black/30" />
        <div className="relative flex h-full flex-col justify-center px-14 text-primary-foreground">
          <h2 className="max-w-md text-3xl font-bold leading-tight">
            India’s trusted marketplace for used vehicles.
          </h2>
          <p className="mt-4 max-w-md text-primary-foreground/80">
            Buy verified cars, bikes, commercial vehicles and caravans — or sell yours with a free
            inspection and an instant offer.
          </p>
          <ul className="mt-8 space-y-4">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;

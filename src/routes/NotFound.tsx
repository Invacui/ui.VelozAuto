import { Link } from 'react-router-dom';
import { Car, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/common/SEO';
import { ROUTES } from '@/constants/routes';

/** 404 page for unmatched routes. */
export default function NotFound() {
  return (
    <>
      <SEO title="Page not found" noindex />
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Car className="h-8 w-8" />
        </span>
        <p className="text-5xl font-extrabold tracking-tight">404</p>
        <h1 className="mt-2 text-xl font-bold">This page took a wrong turn</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link to={ROUTES.home}><Home className="mr-1 h-4 w-4" /> Back home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={ROUTES.vehicles}><Search className="mr-1 h-4 w-4" /> Browse vehicles</Link>
          </Button>
        </div>
      </div>
    </>
  );
}

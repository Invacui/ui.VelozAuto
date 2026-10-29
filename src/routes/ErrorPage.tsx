import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { AlertTriangle, Home, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/common/SEO';
import { ROUTES } from '@/constants/routes';

/** Route-level error boundary rendered by react-router on thrown errors. */
export default function ErrorPage() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : undefined;
  const message = isRouteErrorResponse(error)
    ? error.statusText || 'Something went wrong.'
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.';

  return (
    <>
      <SEO title="Something went wrong" noindex />
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-8 w-8" />
        </span>
        <p className="text-4xl font-extrabold tracking-tight">{status ?? 'Error'}</p>
        <h1 className="mt-2 text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => window.location.reload()}>
            <RotateCw className="mr-1 h-4 w-4" /> Reload
          </Button>
          <Button variant="outline" asChild>
            <Link to={ROUTES.home}><Home className="mr-1 h-4 w-4" /> Back home</Link>
          </Button>
        </div>
      </div>
    </>
  );
}

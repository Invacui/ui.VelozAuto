import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, MailCheck, MailWarning } from 'lucide-react';
import { verifyEmail, resendVerification } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

type Status = 'verifying' | 'success' | 'error' | 'awaiting';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'awaiting');
  const [message, setMessage] = useState('');
  const ran = useRef(false);

  const { mutate: verify } = useMutation({
    mutationFn: (t: string) => verifyEmail(t),
    onSuccess: () => {
      setStatus('success');
      toast.success('Email verified!');
    },
    onError: (err) => {
      setStatus('error');
      setMessage(getApiErrorMessage(err, 'This verification link is invalid or has expired.'));
    },
  });

  const { mutate: resend, isPending: resending } = useMutation({
    mutationFn: () => resendVerification(),
    onSuccess: () => toast.success('Verification email sent. Check your inbox.'),
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not resend the email')),
  });

  useEffect(() => {
    if (token && !ran.current) {
      ran.current = true;
      verify(token);
    }
  }, [token, verify]);

  if (status === 'verifying') {
    return (
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Verifying your email…</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
          <MailCheck className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Email verified</h2>
        <p className="mt-2 text-sm text-muted-foreground">Your email address has been confirmed.</p>
        <Button asChild className="mt-6"><Link to={ROUTES.home}>Go to home</Link></Button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <MailWarning className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Verification failed</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        {isAuthenticated && (
          <Button className="mt-6" onClick={() => resend()} disabled={resending}>
            {resending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : 'Resend verification email'}
          </Button>
        )}
        <div className="mt-3">
          <Link to={ROUTES.login} className="text-sm font-medium text-primary hover:underline">Back to sign in</Link>
        </div>
      </div>
    );
  }

  // awaiting — no token present
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <MailWarning className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">Verify your email</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        We&apos;ve sent a verification link to your inbox. Click it to activate your account.
      </p>
      {isAuthenticated && (
        <Button className="mt-6" onClick={() => resend()} disabled={resending}>
          {resending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : 'Resend verification email'}
        </Button>
      )}
      <div className="mt-3">
        <Link to={ROUTES.home} className="text-sm font-medium text-primary hover:underline">Continue anyway</Link>
      </div>
    </div>
  );
}

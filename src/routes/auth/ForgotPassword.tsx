import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, MailCheck } from 'lucide-react';
import { forgotPassword } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiErrorMessage } from '@/lib/utils';

const schema = z.object({ email: z.string().trim().email('Enter a valid email address') });
type Form = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: () => setSent(true),
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not send the reset email')),
  });

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
          <MailCheck className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Check your inbox</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          If an account exists for <span className="font-medium text-foreground">{getValues('email')}</span>,
          we&apos;ve emailed a link to reset your password.
        </p>
        <Button asChild variant="outline" className="mt-6"><Link to={ROUTES.login}>Back to sign in</Link></Button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">Forgot password?</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a link to reset it.
      </p>
      <form onSubmit={handleSubmit((d) => mutate(d.email))} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" className="mt-1.5 h-10" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <Button type="submit" size="lg" className="h-10 w-full" disabled={isPending}>
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : 'Send reset link'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link to={ROUTES.login} className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

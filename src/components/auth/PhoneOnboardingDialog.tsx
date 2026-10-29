import { useEffect, useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Phone } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/auth.slice';
import { useAuth } from '@/hooks/useAuth';
import { updateMe } from '@/services/auth.service';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { phoneSchema } from '@/lib/validations';
import { getApiErrorMessage } from '@/lib/utils';

const dismissKey = (userId: string) => `phone-prompt-dismissed:${userId}`;

/**
 * First-login prompt for accounts created through OAuth (or any account that
 * still has no mobile number). Dismissible for the current browser session.
 */
export function PhoneOnboardingDialog() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const [phone, setPhone] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    try {
      setDismissed(sessionStorage.getItem(dismissKey(user.id)) === '1');
    } catch {
      setDismissed(false);
    }
  }, [user?.id]);

  const { mutate, isPending } = useMutation({
    mutationFn: (value: string) => updateMe({ phone: value }),
    onSuccess: (updated) => {
      dispatch(updateUser(updated));
      toast.success('Mobile number saved');
    },
    onError: (err) => {
      const message = getApiErrorMessage(err, 'Could not save your mobile number');
      setError(message);
      toast.error(message);
    },
  });

  const open =
    isAuthenticated &&
    user?.role === 'USER' &&
    !user.phone &&
    !dismissed;

  if (!user || user.role !== 'USER') return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const result = phoneSchema.safeParse(phone.trim());
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Enter a valid mobile number');
      return;
    }
    mutate(result.data);
  };

  const handleLater = () => {
    try {
      sessionStorage.setItem(dismissKey(user.id), '1');
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Phone className="h-5 w-5" />
          </div>
          <DialogTitle className="text-base font-semibold">Add your mobile number</DialogTitle>
          <DialogDescription>
            We use your number for request updates and account security. You can change it later
            from your profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="onboarding-phone">Mobile number</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="rounded-md border bg-muted px-2.5 py-2 text-sm text-muted-foreground">+91</span>
              <Input
                id="onboarding-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-10"
              />
            </div>
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleLater} disabled={isPending}>
              Not now
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Save number'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PhoneOnboardingDialog;

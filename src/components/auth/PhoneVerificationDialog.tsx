import { useEffect, useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/auth.slice';
import { useAuth } from '@/hooks/useAuth';
import { sendPhoneOtp, verifyPhoneOtp } from '@/services/auth.service';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { phoneSchema } from '@/lib/validations';
import { getApiErrorMessage } from '@/lib/utils';

export function PhoneVerificationDialog() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, logout } = useAuth();
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [cooldown, setCooldown] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Kept behind a flag until the Meta WhatsApp integration ships.
  const verificationEnabled = import.meta.env.APP_PHONE_VERIFICATION_ENABLED === 'true';
  const open = Boolean(
    verificationEnabled && isAuthenticated && user?.role === 'USER' && !user.phoneVerified
  );

  useEffect(() => {
    setPhone(user?.phone ?? '');
  }, [user?.phone]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendMutation = useMutation({
    mutationFn: (value?: string) => sendPhoneOtp(value),
    onSuccess: (result) => {
      setError(null);
      if (result.alreadyVerified && user) {
        dispatch(updateUser({ ...user, phone: result.phone, phoneVerified: true }));
        toast.success('Your phone number is already verified.');
        return;
      }
      setStep('code');
      setCode('');
      setCooldown(60);
      setDevCode(result.devCode ?? null);
      toast.success(`Verification code sent to +91 ${result.phone}`);
    },
    onError: (err) => {
      const message = getApiErrorMessage(err, 'Could not send the verification code');
      setError(message);
      toast.error(message);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (value: string) => verifyPhoneOtp(value),
    onSuccess: (updatedUser) => {
      setError(null);
      dispatch(updateUser(updatedUser));
      toast.success('Phone number verified successfully.');
    },
    onError: (err) => {
      const message = getApiErrorMessage(err, 'Could not verify the code');
      setError(message);
      toast.error(message);
    },
  });

  if (!user || user.role !== 'USER') return null;

  const phoneResult = phoneSchema.safeParse(phone);
  const phoneError = phone.trim() && !phoneResult.success ? phoneResult.error.issues[0]?.message : null;
  const isPending = sendMutation.isPending || verifyMutation.isPending;

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!phoneResult.success) {
      setError(phoneResult.error.issues[0]?.message ?? 'Enter a valid mobile number');
      return;
    }
    sendMutation.mutate(phone.trim());
  };

  const handleVerify = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from WhatsApp');
      return;
    }
    verifyMutation.mutate(code);
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
            <ShieldCheck className="h-5 w-5" />
          </div>
          <DialogTitle className="text-base font-semibold">Verify your mobile number</DialogTitle>
          <DialogDescription>
            {step === 'phone'
              ? 'We use your number only for request updates and account security. Verify it to continue.'
              : `Enter the 6-digit code we sent to +91 ${phone} on WhatsApp.`}
          </DialogDescription>
        </DialogHeader>

        {step === 'phone' ? (
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <Label htmlFor="verify-phone">Mobile number</Label>
              <Input
                id="verify-phone"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="9876543210"
                className="mt-1.5 h-10"
                value={phone}
                onChange={(event) => setPhone(event.target.value.replace(/[^\d+]/g, '').slice(0, 13))}
                disabled={isPending}
              />
              {phoneError && <p className="mt-1 text-xs text-destructive">{phoneError}</p>}
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button type="submit" size="lg" className="h-10 w-full" disabled={isPending}>
              {sendMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending code...</>
              ) : (
                'Send verification code'
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Label htmlFor="verify-code">Verification code</Label>
              <Input
                id="verify-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                placeholder="123456"
                className="mt-1.5 h-10 text-center text-lg tracking-[0.4em]"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={isPending}
              />
            </div>

            {devCode && (
              <div className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                Development mode code: <span className="font-semibold text-foreground">{devCode}</span>
              </div>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button type="submit" size="lg" className="h-10 w-full" disabled={isPending || code.length !== 6}>
              {verifyMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
              ) : (
                'Verify number'
              )}
            </Button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => {
                  setStep('phone');
                  setCode('');
                  setDevCode(null);
                  setError(null);
                }}
                disabled={isPending}
              >
                Change number
              </button>
              <button
                type="button"
                className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                onClick={() => sendMutation.mutate(phone.trim())}
                disabled={isPending || cooldown > 0}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}

        <button
          type="button"
          onClick={logout}
          className="text-center text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Sign out
        </button>
      </DialogContent>
    </Dialog>
  );
}

export default PhoneVerificationDialog;

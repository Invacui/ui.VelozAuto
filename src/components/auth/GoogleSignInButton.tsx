import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { loadGoogleIdentity } from '@/lib/google';
import { cn } from '@/lib/utils';

interface GoogleSignInButtonProps {
  mode?: 'signin' | 'signup';
  disabled?: boolean;
  onCredential: (credential: string) => void;
}

export function GoogleSignInButton({
  mode = 'signin',
  disabled = false,
  onCredential,
}: GoogleSignInButtonProps) {
  const clientId = import.meta.env.APP_GOOGLE_CLIENT_ID;
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  callbackRef.current = onCredential;

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    loadGoogleIdentity()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const identity = window.google?.accounts?.id;
        if (!identity) {
          setError('Google Sign-In is unavailable right now.');
          return;
        }

        containerRef.current.innerHTML = '';
        identity.initialize({
          client_id: clientId,
          callback: (response) => callbackRef.current(response.credential),
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        identity.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: mode === 'signup' ? 'signup_with' : 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
          width: 320,
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError('Google Sign-In is unavailable right now.');
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, mode]);

  if (!clientId) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or continue with</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div
        className={cn(
          'mt-4 flex min-h-10 justify-center',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        {!ready && !error && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        <div ref={containerRef} />
      </div>

      {error && <p className="mt-2 text-center text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default GoogleSignInButton;

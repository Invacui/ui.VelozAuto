import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { login as loginApi, googleLogin as googleLoginApi } from '@/services/auth.service';
import type { LoginDto } from '@/types/auth.types';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/auth.slice';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getApiErrorMessage } from '@/lib/utils';
import { phoneSchema } from '@/lib/validations';
import { roleHome } from '@/guards/AuthGuard';

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Enter your email or mobile number')
    .refine(
      (value) => phoneSchema.safeParse(value).success || z.string().email().safeParse(value).success,
      'Enter a valid email or 10-digit mobile number'
    ),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const { mutate, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: (res) => {
      dispatch(setAuth({ user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken }));
      toast.success('Welcome back!');
      const redirect = searchParams.get('redirect');
      navigate(redirect || roleHome(res.user.role));
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Login failed')),
  });

  const { mutate: googleLogin, isPending: isGooglePending } = useMutation({
    mutationFn: googleLoginApi,
    onSuccess: (res) => {
      dispatch(setAuth({ user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken }));
      toast.success('Welcome back!');
      const redirect = searchParams.get('redirect');
      navigate(redirect || roleHome(res.user.role));
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Google sign-in failed')),
  });

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">Welcome back</h2>
      <p className="mt-1 text-sm text-muted-foreground">Sign in to your account to continue</p>

      <form
        onSubmit={handleSubmit((d) => {
          const isEmail = d.identifier.includes('@');
          const payload: LoginDto = {
            password: d.password,
            ...(isEmail ? { email: d.identifier } : { phone: d.identifier }),
          };
          mutate(payload);
        })}
        className="mt-6 space-y-4"
      >
        <div>
          <Label htmlFor="identifier">Email or mobile number</Label>
          <Input
            id="identifier"
            type="text"
            inputMode="email"
            autoComplete="username"
            placeholder="you@example.com or 9876543210"
            className="mt-1.5 h-10"
            {...register('identifier')}
          />
          {errors.identifier && <p className="mt-1 text-xs text-destructive">{errors.identifier.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to={ROUTES.forgotPassword} className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="h-10 pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" size="lg" className="h-10 w-full" disabled={isPending || isGooglePending}>
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : 'Sign in'}
        </Button>
      </form>

      <GoogleSignInButton
        mode="signin"
        disabled={isPending || isGooglePending}
        onCredential={(credential) => googleLogin(credential)}
      />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.signup} className="font-medium text-primary hover:underline">Sign up</Link>
      </p>
    </div>
  );
}

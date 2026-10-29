import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { register as registerApi, googleLogin as googleLoginApi } from '@/services/auth.service';
import type { RegisterDto } from '@/types/auth.types';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/auth.slice';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { phoneSchema } from '@/lib/validations';
import { getApiErrorMessage } from '@/lib/utils';
import { roleHome } from '@/guards/AuthGuard';

const signupSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is required'),
    email: z.string().trim().email('Enter a valid email address'),
    phone: phoneSchema,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/\d/, 'Include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const { mutate, isPending } = useMutation({
    mutationFn: registerApi,
    onSuccess: (res) => {
      dispatch(setAuth({ user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken }));
      toast.success('Account created successfully!');
      const redirect = searchParams.get('redirect');
      navigate(redirect || roleHome(res.user.role));
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Sign up failed')),
  });

  const { mutate: googleLogin, isPending: isGooglePending } = useMutation({
    mutationFn: googleLoginApi,
    onSuccess: (res) => {
      dispatch(setAuth({ user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken }));
      toast.success('Signed in with Google!');
      const redirect = searchParams.get('redirect');
      navigate(redirect || roleHome(res.user.role));
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Google sign-up failed')),
  });

  const onSubmit = (d: SignupForm) => {
    const { confirmPassword: _omit, ...dto } = d;
    mutate(dto as RegisterDto);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">Create an account</h2>
      <p className="mt-1 text-sm text-muted-foreground">Buy and sell used vehicles with confidence</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Priya Sharma" className="mt-1.5 h-10" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" className="mt-1.5 h-10" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Mobile number</Label>
          <Input id="phone" inputMode="numeric" placeholder="9876543210" className="mt-1.5 h-10" {...register('phone')} />
          {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
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

        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="mt-1.5 h-10"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" size="lg" className="h-10 w-full" disabled={isPending || isGooglePending}>
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account�?�</> : 'Create account'}
        </Button>
      </form>

      <GoogleSignInButton
        mode="signup"
        disabled={isPending || isGooglePending}
        onCredential={(credential) => googleLogin(credential)}
      />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Camera, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SEO } from '@/components/common/SEO';
import { updateMe, changePassword, uploadProfileImage } from '@/services/auth.service';
import { useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/auth.slice';
import { useAuth } from '@/hooks/useAuth';
import { phoneSchema, passwordSchema } from '@/lib/validations';
import { getApiErrorMessage } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  phone: phoneSchema.optional().or(z.literal('')),
});

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordFormSchema>;

export default function Profile() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const initials = user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  });

  const pwForm = useForm<PasswordForm>({ resolver: zodResolver(passwordFormSchema) });

  const { mutate: saveProfile, isPending: savingProfile } = useMutation({
    mutationFn: (d: ProfileForm) => updateMe({ name: d.name, phone: d.phone || undefined }),
    onSuccess: (u) => { dispatch(updateUser(u)); toast.success('Profile updated'); },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not update your profile')),
  });

  const { mutate: savePassword, isPending: savingPassword, reset: resetPw } = useMutation({
    mutationFn: (d: PasswordForm) => changePassword({ currentPassword: d.currentPassword, newPassword: d.newPassword }),
    onSuccess: () => { toast.success('Password changed'); resetPw(); },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not change your password')),
  });

  const onPickImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const u = await uploadProfileImage(file);
      dispatch(updateUser(u));
      toast.success('Photo updated');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not upload the image'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <SEO title="Profile" noindex />
      <div className="space-y-6">
        <h1 className="text-xl font-bold">Profile</h1>

        <Card>
          <CardHeader><CardTitle>Personal details</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  {user?.profileImage && <AvatarImage src={user.profileImage} alt={user.name} />}
                  <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">{initials}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  aria-label="Change photo"
                  className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-primary-foreground"
                >
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => { onPickImage(e.target.files?.[0]); e.target.value = ''; }}
                />
              </div>
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                {user?.emailVerified && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-green-600">
                    <ShieldCheck className="h-3.5 w-3.5" /> Email verified
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit((d) => saveProfile(d))} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full name</Label>
                <Input {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Mobile number</Label>
                <Input inputMode="numeric" {...register('phone')} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
              </div>
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Save changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={pwForm.handleSubmit((d) => savePassword(d))} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Current password</Label>
                <Input type="password" {...pwForm.register('currentPassword')} />
                {pwForm.formState.errors.currentPassword && <p className="text-xs text-destructive">{pwForm.formState.errors.currentPassword.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>New password</Label>
                <Input type="password" {...pwForm.register('newPassword')} />
                {pwForm.formState.errors.newPassword && <p className="text-xs text-destructive">{pwForm.formState.errors.newPassword.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Confirm new password</Label>
                <Input type="password" {...pwForm.register('confirmPassword')} />
                {pwForm.formState.errors.confirmPassword && <p className="text-xs text-destructive">{pwForm.formState.errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : 'Update password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

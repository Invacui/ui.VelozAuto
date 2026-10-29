import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Loader2, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { SEO } from '@/components/common/SEO';
import { createContact, getSiteSettings } from '@/services/content.service';
import { queryKeys } from '@/lib/queryKeys';
import { phoneSchema } from '@/lib/validations';
import { getApiErrorMessage } from '@/lib/utils';
import { SUPPORT_EMAIL } from '@/lib/seo';

const schema = z.object({
  name: z.string().trim().min(2, 'Your name is required'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: phoneSchema.optional().or(z.literal('')),
  subject: z.string().trim().min(3, 'Add a subject'),
  message: z.string().trim().min(10, 'Tell us a little more (10+ characters)'),
});

type Form = z.infer<typeof schema>;

export default function Contact() {
  const [sent, setSent] = useState(false);
  const { data: settings } = useQuery({ queryKey: queryKeys.content.siteSettings(), queryFn: getSiteSettings });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      toast.success('Message sent — we’ll get back to you soon.');
      reset();
      setSent(true);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not send your message')),
  });

  return (
    <>
      <SEO title="Contact us" description="Get in touch with the Veloz Auto team about buying, selling, inspections or support." />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">Contact us</h1>
          <p className="mt-2 text-muted-foreground">We&apos;re here to help with anything about buying or selling.</p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
          <Card>
            <CardContent>
              {sent ? (
                <div className="py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold">Message sent</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Thanks for reaching out. Our team typically replies within one business day.</p>
                  <Button variant="outline" className="mt-5" onClick={() => setSent(false)}>Send another message</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit((d) => mutate(d as any))} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Name</Label>
                      <Input {...register('name')} />
                      {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input type="email" {...register('email')} />
                      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone (optional)</Label>
                      <Input inputMode="numeric" {...register('phone')} />
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Subject</Label>
                      <Input {...register('subject')} />
                      {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Message</Label>
                    <Textarea rows={5} {...register('message')} />
                    {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                  </div>
                  <Button type="submit" size="lg" className="h-10" disabled={isPending}>
                    {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="mr-1 h-4 w-4" /> Send message</>}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-4 text-sm">
                {settings?.phone && (
                  <p className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-primary" />
                    <span><span className="block font-medium">Phone</span>{settings.phone}</span>
                  </p>
                )}
                {settings?.email && (
                  <p className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-primary" />
                    <span><span className="block font-medium">Email</span>{settings.email}</span>
                  </p>
                )}
                {settings?.address && (
                  <p className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                    <span><span className="block font-medium">Address</span>{settings.address}</span>
                  </p>
                )}
                {settings?.workingHours && (
                  <p className="text-xs text-muted-foreground">{settings.workingHours}</p>
                )}
                {!settings?.phone && !settings?.email && !settings?.address && SUPPORT_EMAIL && (
                  <p className="text-muted-foreground">
                    Email us at{' '}
                    <a className="text-primary hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
                      {SUPPORT_EMAIL}
                    </a>{' '}
                    and our team will respond shortly.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

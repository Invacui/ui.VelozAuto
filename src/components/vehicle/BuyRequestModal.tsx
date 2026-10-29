import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createBuyRequest } from '@/services/buyRequest.service';
import { useAuth } from '@/hooks/useAuth';
import { BUDGET_RANGES } from '@/constants/vehicleEnums';
import { getApiErrorMessage, formatINRCompact } from '@/lib/utils';
import type { Vehicle, VehicleCard } from '@/types/vehicle.types';
import type { CreateBuyRequestDto } from '@/types/buyRequest.types';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  city: z.string().trim().optional().or(z.literal('')),
  budget: z.string().optional(),
  needsFinance: z.boolean().optional(),
  wantsTestDrive: z.boolean().optional(),
  testDriveDate: z.string().optional().or(z.literal('')),
  hasExchangeVehicle: z.boolean().optional(),
  exchangeDetails: z.string().optional().or(z.literal('')),
  message: z.string().trim().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface BuyRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | VehicleCard;
}

export function BuyRequestModal({ open, onOpenChange, vehicle }: BuyRequestModalProps) {
  const { user } = useAuth();
  const vehicleId = vehicle.id || (vehicle as Vehicle)._id!;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      city: '',
      budget: '',
      needsFinance: true,
      wantsTestDrive: false,
      testDriveDate: '',
      hasExchangeVehicle: false,
      exchangeDetails: '',
      message: '',
    },
  });

  // Refresh contact defaults when the logged-in user changes.
  useEffect(() => {
    if (user) {
      form.setValue('name', form.getValues('name') || user.name);
      form.setValue('phone', form.getValues('phone') || user.phone || '');
      form.setValue('email', form.getValues('email') || user.email || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const wantsTestDrive = form.watch('wantsTestDrive');
  const hasExchange = form.watch('hasExchangeVehicle');

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createBuyRequest({
        vehicle: vehicleId,
        name: values.name,
        phone: values.phone,
        email: values.email || undefined,
        city: values.city || undefined,
        budget: (values.budget as CreateBuyRequestDto['budget']) || undefined,
        needsFinance: values.needsFinance,
        wantsTestDrive: values.wantsTestDrive,
        testDriveDate: values.testDriveDate || undefined,
        hasExchangeVehicle: values.hasExchangeVehicle,
        exchangeDetails: values.exchangeDetails || undefined,
        message: values.message || undefined,
      }),
    onSuccess: () => {
      toast.success('Buy request submitted! Our team will contact you shortly.');
      form.reset();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const submitted = mutation.isSuccess;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          mutation.reset();
          form.reset();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto scrollbar-thin">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <DialogTitle>Request received</DialogTitle>
            <DialogDescription className="max-w-sm">
              Thanks! We’ve received your enquiry for <strong>{vehicle.title}</strong>. A relationship
              manager will call you shortly to arrange the next steps.
            </DialogDescription>
            <Button className="mt-2" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Enquire / Buy request</DialogTitle>
              <DialogDescription>
                {vehicle.title} · {formatINRCompact(vehicle.price)}
              </DialogDescription>
            </DialogHeader>

            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="br-name">Name *</Label>
                  <Input id="br-name" {...form.register('name')} />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="br-phone">Mobile number *</Label>
                  <Input id="br-phone" inputMode="numeric" maxLength={10} {...form.register('phone')} />
                  {form.formState.errors.phone && (
                    <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="br-email">Email (optional)</Label>
                  <Input id="br-email" type="email" {...form.register('email')} />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="br-city">City</Label>
                  <Input id="br-city" {...form.register('city')} />
                </div>
                <div className="space-y-1.5">
                  <Label>Your budget</Label>
                  <Select
                    value={form.watch('budget')}
                    onValueChange={(v) => form.setValue('budget', v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select budget range" /></SelectTrigger>
                    <SelectContent>
                      {BUDGET_RANGES.map((b) => (
                        <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 rounded-md border p-3">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={!!form.watch('needsFinance')}
                    onCheckedChange={(v) => form.setValue('needsFinance', !!v)}
                  />
                  I need finance / loan assistance
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={!!wantsTestDrive}
                    onCheckedChange={(v) => form.setValue('wantsTestDrive', !!v)}
                  />
                  I’d like to schedule a test drive
                </label>
                {wantsTestDrive && (
                  <div className="space-y-1.5 pt-1">
                    <Label htmlFor="br-td">Preferred test-drive date</Label>
                    <Input id="br-td" type="date" {...form.register('testDriveDate')} />
                  </div>
                )}
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={!!hasExchange}
                    onCheckedChange={(v) => form.setValue('hasExchangeVehicle', !!v)}
                  />
                  I have a vehicle to exchange
                </label>
                {hasExchange && (
                  <Textarea
                    placeholder="Tell us about your current vehicle (make, model, year, km)"
                    className="mt-1"
                    {...form.register('exchangeDetails')}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="br-msg">Message</Label>
                <Textarea id="br-msg" placeholder="Anything else we should know?" {...form.register('message')} />
              </div>

              {!user && (
                <p className="rounded-md bg-muted p-2 text-xs text-muted-foreground">
                  You’re enquiring as a guest. Log in to track this request in your account.
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Submitting…' : 'Submit request'}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BuyRequestModal;

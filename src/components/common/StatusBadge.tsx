import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Tone } from '@/constants/statusMaps';

const toneClasses: Record<Tone, string> = {
  default: 'bg-muted text-muted-foreground',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
};

interface StatusBadgeProps {
  label: string;
  tone?: Tone;
  className?: string;
}

export function StatusBadge({ label, tone = 'default', className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('border font-medium', toneClasses[tone], className)}>
      {label}
    </Badge>
  );
}

export default StatusBadge;

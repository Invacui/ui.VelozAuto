import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow: string;
  icon?: LucideIcon;
  iconClass?: string;
  title: ReactNode;
  subtitle?: string;
  align?: 'center' | 'left';
  big?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  icon: Icon,
  iconClass = 'text-primary',
  title,
  subtitle,
  align = 'center',
  big = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300/70 bg-white/70 px-3 py-1 text-xs font-bold text-slate-700">
        {Icon && <Icon className={cn('h-3.5 w-3.5', iconClass)} />}
        {eyebrow}
      </span>
      <h2
        className={cn(
          'mt-4 font-bold tracking-tight',
          big ? 'text-4xl leading-none sm:text-6xl lg:text-7xl' : 'text-2xl sm:text-3xl',
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn('mt-3 text-muted-foreground', align === 'center' ? 'max-w-2xl' : 'max-w-xl')}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;

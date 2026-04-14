import { cn } from '@/lib/utils';

type Tone = 'default' | 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

const tones: Record<Tone, string> = {
  default: 'bg-elevated text-fg',
  gold: 'bg-gold/15 text-gold',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  info: 'bg-info/15 text-info',
  muted: 'bg-elevated text-muted',
};

export function Badge({ children, tone = 'default', className }: { children: React.ReactNode; tone?: Tone; className?: string }) {
  return <span className={cn('chip', tones[tone], className)}>{children}</span>;
}

export function Dot({ tone = 'default', className }: { tone?: Tone; className?: string }) {
  const colors: Record<Tone, string> = {
    default: 'bg-fg', gold: 'bg-gold', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger', info: 'bg-info', muted: 'bg-muted',
  };
  return <span className={cn('dot', colors[tone], className)} />;
}

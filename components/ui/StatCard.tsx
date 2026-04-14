import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'gold' | 'success' | 'warning' | 'danger' | 'info';
  icon?: React.ReactNode;
}

const tones: Record<NonNullable<Props['tone']>, string> = {
  default: 'text-fg',
  gold: 'text-gold',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
};

export default function StatCard({ label, value, hint, tone = 'default', icon }: Props) {
  return (
    <div className="card p-5 transition-all hover:border-gold/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted uppercase tracking-wider">{label}</span>
        {icon && <span className="text-muted">{icon}</span>}
      </div>
      <div className={cn('font-mono text-3xl font-semibold tracking-tight', tones[tone])}>{value}</div>
      {hint && <div className="text-xs text-muted mt-1">{hint}</div>}
    </div>
  );
}

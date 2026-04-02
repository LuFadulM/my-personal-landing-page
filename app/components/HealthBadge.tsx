import { cn } from '../lib/utils';
import type { HealthStatus } from '../data/types';

const config: Record<HealthStatus, { bg: string; text: string; dot: string }> = {
  Healthy: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'Needs Attention': { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  'At Risk': { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  'New Role': { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
};

export default function HealthBadge({ status, size = 'sm' }: { status: HealthStatus; size?: 'sm' | 'xs' }) {
  const c = config[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        c.bg,
        c.text,
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[10px]'
      )}
    >
      <span className={cn('rounded-full', c.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-1 h-1')} />
      {status}
    </span>
  );
}

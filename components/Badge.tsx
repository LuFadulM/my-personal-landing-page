'use client';

import type { Flag } from '@/data/roles';

const flagStyles: Record<Flag, { bg: string; text: string; label: string }> = {
  PA: { bg: 'bg-flagPA/15', text: 'text-flagPA', label: 'Pending Access' },
  SR: { bg: 'bg-flagSR/15', text: 'text-flagSR', label: 'Slow Response' },
  BL: { bg: 'bg-flagBL/15', text: 'text-flagBL', label: 'Backlogged' },
};

export function FlagBadge({ flag }: { flag: Flag }) {
  const s = flagStyles[flag];
  return (
    <span className={`${s.bg} ${s.text} text-[10px] font-medium px-2 py-0.5 rounded-full`}>
      {s.label}
    </span>
  );
}

export function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`${color} text-[10px] font-medium px-2 py-0.5 rounded-full`}>
      {label}
    </span>
  );
}

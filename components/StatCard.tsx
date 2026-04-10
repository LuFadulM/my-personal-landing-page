'use client';

interface Props {
  label: string;
  value: number | string;
  color?: string;
  sub?: string;
}

export default function StatCard({ label, value, color = 'text-fg', sub }: Props) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-xs text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-display font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

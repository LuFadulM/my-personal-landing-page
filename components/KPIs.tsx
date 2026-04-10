'use client';

import { useEffect, useState } from 'react';
import { kpis, categoryColors, type KPI } from '@/data/kpis';
import { getStorage, setStorage } from '@/lib/storage';

const KPI_KEY = 'cc_kpi_values';

export default function KPIs() {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setValues(getStorage(KPI_KEY, {}));
  }, []);

  function update(id: string, val: string) {
    const next = { ...values, [id]: val };
    setValues(next);
    setStorage(KPI_KEY, next);
  }

  function getStatus(target: string, current: string): { label: string; color: string } {
    if (!current) return { label: 'No Data', color: 'text-muted bg-border/50' };
    const tgt = parseFloat(target.replace(/[><%]/g, ''));
    const cur = parseFloat(current.replace(/[%]/g, ''));
    if (isNaN(cur)) return { label: 'No Data', color: 'text-muted bg-border/50' };
    if (cur >= tgt) return { label: 'On Track', color: 'text-healthy bg-healthy/10' };
    if (cur >= tgt * 0.85) return { label: 'Close', color: 'text-attention bg-attention/10' };
    return { label: 'Behind', color: 'text-risk bg-risk/10' };
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">Update current values below. Changes persist automatically.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {kpis.map((kpi) => {
          const current = values[kpi.id] || '';
          const status = getStatus(kpi.target, current);
          const catColor = categoryColors[kpi.category];
          return (
            <div key={kpi.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`${catColor} text-[10px] font-medium px-2 py-0.5 rounded-full`}>
                  {kpi.category}
                </span>
                <span className={`${status.color} text-[10px] font-medium px-2 py-0.5 rounded-full`}>
                  {status.label}
                </span>
              </div>
              <p className="text-sm font-medium text-fg">{kpi.name}</p>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] text-muted">Target</p>
                  <p className="text-lg font-bold font-mono text-accent">{kpi.target}</p>
                </div>
                <div className="flex-1 max-w-[120px]">
                  <p className="text-[10px] text-muted mb-1">Current</p>
                  <input
                    type="text"
                    value={current}
                    onChange={(e) => update(kpi.id, e.target.value)}
                    placeholder="—"
                    className="w-full bg-border/50 border border-border rounded-lg px-3 py-1.5 text-sm text-fg font-mono text-center focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

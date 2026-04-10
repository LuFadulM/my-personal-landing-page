'use client';

import { useEffect, useState } from 'react';
import StatCard from './StatCard';
import DonutChart from './DonutChart';
import { atRiskRoles } from '@/data/roles';
import { FlagBadge } from './Badge';
import { getStorage, setStorage } from '@/lib/storage';

const CHECKLIST_KEY = 'cc_checklist';
const checklistItems = [
  'Check #operations for new @mentions',
  'Check all client channels for updates',
  'Check #bugs channel',
  'Review recruiter channels',
  'Check DMs from Will and Arya',
  'Action all pending @Lucia tasks',
  'Verify intro emails sent for new roles',
  'Follow up with stale candidates',
  'Verify all calendar links are active',
  'Review pipeline for archived/rejected',
  'React to completed tasks in Slack',
  'Final check on intro email delivery',
];

export default function Overview() {
  const [checks, setChecks] = useState<boolean[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = getStorage<{ date: string; items: boolean[] }>(CHECKLIST_KEY, { date: '', items: [] });
    if (saved.date === today) {
      setChecks(saved.items);
    } else {
      setChecks(new Array(checklistItems.length).fill(false));
    }
  }, []);

  function toggle(i: number) {
    const next = [...checks];
    next[i] = !next[i];
    setChecks(next);
    setStorage(CHECKLIST_KEY, { date: new Date().toISOString().split('T')[0], items: next });
  }

  const healthy = 49, na = 17, ar = 30, nr = 14, total = 110;
  const segments = [
    { value: healthy, color: '#10b981', label: 'Healthy' },
    { value: na, color: '#f59e0b', label: 'Needs Attention' },
    { value: ar, color: '#ef4444', label: 'At Risk' },
    { value: nr, color: '#3b82f6', label: 'New' },
  ];

  const topRisk = atRiskRoles.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Healthy" value={healthy} color="text-healthy" />
        <StatCard label="Needs Attention" value={na} color="text-attention" />
        <StatCard label="At Risk" value={ar} color="text-risk" />
        <StatCard label="New Role" value={nr} color="text-newrole" />
        <StatCard label="Total Active" value={total} />
        <StatCard label="For Review" value={42} color="text-accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4">Health Distribution</h3>
          <DonutChart segments={segments} />
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-3">Health Gap Analysis</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-muted text-xs">Current healthy %</p>
              <p className="text-2xl font-bold text-attention">44.5%</p>
              <p className="text-xs text-muted">Target: &gt;60% — need {Math.ceil(total * 0.6) - healthy} more roles healthy</p>
            </div>
            <div>
              <p className="text-muted text-xs">Current at-risk %</p>
              <p className="text-2xl font-bold text-risk">27.3%</p>
              <p className="text-xs text-muted">Target: &lt;20% — need {ar - Math.floor(total * 0.2)} roles recovered</p>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-muted text-xs">Pipeline Snapshot</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <span>Candidate Alerts: <b className="text-fg">472</b></span>
                <span>Onsites: <b className="text-fg">2</b></span>
                <span>Bonuses: <b className="text-fg">5</b></span>
                <span>Agency Assign: <b className="text-fg">26</b></span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-3">Top 5 At Risk</h3>
          <div className="space-y-2.5">
            {topRisk.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="min-w-0 flex-1">
                  <p className="text-fg font-medium truncate">{r.role}</p>
                  <p className="text-muted truncate">{r.co} — {r.rec} recruiters, {r.pend} pending</p>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  {r.flags.map((f) => <FlagBadge key={f} flag={f} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Morning Checklist</h3>
          <span className="text-xs text-muted">
            {checks.filter(Boolean).length}/{checklistItems.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
          {checklistItems.map((item, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`flex items-center gap-2 text-xs text-left px-3 py-2 rounded-lg transition-colors ${
                checks[i] ? 'bg-healthy/10 text-healthy line-through opacity-70' : 'text-fg hover:bg-border/50'
              }`}
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                checks[i] ? 'bg-healthy border-healthy text-bg' : 'border-muted'
              }`}>
                {checks[i] && <span className="text-[10px]">&#10003;</span>}
              </span>
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

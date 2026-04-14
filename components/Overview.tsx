'use client';

import { useEffect, useState } from 'react';
import StatCard from './StatCard';
import { jds as seedJds, type JD } from '@/data/jds';
import { introEmails } from '@/data/emails';
import { kpis } from '@/data/kpis';
import { daysBetween, REF_DATE, addBusinessDays, isOverdue } from '@/lib/dateUtils';
import { getStorage, setStorage } from '@/lib/storage';
import { FileText, Mail, Target, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const CHECKLIST_KEY = 'cc_checklist';
const JDS_KEY = 'cc_jds_v2';
const KPI_KEY = 'cc_kpi_values';
const LOG_KEY = 'cc_error_log';

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

interface StoredJD extends JD {
  id: string;
  createdAt: string;
  seeded?: boolean;
}

export default function Overview() {
  const [checks, setChecks] = useState<boolean[]>([]);
  const [jds, setJds] = useState<StoredJD[]>([]);
  const [kpiValues, setKpiValues] = useState<Record<string, string>>({});
  const [openIssues, setOpenIssues] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = getStorage<{ date: string; items: boolean[] }>(CHECKLIST_KEY, { date: '', items: [] });
    if (saved.date === today) setChecks(saved.items);
    else setChecks(new Array(checklistItems.length).fill(false));

    const storedJDs = getStorage<StoredJD[] | null>(JDS_KEY, null);
    setJds(storedJDs || seedJds.map((j, i) => ({ ...j, id: `seed-${i}`, createdAt: '', seeded: true })));

    setKpiValues(getStorage(KPI_KEY, {}));
    const log = getStorage<Array<{ status: string }>>(LOG_KEY, []);
    setOpenIssues(log.filter((e) => e.status !== 'Fixed').length);
  }, []);

  function toggle(i: number) {
    const next = [...checks];
    next[i] = !next[i];
    setChecks(next);
    setStorage(CHECKLIST_KEY, { date: new Date().toISOString().split('T')[0], items: next });
  }

  // JD stats
  const active = jds.filter((j) => j.status === 'Active').length;
  const complete = jds.filter((j) => j.status === 'Complete').length;
  const companies = Array.from(new Set(jds.map((j) => j.company))).length;
  const engineering = jds.filter((j) => j.function === 'Engineering').length;

  // Email stats
  const emailsEnriched = introEmails.map((e) => ({
    ...e,
    days: daysBetween(e.date, REF_DATE),
    fu1Due: !e.replied && isOverdue(addBusinessDays(e.date, 3)),
  }));
  const totalEmails = emailsEnriched.length;
  const repliedCount = emailsEnriched.filter((e) => e.replied).length;
  const overdueFU = emailsEnriched.filter((e) => !e.replied && e.fu1Due).length;
  const responseRate = Math.round((repliedCount / totalEmails) * 100);

  // KPI stats
  const kpisMeasured = kpis.filter((k) => kpiValues[k.id]).length;
  const kpisOnTrack = kpis.filter((k) => {
    const cur = kpiValues[k.id];
    if (!cur) return false;
    const tgt = parseFloat(k.target.replace(/[><%]/g, ''));
    const curN = parseFloat(cur.replace(/[%]/g, ''));
    return !isNaN(curN) && curN >= tgt;
  }).length;

  // Upcoming action items
  const jdsWithTBDComp = jds.filter((j) => j.status === 'Active' && (j.compensation === 'TBD' || j.bounty === 'TBD'));
  const emailsNeedFU = emailsEnriched.filter((e) => !e.replied && e.fu1Due).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Primary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="JDs Drafted" value={jds.length} color="text-accent" sub={`${active} active · ${complete} complete`} />
        <StatCard label="Response Rate" value={`${responseRate}%`} color={responseRate > 25 ? 'text-healthy' : 'text-attention'} sub={`${repliedCount}/${totalEmails} emails replied`} />
        <StatCard label="KPIs On Track" value={`${kpisOnTrack}/${kpis.length}`} color="text-healthy" sub={`${kpisMeasured} measured so far`} />
        <StatCard label="Open Issues" value={openIssues} color={openIssues > 0 ? 'text-attention' : 'text-healthy'} sub="From Error Log" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* JD summary */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={14} className="text-accent" />
            <h3 className="text-sm font-semibold">JD Tracker</h3>
          </div>
          <div className="space-y-2 text-xs">
            <Row label="Total JDs" value={jds.length} />
            <Row label="Active" value={active} color="text-healthy" />
            <Row label="Complete" value={complete} color="text-muted" />
            <Row label="Companies" value={companies} color="text-accent" />
            <Row label="Engineering roles" value={engineering} color="text-newrole" />
          </div>
          {jdsWithTBDComp.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-[10px] text-attention uppercase tracking-wider mb-2">Missing Comp or Bounty ({jdsWithTBDComp.length})</p>
              <div className="space-y-1">
                {jdsWithTBDComp.slice(0, 3).map((j, i) => (
                  <div key={i} className="text-[11px] text-muted truncate">
                    <span className="text-fg">{j.role}</span> — {j.company}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Email summary */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Mail size={14} className="text-accent" />
            <h3 className="text-sm font-semibold">Intro Emails</h3>
          </div>
          <div className="space-y-2 text-xs">
            <Row label="Total sent (14d)" value={totalEmails} />
            <Row label="Replied" value={repliedCount} color="text-healthy" />
            <Row label="Overdue follow-ups" value={overdueFU} color="text-risk" />
            <Row label="Response rate" value={`${responseRate}%`} color={responseRate > 25 ? 'text-healthy' : 'text-attention'} />
          </div>
          {emailsNeedFU.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-[10px] text-risk uppercase tracking-wider mb-2 flex items-center gap-1">
                <Clock size={10} /> Follow Up Today ({emailsNeedFU.length}+)
              </p>
              <div className="space-y-1">
                {emailsNeedFU.map((e, i) => (
                  <div key={i} className="text-[11px] text-muted truncate">
                    <span className="text-fg">{e.name}</span> — {e.co} <span className="text-risk">({e.days}d)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* KPI snapshot */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} className="text-accent" />
            <h3 className="text-sm font-semibold">KPI Snapshot</h3>
          </div>
          <div className="space-y-2 text-xs">
            <Row label="Measured" value={`${kpisMeasured}/${kpis.length}`} />
            <Row label="On track" value={kpisOnTrack} color="text-healthy" />
            <Row label="Behind target" value={kpisMeasured - kpisOnTrack} color="text-risk" />
            <Row label="Not yet measured" value={kpis.length - kpisMeasured} color="text-muted" />
          </div>
          {kpisMeasured === 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-[11px] text-muted">Head to the KPIs tab to log this week's values.</p>
            </div>
          )}
        </div>
      </div>

      {/* Morning checklist */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 size={14} className="text-accent" /> Morning Checklist
          </h3>
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

function Row({ label, value, color = 'text-fg' }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={`font-mono font-medium ${color}`}>{value}</span>
    </div>
  );
}

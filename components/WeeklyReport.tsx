'use client';

import { useEffect, useState } from 'react';
import { needsAttentionRoles, atRiskRoles } from '@/data/roles';
import { getStorage, setStorage } from '@/lib/storage';
import { ClipboardCopy, Save, ChevronDown } from 'lucide-react';

const RPT_KEY = 'cc_weekly_reports';
const RPT_DRAFT = 'cc_weekly_draft';

interface Report { date: string; content: string; }

function autoSections() {
  const na = needsAttentionRoles;
  const ar = atRiskRoles;
  const naList = na.map((r) => `- ${r.role} — ${r.co}`).join('\n');
  const arList = ar.map((r) => `- ${r.role} — ${r.co}`).join('\n');
  const arCompanies = Array.from(new Set(ar.map((r) => r.co))).join(', ');

  const allRoles = [...na, ...ar];
  const pendingByCompany: Record<string, number> = {};
  allRoles.forEach((r) => {
    if (r.pend > 0) pendingByCompany[r.co] = (pendingByCompany[r.co] || 0) + r.pend;
  });
  const pendingList = Object.entries(pendingByCompany)
    .sort((a, b) => b[1] - a[1])
    .map(([co, ct]) => `- ${co} — ${ct}`)
    .join('\n');
  const totalPending = Object.values(pendingByCompany).reduce((a, b) => a + b, 0);

  const slowResp = allRoles.filter((r) => r.flags.includes('SR')).length;
  const backlog = allRoles.filter((r) => r.flags.includes('BL')).length;
  const pendAccess = allRoles.filter((r) => r.flags.includes('PA')).length;

  return { na, ar, naList, arList, arCompanies, pendingList, totalPending, slowResp, backlog, pendAccess };
}

export default function WeeklyReport() {
  const [approved, setApproved] = useState('');
  const [pending, setPending] = useState('');
  const [onsites, setOnsites] = useState('');
  const [flags, setFlags] = useState('');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState<Report[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const draft = getStorage<Record<string, string>>(RPT_DRAFT, {});
    setApproved(draft.approved || '');
    setPending(draft.pending || '');
    setOnsites(draft.onsites || '');
    setFlags(draft.flags || '');
    setNotes(draft.notes || '');
    setSaved(getStorage<Report[]>(RPT_KEY, []));
  }, []);

  function saveDraft() {
    setStorage(RPT_DRAFT, { approved, pending, onsites, flags, notes });
  }

  const s = autoSections();

  function buildReport(): string {
    const now = new Date();
    const friday = new Date(now);
    friday.setDate(now.getDate() + (5 - now.getDay() + 7) % 7);
    const weekStart = new Date(friday);
    weekStart.setDate(friday.getDate() - 4);

    return `# Weekly Recruiting Health Report

**Week of:** ${weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${friday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
**Prepared by:** Lucia
**Date:** ${friday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

---

## 1. Dashboard Summary

**Active Job Health**
Healthy: 49 | Needs Attention: ${s.na.length} | At Risk: ${s.ar.length} | New Role: 14

**Total active roles:** 110
**Total approved submissions:** ${approved || '[fill in]'}
**Total pending review:** ${pending || '[fill in]'}

---

## 2. Healthy Roles (49)
These roles are running well with strong submission flow and recent client engagement.

---

## 3. New Roles (14)
New roles recently added and ramping up.

---

## 4. Needs Attention (${s.na.length} Roles)
We are focusing on recovering these roles to a healthy status.
${s.naList}

---

## 5. At Risk (${s.ar.length} Roles)
These roles require monitoring due to backlogs, slow response, or pending reviews. Key companies include ${s.arCompanies}.
${s.arList}

---

## 6. Pending Company Approval by Company (${s.totalPending} total)
${s.pendingList}

---

## 7. Onsite Candidates
${onsites || '[fill in onsite candidates]'}

---

## 8. Flags & Alerts
**Slow Response (${s.slowResp} roles)**
**Backlogged (${s.backlog} roles)**
**Pending Access (${s.pendAccess} roles)**
**Notable stale roles:** ${flags || '[fill in]'}

---

## 9. Notes
${notes || '[add context]'}
`;
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(buildReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function saveReport() {
    const report: Report = { date: new Date().toISOString().split('T')[0], content: buildReport() };
    const next = [report, ...saved];
    setSaved(next);
    setStorage(RPT_KEY, next);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={copyToClipboard} className="flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full text-xs font-medium hover:bg-accent/30 transition-colors">
          <ClipboardCopy size={14} /> {copied ? 'Copied!' : 'Copy Report'}
        </button>
        <button onClick={saveReport} className="flex items-center gap-2 bg-healthy/20 text-healthy px-4 py-2 rounded-full text-xs font-medium hover:bg-healthy/30 transition-colors">
          <Save size={14} /> Save This Week
        </button>
        {saved.length > 0 && (
          <button onClick={() => setShowSaved(!showSaved)} className="flex items-center gap-2 text-muted text-xs hover:text-fg transition-colors">
            <ChevronDown size={14} /> Past Reports ({saved.length})
          </button>
        )}
      </div>

      {showSaved && saved.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
          {saved.map((r, i) => (
            <details key={i} className="text-xs">
              <summary className="cursor-pointer text-muted hover:text-fg">{r.date}</summary>
              <pre className="mt-2 whitespace-pre-wrap text-muted text-[11px] font-mono bg-bg p-3 rounded-lg max-h-60 overflow-y-auto">{r.content}</pre>
            </details>
          ))}
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold">Editable Sections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-muted uppercase tracking-wider">Total Approved Submissions</label>
            <input value={approved} onChange={(e) => { setApproved(e.target.value); saveDraft(); }} className="w-full bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg mt-1 focus:border-accent focus:outline-none" placeholder="490" />
          </div>
          <div>
            <label className="text-[10px] text-muted uppercase tracking-wider">Total Pending Review</label>
            <input value={pending} onChange={(e) => { setPending(e.target.value); saveDraft(); }} className="w-full bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg mt-1 focus:border-accent focus:outline-none" placeholder="151" />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-muted uppercase tracking-wider">Onsite Candidates (Section 7)</label>
          <textarea value={onsites} onChange={(e) => { setOnsites(e.target.value); saveDraft(); }} rows={4} className="w-full bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg mt-1 focus:border-accent focus:outline-none font-mono" placeholder="- Aaron Tian — Growth Lead — Listen Labs (Onsite, Apr 7)&#10;- Thomas Regan — Lead GTM Eng — Listen Labs" />
        </div>
        <div>
          <label className="text-[10px] text-muted uppercase tracking-wider">Notable Stale Roles (Section 8)</label>
          <textarea value={flags} onChange={(e) => { setFlags(e.target.value); saveDraft(); }} rows={3} className="w-full bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg mt-1 focus:border-accent focus:outline-none font-mono" placeholder="Uniqus Consultech — 1mo no response, 9 pending" />
        </div>
        <div>
          <label className="text-[10px] text-muted uppercase tracking-wider">Notes (Section 9)</label>
          <textarea value={notes} onChange={(e) => { setNotes(e.target.value); saveDraft(); }} rows={4} className="w-full bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg mt-1 focus:border-accent focus:outline-none font-mono" placeholder="Any additional context..." />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold mb-3">Live Preview</h3>
        <pre className="whitespace-pre-wrap text-xs font-mono text-muted leading-relaxed max-h-[500px] overflow-y-auto">
          {buildReport()}
        </pre>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { needsAttentionRoles, atRiskRoles, type Role } from '@/data/roles';
import { FlagBadge } from './Badge';

type Tab = 'na' | 'ar';

export default function RoleHealth() {
  const [tab, setTab] = useState<Tab>('ar');
  const [sort, setSort] = useState<keyof Role>('pend');
  const [asc, setAsc] = useState(false);

  const data = tab === 'na' ? needsAttentionRoles : atRiskRoles;
  const sorted = [...data].sort((a, b) => {
    const av = a[sort], bv = b[sort];
    if (typeof av === 'number' && typeof bv === 'number') return asc ? av - bv : bv - av;
    return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
  });

  function toggleSort(col: keyof Role) {
    if (sort === col) setAsc(!asc);
    else { setSort(col); setAsc(false); }
  }

  const hdr = (label: string, col: keyof Role) => (
    <th
      onClick={() => toggleSort(col)}
      className="text-left px-3 py-2.5 text-[10px] font-medium text-muted uppercase tracking-wider cursor-pointer hover:text-fg select-none"
    >
      {label} {sort === col ? (asc ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setTab('ar')}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
            tab === 'ar' ? 'bg-risk/20 text-risk' : 'text-muted hover:text-fg'
          }`}
        >
          At Risk ({atRiskRoles.length})
        </button>
        <button
          onClick={() => setTab('na')}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
            tab === 'na' ? 'bg-attention/20 text-attention' : 'text-muted hover:text-fg'
          }`}
        >
          Needs Attention ({needsAttentionRoles.length})
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                {hdr('Role', 'role')}
                {hdr('Company', 'co')}
                {hdr('Recruiters', 'rec')}
                {hdr('Pending', 'pend')}
                {hdr('Last Response', 'resp')}
                <th className="text-left px-3 py-2.5 text-[10px] font-medium text-muted uppercase tracking-wider">Flags</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-border/20 transition-colors">
                  <td className="px-3 py-2.5 font-medium">{r.role}</td>
                  <td className="px-3 py-2.5 text-muted">{r.co}</td>
                  <td className="px-3 py-2.5 text-center">{r.rec}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={r.pend > 3 ? 'text-risk font-bold' : r.pend > 0 ? 'text-attention' : 'text-muted'}>
                      {r.pend}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted text-xs">{r.resp}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1 flex-wrap">
                      {r.flags.map((f) => <FlagBadge key={f} flag={f} />)}
                      {r.flags.length === 0 && <span className="text-xs text-muted">—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

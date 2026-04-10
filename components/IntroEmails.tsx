'use client';

import { useMemo, useState } from 'react';
import { introEmails } from '@/data/emails';
import { addBusinessDays, formatDate, daysBetween, REF_DATE, isOverdue } from '@/lib/dateUtils';
import StatCard from './StatCard';

export default function IntroEmails() {
  const [filter, setFilter] = useState<'all' | 'no-reply' | 'overdue'>('all');
  const [clientFilter, setClientFilter] = useState('All');
  const [sort, setSort] = useState<'date' | 'days' | 'fu'>('date');

  const enriched = useMemo(() => {
    return introEmails.map((e, i) => {
      const days = daysBetween(e.date, REF_DATE);
      const fu1 = addBusinessDays(e.date, 3);
      const fu2 = addBusinessDays(e.date, 6);
      const fu3 = addBusinessDays(e.date, 9);
      const fu1Due = isOverdue(fu1);
      const fu2Due = isOverdue(fu2);
      const fu3Due = isOverdue(fu3);
      const replied = e.replied || false;
      const overdueFUs = [fu1Due, fu2Due, fu3Due].filter(Boolean).length;

      let fuStatus = 'On track';
      if (!replied && fu3Due) fuStatus = 'FU3 overdue';
      else if (!replied && fu2Due) fuStatus = 'FU2 overdue';
      else if (!replied && fu1Due) fuStatus = 'FU1 overdue';

      return { ...e, idx: i + 1, days, fu1, fu2, fu3, fu1Due, fu2Due, fu3Due, replied, overdueFUs, fuStatus };
    });
  }, []);

  const clients = useMemo(() => {
    const set = new Set(introEmails.map((e) => e.co));
    return ['All', ...Array.from(set).sort()];
  }, []);

  const totalReplied = enriched.filter((e) => e.replied).length;
  const totalNoReply = enriched.filter((e) => !e.replied).length;
  const totalOverdue = enriched.filter((e) => !e.replied && e.overdueFUs > 0).length;
  const responseRate = Math.round((totalReplied / enriched.length) * 100);

  const filtered = useMemo(() => {
    let data = enriched;
    if (clientFilter !== 'All') data = data.filter((e) => e.co === clientFilter);
    if (filter === 'no-reply') data = data.filter((e) => !e.replied);
    if (filter === 'overdue') data = data.filter((e) => !e.replied && e.overdueFUs > 0);

    if (sort === 'days') data = [...data].sort((a, b) => b.days - a.days);
    else if (sort === 'fu') data = [...data].sort((a, b) => b.overdueFUs - a.overdueFUs);

    return data;
  }, [enriched, filter, clientFilter, sort]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Total Sent" value={enriched.length} />
        <StatCard label="Replied" value={totalReplied} color="text-healthy" />
        <StatCard label="No Reply" value={totalNoReply} color="text-risk" />
        <StatCard label="Overdue FUs" value={totalOverdue} color="text-attention" />
        <StatCard label="Response Rate" value={`${responseRate}%`} color={responseRate > 20 ? 'text-healthy' : 'text-risk'} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-xs text-muted mb-2 font-mono">Follow-up rules:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-muted">
          <div className="bg-border/30 rounded-lg p-2.5">
            <b className="text-fg">FU1 (3 biz days):</b> Same thread, same CCs. "Hi name, Just checking in on the role opportunity with company..."
          </div>
          <div className="bg-border/30 rounded-lg p-2.5">
            <b className="text-fg">FU2 (6 biz days):</b> Same thread, same CCs. Same format.
          </div>
          <div className="bg-border/30 rounded-lg p-2.5">
            <b className="text-fg">FU3 (9 biz days):</b> NEW thread. Subject: "note re: company". Under 70 words. Flip the ask.
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {(['all', 'no-reply', 'overdue'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f ? 'bg-accent/20 text-accent' : 'text-muted hover:text-fg'
            }`}
          >
            {f === 'all' ? 'All' : f === 'no-reply' ? 'No Reply' : 'Overdue FUs'}
          </button>
        ))}
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="bg-card border border-border rounded-full px-3 py-1.5 text-xs text-fg"
        >
          {clients.map((c) => (
            <option key={c} value={c}>{c === 'All' ? 'All Clients' : c}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="bg-card border border-border rounded-full px-3 py-1.5 text-xs text-fg"
        >
          <option value="date">Sort: Date</option>
          <option value="days">Sort: Days Since</option>
          <option value="fu">Sort: Most Overdue</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-border">
              <tr>
                <th className="px-3 py-2 text-left text-muted font-medium">#</th>
                <th className="px-3 py-2 text-left text-muted font-medium">Date</th>
                <th className="px-3 py-2 text-left text-muted font-medium">Candidate</th>
                <th className="px-3 py-2 text-left text-muted font-medium">Role</th>
                <th className="px-3 py-2 text-left text-muted font-medium">Client</th>
                <th className="px-3 py-2 text-center text-muted font-medium">Replied?</th>
                <th className="px-3 py-2 text-center text-muted font-medium">Days</th>
                <th className="px-3 py-2 text-center text-muted font-medium">FU1</th>
                <th className="px-3 py-2 text-center text-muted font-medium">FU2</th>
                <th className="px-3 py-2 text-center text-muted font-medium">FU3</th>
                <th className="px-3 py-2 text-left text-muted font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={`${e.idx}-${e.name}`} className="border-b border-border/30 hover:bg-border/20">
                  <td className="px-3 py-2 text-muted font-mono">{e.idx}</td>
                  <td className="px-3 py-2 text-muted whitespace-nowrap">{e.date}</td>
                  <td className="px-3 py-2 font-medium text-fg">{e.name}</td>
                  <td className="px-3 py-2 text-muted">{e.role}</td>
                  <td className="px-3 py-2 text-muted">{e.co}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-block w-5 h-5 rounded-full text-[10px] font-bold leading-5 text-center ${
                      e.replied ? 'bg-healthy/20 text-healthy' : 'bg-risk/20 text-risk'
                    }`}>
                      {e.replied ? 'Y' : 'N'}
                    </span>
                  </td>
                  <td className={`px-3 py-2 text-center font-mono ${e.days > 7 ? 'text-risk' : e.days > 3 ? 'text-attention' : 'text-muted'}`}>
                    {e.days}d
                  </td>
                  <td className={`px-3 py-2 text-center ${!e.replied && e.fu1Due ? 'text-risk font-bold' : 'text-muted'}`}>
                    {formatDate(e.fu1)}
                  </td>
                  <td className={`px-3 py-2 text-center ${!e.replied && e.fu2Due ? 'text-risk font-bold' : 'text-muted'}`}>
                    {formatDate(e.fu2)}
                  </td>
                  <td className={`px-3 py-2 text-center ${!e.replied && e.fu3Due ? 'text-risk font-bold' : 'text-muted'}`}>
                    {formatDate(e.fu3)}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      e.replied ? 'bg-healthy/10 text-healthy' :
                      e.fuStatus.includes('overdue') ? 'bg-risk/10 text-risk' : 'bg-border text-muted'
                    }`}>
                      {e.replied ? 'Replied' : e.fuStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[10px] text-muted text-center">Showing {filtered.length} of {enriched.length} intro emails</p>
    </div>
  );
}

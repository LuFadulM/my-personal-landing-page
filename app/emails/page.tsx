'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import { Badge, Dot } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import SupabaseGate from '@/components/ui/SupabaseGate';
import { Search, Mail, Plus, X, Save, Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import type { Candidate, ResponseStatus } from '@/lib/types';
import { formatDate, daysSince, nextFollowupDue } from '@/lib/utils';

const respTones: Record<ResponseStatus, 'success' | 'danger' | 'warning' | 'info' | 'muted'> = {
  pending: 'warning',
  replied: 'success',
  interview_scheduled: 'info',
  declined: 'danger',
  no_response: 'muted',
  auto_reply: 'muted',
  ghosted: 'muted',
};

export default function EmailsPage() {
  const enabled = isSupabaseConfigured();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'needs_fu' | 'replied_week' | 'no_response'>('all');
  const [statusFilter, setStatusFilter] = useState<ResponseStatus | 'All'>('All');
  const [showNew, setShowNew] = useState(false);
  const [draftOpen, setDraftOpen] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<Record<string, string>>({});
  const [draftLoading, setDraftLoading] = useState<Record<string, boolean>>({});

  async function generateDraft(c: Candidate) {
    setDraftOpen(c.id);
    if (draftText[c.id]) return;
    setDraftLoading((p) => ({ ...p, [c.id]: true }));
    setDraftText((p) => ({ ...p, [c.id]: '' }));
    try {
      const res = await fetch('/api/ai/draft-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate: c.name,
          role: c.role?.title ?? 'the role',
          client: c.role?.client?.name ?? 'the company',
          round: c.followup_round,
          daysSince: daysSince(c.intro_sent_at),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setDraftText((p) => ({ ...p, [c.id]: (p[c.id] ?? '') + decoder.decode(value) }));
      }
    } catch {
      setDraftText((p) => ({ ...p, [c.id]: 'Error generating draft. Check ANTHROPIC_API_KEY.' }));
    } finally {
      setDraftLoading((p) => ({ ...p, [c.id]: false }));
    }
  }

  const { data: candidates = [] } = useQuery({
    queryKey: ['candidates'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase
        .from('candidates')
        .select('*, role:roles(title, client:clients(name))')
        .eq('archived', false)
        .order('intro_sent_at', { ascending: false })
        .limit(500);
      return (data || []) as Candidate[];
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles-for-candidates'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase.from('roles').select('id, title, client:clients(name)').eq('archived', false);
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const now = new Date();
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    return candidates
      .filter((c) => statusFilter === 'All' || c.response_status === statusFilter)
      .filter((c) => {
        if (filter === 'needs_fu') return c.response_status === 'pending' && c.next_followup_due && new Date(c.next_followup_due) <= now;
        if (filter === 'replied_week') return c.response_status === 'replied' && c.response_date && new Date(c.response_date) >= weekAgo;
        if (filter === 'no_response') return c.response_status === 'pending' && daysSince(c.intro_sent_at) >= 5;
        return true;
      })
      .filter((c) => !q ||
        c.name.toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.role?.title || '').toLowerCase().includes(q) ||
        (c.role?.client?.name || '').toLowerCase().includes(q)
      );
  }, [candidates, search, filter, statusFilter]);

  const totalSent = candidates.length;
  const replied = candidates.filter((c) => c.response_status === 'replied' || c.response_status === 'interview_scheduled').length;
  const responseRate = totalSent ? Math.round((replied / totalSent) * 100) : 0;
  const followupsPending = candidates.filter((c) => c.response_status === 'pending' && c.next_followup_due && new Date(c.next_followup_due) <= new Date()).length;
  const interviewScheduled = candidates.filter((c) => c.response_status === 'interview_scheduled').length;

  async function updateStatus(id: string, patch: Partial<Candidate>) {
    await supabase.from('candidates').update(patch).eq('id', id);
    qc.invalidateQueries({ queryKey: ['candidates'] });
  }

  async function markReplied(id: string) {
    await updateStatus(id, { response_status: 'replied', response_date: new Date().toISOString() });
  }

  async function advanceFollowup(c: Candidate) {
    const nextRound = c.followup_round + 1;
    const due = nextFollowupDue(c.intro_sent_at, nextRound);
    await updateStatus(c.id, {
      followup_round: nextRound,
      last_followup_at: new Date().toISOString(),
      next_followup_due: due?.toISOString() || null,
    });
  }

  const dots = (round: number) =>
    [0, 1, 2].map((i) => <Dot key={i} tone={i < round ? 'gold' : 'muted'} />);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Tracker"
        description={`${totalSent} candidates tracked · ${responseRate}% response rate`}
        action={
          <button onClick={() => setShowNew(true)} className="btn-primary inline-flex items-center gap-1.5">
            <Plus size={14} /> New Candidate
          </button>
        }
      />

      <SupabaseGate>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Total Sent" value={totalSent} />
          <StatCard label="Replied" value={replied} tone="success" />
          <StatCard label="Response Rate" value={`${responseRate}%`} tone={responseRate >= 25 ? 'success' : 'warning'} />
          <StatCard label="Follow-Ups Due" value={followupsPending} tone={followupsPending > 0 ? 'danger' : 'default'} />
          <StatCard label="Interviews" value={interviewScheduled} tone="info" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate, role, or client…"
              className="w-full bg-surface border border-border rounded-full pl-8 pr-4 py-2 text-sm focus:border-gold/50 focus:outline-none"
            />
          </div>
          {([
            ['all', 'All'],
            ['needs_fu', 'Needs follow-up today'],
            ['replied_week', 'Replied this week'],
            ['no_response', 'No response 5+ days'],
          ] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === val ? 'bg-gold/15 text-gold' : 'bg-surface border border-border text-muted hover:text-fg'}`}
            >
              {label}
            </button>
          ))}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="bg-surface border border-border rounded-full px-3 py-1.5 text-xs">
            <option value="All">All Status</option>
            {Object.keys(respTones).map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Mail size={36} />}
            title={candidates.length === 0 ? 'No candidates yet' : 'No candidates match these filters'}
            description={candidates.length === 0 ? 'Add candidates manually or import via the Import Data page.' : 'Try clearing filters.'}
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-elevated/30 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">Candidate</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">Role / Client</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">Sent</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted uppercase">Days</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted uppercase">FU</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">Next Due</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <>
                    <tr key={c.id} className="border-b border-border/50 hover:bg-elevated/30">
                      <td className="px-4 py-3">
                        <div className="font-medium">{c.name}</div>
                        {c.email && <div className="text-xs text-muted">{c.email}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">{c.role?.title}</div>
                        <div className="text-xs text-muted">{c.role?.client?.name}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">{formatDate(c.intro_sent_at)}</td>
                      <td className="px-4 py-3 text-center font-mono text-xs">{daysSince(c.intro_sent_at)}d</td>
                      <td className="px-4 py-3">
                        <select
                          value={c.response_status}
                          onChange={(e) => updateStatus(c.id, { response_status: e.target.value as ResponseStatus, response_date: ['replied', 'interview_scheduled'].includes(e.target.value) ? new Date().toISOString() : c.response_date })}
                          className="bg-transparent text-xs border-0 focus:outline-none"
                        >
                          {(Object.keys(respTones) as ResponseStatus[]).map((s) => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">{dots(c.followup_round)}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                        {c.next_followup_due ? formatDate(c.next_followup_due) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {c.response_status === 'pending' && (
                            <>
                              <button
                                onClick={() => generateDraft(c)}
                                className="text-xs px-2 py-1 rounded bg-elevated border border-border text-muted hover:text-fg hover:border-gold/40 inline-flex items-center gap-1"
                              >
                                <Sparkles size={10} /> Draft
                              </button>
                              <button onClick={() => markReplied(c.id)} className="text-xs px-2 py-1 rounded bg-success/15 text-success hover:bg-success/25">Replied</button>
                              {c.followup_round < 3 && (
                                <button onClick={() => advanceFollowup(c)} className="text-xs px-2 py-1 rounded bg-gold/15 text-gold hover:bg-gold/25">+FU</button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {draftOpen === c.id && (
                      <tr key={`${c.id}-draft`} className="bg-elevated/20">
                        <td colSpan={8} className="px-4 py-3">
                          <InlineDraft
                            loading={!!draftLoading[c.id]}
                            text={draftText[c.id] ?? ''}
                            onClose={() => setDraftOpen(null)}
                            onRefresh={() => { setDraftText((p) => ({ ...p, [c.id]: '' })); generateDraft(c); }}
                          />
                        </td>
                      </tr>
                    )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <p className="text-xs text-muted text-center">{filtered.length} of {totalSent} candidates</p>
      </SupabaseGate>

      {showNew && <NewCandidateModal roles={roles} onClose={() => setShowNew(false)} onCreated={() => { qc.invalidateQueries({ queryKey: ['candidates'] }); setShowNew(false); }} />}
    </div>
  );
}

function InlineDraft({ loading, text, onClose, onRefresh }: { loading: boolean; text: string; onClose: () => void; onRefresh: () => void }) {
  const [copied, setCopied] = useState(false);

  let body = text;
  try {
    const parsed = JSON.parse(text);
    body = parsed.body ?? text;
  } catch {}

  function copy() {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-gold/20 bg-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gold font-medium">
          <Sparkles size={12} />
          AI Draft — Contrario Voice
          {loading && <Loader2 size={11} className="animate-spin text-muted" />}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onRefresh} className="text-xs px-2 py-1 rounded border border-border text-muted hover:text-fg">Regenerate</button>
          <button onClick={onClose} className="p-1 text-muted hover:text-fg"><X size={13} /></button>
        </div>
      </div>
      {body && (
        <>
          <div className="text-sm text-fg whitespace-pre-wrap leading-relaxed font-mono bg-elevated/50 rounded-lg px-3 py-2.5 border border-border/50">
            {body}
          </div>
          <div className="flex justify-end">
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gold/15 text-gold hover:bg-gold/25 transition-colors"
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function NewCandidateModal({ roles, onClose, onCreated }: { roles: any[]; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [roleId, setRoleId] = useState('');
  const [introDate, setIntroDate] = useState(new Date().toISOString().split('T')[0]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const intro = new Date(introDate).toISOString();
    const next = nextFollowupDue(intro, 1);
    await supabase.from('candidates').insert({
      name, email, linkedin, role_id: roleId || null,
      intro_sent_at: intro,
      next_followup_due: next?.toISOString() || null,
    });
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6" onClick={onClose}>
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">New Candidate</h3>
          <button onClick={onClose} className="text-muted hover:text-fg"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input autoFocus required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm" />
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm" />
          <input placeholder="LinkedIn URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm" />
          <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm">
            <option value="">— Select role —</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.title} — {r.client?.name}</option>)}
          </select>
          <div>
            <label className="text-xs text-muted">Intro sent date</label>
            <input type="date" value={introDate} onChange={(e) => setIntroDate(e.target.value)} className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm mt-1" />
          </div>
          <button type="submit" className="btn-primary w-full">Add Candidate</button>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import PageHeader from '@/components/ui/PageHeader';
import SupabaseGate from '@/components/ui/SupabaseGate';
import { Badge } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { Plus, Search, Filter, X, Save, Trash2, FileText } from 'lucide-react';
import type { Role, RoleStatus, RoleType } from '@/lib/types';
import { cn } from '@/lib/utils';

const typeTones: Record<string, 'info' | 'success' | 'gold' | 'warning' | 'danger' | 'default'> = {
  Engineering: 'info',
  GTM: 'success',
  Sales: 'warning',
  Ops: 'gold',
  Design: 'danger',
  'Data / ML': 'info',
  Other: 'default',
};

const statusTones: Record<RoleStatus, 'info' | 'success' | 'gold' | 'warning' | 'danger' | 'muted'> = {
  draft: 'muted',
  jd_in_progress: 'warning',
  jd_complete: 'info',
  outreach_ready: 'gold',
  live: 'success',
  paused: 'warning',
  filled: 'success',
  cancelled: 'muted',
};

export default function JDsPage() {
  const enabled = isSupabaseConfigured();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selected, setSelected] = useState<Role | null>(null);
  const [showNew, setShowNew] = useState(false);

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase
        .from('roles')
        .select('*, client:clients(id, name)')
        .eq('archived', false)
        .order('created_at', { ascending: false });
      return (data || []) as Role[];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients-list'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase.from('clients').select('id, name').order('name');
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return roles
      .filter((r) => typeFilter === 'All' || r.type === typeFilter)
      .filter((r) => statusFilter === 'All' || r.status === statusFilter)
      .filter((r) => !q ||
        r.title.toLowerCase().includes(q) ||
        r.client?.name?.toLowerCase().includes(q) ||
        (r.location || '').toLowerCase().includes(q)
      );
  }, [roles, search, typeFilter, statusFilter]);

  async function deleteRole(id: string) {
    if (!confirm('Archive this role?')) return;
    await supabase.from('roles').update({ archived: true }).eq('id', id);
    qc.invalidateQueries({ queryKey: ['roles'] });
    setSelected(null);
  }

  async function saveRole(patch: Partial<Role>, id: string) {
    await supabase.from('roles').update(patch).eq('id', id);
    qc.invalidateQueries({ queryKey: ['roles'] });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="JD Tracker"
        description={`${roles.length} active roles across ${new Set(roles.map((r) => r.client_id)).size} clients`}
        action={
          <button onClick={() => setShowNew(true)} className="btn-primary inline-flex items-center gap-1.5">
            <Plus size={14} /> New Role
          </button>
        }
      />

      <SupabaseGate>
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search role, client, or location…"
              className="w-full bg-surface border border-border rounded-full pl-8 pr-4 py-2 text-sm focus:border-gold/50 focus:outline-none"
            />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-surface border border-border rounded-full px-3 py-2 text-sm">
            <option value="All">All Types</option>
            {['Engineering', 'GTM', 'Sales', 'Ops', 'Design', 'Data / ML', 'Other'].map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-surface border border-border rounded-full px-3 py-2 text-sm">
            <option value="All">All Statuses</option>
            {['draft', 'jd_in_progress', 'jd_complete', 'outreach_ready', 'live', 'paused', 'filled', 'cancelled'].map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText size={36} />}
            title={roles.length === 0 ? 'No roles yet' : 'No roles match your filters'}
            description={roles.length === 0 ? 'Run the seed SQL in your Supabase project to populate 88 JDs, or add your first role.' : 'Try clearing a filter.'}
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-elevated/30 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Client</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Comp</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Bounty</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className="border-b border-border/50 hover:bg-elevated/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{r.client?.name || '—'}</td>
                      <td className="px-4 py-3">{r.title}</td>
                      <td className="px-4 py-3"><Badge tone={typeTones[r.type || 'Other']}>{r.type || '—'}</Badge></td>
                      <td className="px-4 py-3 text-muted text-xs">{r.location || '—'}</td>
                      <td className="px-4 py-3 text-muted text-xs max-w-[200px] truncate" title={r.compensation || ''}>{r.compensation || '—'}</td>
                      <td className="px-4 py-3 text-center font-mono text-xs">{r.bounty || '—'}</td>
                      <td className="px-4 py-3 text-center"><Badge tone={statusTones[r.status]}>{r.status.replace('_', ' ')}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <p className="text-xs text-muted text-center">{filtered.length} of {roles.length} roles</p>
      </SupabaseGate>

      {selected && <RoleDetailPanel role={selected} onClose={() => setSelected(null)} onSave={(patch) => saveRole(patch, selected.id)} onDelete={() => deleteRole(selected.id)} />}

      {showNew && <NewRoleModal clients={clients} onClose={() => setShowNew(false)} onCreated={() => { qc.invalidateQueries({ queryKey: ['roles'] }); setShowNew(false); }} />}
    </div>
  );
}

function RoleDetailPanel({ role, onClose, onSave, onDelete }: { role: Role; onClose: () => void; onSave: (patch: Partial<Role>) => void; onDelete: () => void; }) {
  const [r, setR] = useState(role);
  const [dirty, setDirty] = useState(false);

  function set<K extends keyof Role>(k: K, v: Role[K]) {
    setR((prev) => ({ ...prev, [k]: v }));
    setDirty(true);
  }

  function save() {
    onSave(r);
    setDirty(false);
  }

  const sections: [string, keyof Role][] = [
    ['Internal Notes', 'internal_notes'],
    ['Intro Email Template', 'intro_email_template'],
    ['SEQ 1 — Cold Outreach', 'seq1_draft'],
    ['Connection Request', 'connection_request'],
    ['SEQ 2 — Follow-up', 'seq2_draft'],
    ['SEQ 3 — Final Nudge', 'seq3_draft'],
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div className="w-full max-w-2xl bg-surface border-l border-border overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-xs text-muted">{r.client?.name}</div>
            <h2 className="font-display font-bold text-lg">{r.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {dirty && (
              <button onClick={save} className="btn-primary text-xs inline-flex items-center gap-1">
                <Save size={12} /> Save
              </button>
            )}
            <button onClick={onDelete} className="p-2 rounded-lg text-muted hover:text-danger hover:bg-elevated">
              <Trash2 size={14} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-muted hover:text-fg hover:bg-elevated">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <Field label="Type">
              <select value={r.type || ''} onChange={(e) => set('type', e.target.value as RoleType)} className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm">
                <option value="">—</option>
                {['Engineering', 'GTM', 'Sales', 'Ops', 'Design', 'Data / ML', 'Other'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={r.status} onChange={(e) => set('status', e.target.value as RoleStatus)} className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm">
                {['draft', 'jd_in_progress', 'jd_complete', 'outreach_ready', 'live', 'paused', 'filled', 'cancelled'].map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </Field>
            <Field label="Location"><Input value={r.location || ''} onChange={(v) => set('location', v)} /></Field>
            <Field label="Remote Policy"><Input value={r.remote_policy || ''} onChange={(v) => set('remote_policy', v)} /></Field>
            <Field label="Compensation"><Input value={r.compensation || ''} onChange={(v) => set('compensation', v)} /></Field>
            <Field label="Equity"><Input value={r.equity || ''} onChange={(v) => set('equity', v)} /></Field>
            <Field label="Bounty"><Input value={r.bounty || ''} onChange={(v) => set('bounty', v)} /></Field>
            <Field label="YoE"><Input value={r.yoe || ''} onChange={(v) => set('yoe', v)} /></Field>
            <Field label="JD Link"><Input value={r.jd_link || ''} onChange={(v) => set('jd_link', v)} /></Field>
            <Field label="Ashby Link"><Input value={r.ashby_link || ''} onChange={(v) => set('ashby_link', v)} /></Field>
          </div>

          {/* Array sections */}
          <ArrayField label="Key Requirements" value={r.key_requirements || []} onChange={(v) => set('key_requirements', v)} />
          <ArrayField label="Nice-to-Haves" value={r.nice_to_haves || []} onChange={(v) => set('nice_to_haves', v)} />
          <ArrayField label="Green Flags" value={r.green_flags || []} onChange={(v) => set('green_flags', v)} tone="success" />
          <ArrayField label="Red Flags" value={r.red_flags || []} onChange={(v) => set('red_flags', v)} tone="danger" />
          <ArrayField label="Interview Process" value={r.interview_process || []} onChange={(v) => set('interview_process', v)} />

          {/* Text sections */}
          {sections.map(([label, key]) => (
            <div key={key}>
              <div className="text-xs text-muted uppercase tracking-wider mb-1.5">{label}</div>
              <textarea
                value={(r[key] as string) || ''}
                onChange={(e) => set(key, e.target.value as any)}
                rows={5}
                className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm font-mono resize-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted uppercase tracking-wider mb-1">{label}</div>
      {children}
    </div>
  );
}

function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm focus:border-gold/50 focus:outline-none"
    />
  );
}

function ArrayField({ label, value, onChange, tone = 'default' }: { label: string; value: string[]; onChange: (v: string[]) => void; tone?: 'default' | 'success' | 'danger' }) {
  const [input, setInput] = useState('');
  const ring = tone === 'success' ? 'border-success/30 bg-success/5 text-success' : tone === 'danger' ? 'border-danger/30 bg-danger/5 text-danger' : 'border-border bg-elevated';
  return (
    <div>
      <div className="text-xs text-muted uppercase tracking-wider mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((v, i) => (
          <span key={i} className={cn('text-xs px-2 py-1 rounded-full border inline-flex items-center gap-1.5', ring)}>
            {v}
            <button onClick={() => onChange(value.filter((_, j) => j !== i))} className="opacity-60 hover:opacity-100">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && input.trim()) {
            onChange([...value, input.trim()]);
            setInput('');
          }
        }}
        placeholder="Press Enter to add…"
        className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm focus:border-gold/50 focus:outline-none"
      />
    </div>
  );
}

function NewRoleModal({ clients, onClose, onCreated }: { clients: Array<{ id: string; name: string }>; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [type, setType] = useState<RoleType>('Engineering');
  const [location, setLocation] = useState('');
  const [compensation, setCompensation] = useState('');
  const [bounty, setBounty] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await supabase.from('roles').insert({
      title, client_id: clientId || null, type, location, compensation, bounty, status: 'draft',
    });
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6" onClick={onClose}>
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">New Role</h3>
          <button onClick={onClose} className="text-muted hover:text-fg"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Role title"><input autoFocus required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm" /></Field>
          <Field label="Client">
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm">
              <option value="">— Select client —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select value={type} onChange={(e) => setType(e.target.value as RoleType)} className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm">
                {['Engineering', 'GTM', 'Sales', 'Ops', 'Design', 'Data / ML', 'Other'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Location"><Input value={location} onChange={setLocation} /></Field>
          </div>
          <Field label="Compensation"><Input value={compensation} onChange={setCompensation} /></Field>
          <Field label="Bounty"><Input value={bounty} onChange={setBounty} /></Field>
          <button type="submit" className="btn-primary w-full">Create Role</button>
        </form>
      </div>
    </div>
  );
}

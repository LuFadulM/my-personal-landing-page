'use client';

import { useEffect, useMemo, useState } from 'react';
import { jds as seedJds, type JD } from '@/data/jds';
import { getStorage, setStorage } from '@/lib/storage';
import StatCard from './StatCard';
import { Plus, Trash2, Edit3, X, Save, Search } from 'lucide-react';

const KEY = 'cc_jds_v1';

interface StoredJD extends JD {
  id: string;
  createdAt: string;
  seeded?: boolean; // true if from data/jds.ts seed
}

function seedToStored(): StoredJD[] {
  return seedJds.map((j, i) => ({
    ...j,
    id: `seed-${i}`,
    createdAt: new Date('2026-03-01').toISOString(),
    seeded: true,
  }));
}

const empty: Omit<StoredJD, 'id' | 'createdAt'> = {
  role: '', co: '', bounty: '—',
  status: 'Draft', o1: 'Not Started', o2: 'Not Started', intro: 'Not Started', qa: false,
};

const statusColors = {
  Published: 'bg-healthy/15 text-healthy',
  Draft: 'bg-attention/15 text-attention',
  'In Review': 'bg-newrole/15 text-newrole',
};

const outreachColors = {
  Sent: 'bg-healthy/15 text-healthy',
  Drafted: 'bg-attention/15 text-attention',
  'Not Started': 'bg-border text-muted',
};

export default function JDTracker() {
  const [jds, setJds] = useState<StoredJD[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StoredJD | null>(null);
  const [form, setForm] = useState<Omit<StoredJD, 'id' | 'createdAt'>>(empty);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | JD['status']>('All');

  useEffect(() => {
    const stored = getStorage<StoredJD[] | null>(KEY, null);
    if (stored === null) {
      // First load — seed with hardcoded JDs
      const initial = seedToStored();
      setJds(initial);
      setStorage(KEY, initial);
    } else {
      setJds(stored);
    }
  }, []);

  function persist(next: StoredJD[]) {
    setJds(next);
    setStorage(KEY, next);
  }

  function openNew() {
    setEditing(null);
    setForm(empty);
    setShowForm(true);
  }

  function openEdit(jd: StoredJD) {
    setEditing(jd);
    setForm({
      role: jd.role, co: jd.co, bounty: jd.bounty,
      status: jd.status, o1: jd.o1, o2: jd.o2, intro: jd.intro, qa: jd.qa,
    });
    setShowForm(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.role.trim() || !form.co.trim()) return;

    if (editing) {
      persist(jds.map((j) => (j.id === editing.id ? { ...j, ...form } : j)));
    } else {
      const newJd: StoredJD = {
        ...form,
        id: `user-${Date.now().toString(36)}`,
        createdAt: new Date().toISOString(),
      };
      persist([newJd, ...jds]);
    }
    setShowForm(false);
    setEditing(null);
    setForm(empty);
  }

  function remove(id: string) {
    if (!confirm('Delete this JD?')) return;
    persist(jds.filter((j) => j.id !== id));
  }

  function resetSeed() {
    if (!confirm('Reset JD list to the original 38 seeded entries? This deletes any you added manually.')) return;
    const initial = seedToStored();
    persist(initial);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return jds
      .filter((j) => statusFilter === 'All' || j.status === statusFilter)
      .filter((j) => !q || j.role.toLowerCase().includes(q) || j.co.toLowerCase().includes(q));
  }, [jds, search, statusFilter]);

  const allComplete = jds.filter((j) => j.o1 === 'Sent' && j.o2 === 'Sent' && j.intro === 'Ready').length;
  const qaComplete = jds.filter((j) => j.qa).length;
  const drafts = jds.filter((j) => j.status === 'Draft').length;
  const published = jds.filter((j) => j.status === 'Published').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total JDs" value={jds.length} />
        <StatCard label="Published" value={published} color="text-healthy" />
        <StatCard label="Drafts" value={drafts} color="text-attention" />
        <StatCard
          label="All Outreach Done"
          value={jds.length ? `${Math.round((allComplete / jds.length) * 100)}%` : '0%'}
          color="text-healthy"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role or company..."
            className="w-full bg-card border border-border rounded-full pl-8 pr-3 py-1.5 text-xs text-fg focus:border-accent focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-card border border-border rounded-full px-3 py-1.5 text-xs text-fg"
        >
          <option value="All">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="In Review">In Review</option>
          <option value="Published">Published</option>
        </select>
        <button onClick={openNew} className="flex items-center gap-1 bg-accent/20 text-accent px-3 py-1.5 rounded-full text-xs font-medium hover:bg-accent/30">
          <Plus size={12} /> New JD
        </button>
        <button onClick={resetSeed} className="text-[10px] text-muted hover:text-fg">Reset to seed</button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">{editing ? 'Edit JD' : 'New JD'}</h3>
            <button onClick={() => setShowForm(false)} className="text-muted hover:text-fg"><X size={14} /></button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Role title"
                required
                autoFocus
                className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
              />
              <input
                value={form.co}
                onChange={(e) => setForm({ ...form, co: e.target.value })}
                placeholder="Company"
                required
                className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <input
                value={form.bounty}
                onChange={(e) => setForm({ ...form, bounty: e.target.value })}
                placeholder="Bounty"
                className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
              />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as JD['status'] })} className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg">
                <option value="Draft">Draft</option>
                <option value="In Review">In Review</option>
                <option value="Published">Published</option>
              </select>
              <select value={form.o1} onChange={(e) => setForm({ ...form, o1: e.target.value as JD['o1'] })} className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg">
                <option value="Not Started">O1: Not Started</option>
                <option value="Drafted">O1: Drafted</option>
                <option value="Sent">O1: Sent</option>
              </select>
              <select value={form.o2} onChange={(e) => setForm({ ...form, o2: e.target.value as JD['o2'] })} className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg">
                <option value="Not Started">O2: Not Started</option>
                <option value="Drafted">O2: Drafted</option>
                <option value="Sent">O2: Sent</option>
              </select>
              <select value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value as JD['intro'] })} className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg">
                <option value="Not Started">Intro: Not Started</option>
                <option value="Drafted">Intro: Drafted</option>
                <option value="Ready">Intro: Ready</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs text-fg cursor-pointer">
              <input
                type="checkbox"
                checked={form.qa}
                onChange={(e) => setForm({ ...form, qa: e.target.checked })}
                className="accent-accent"
              />
              QA completed
            </label>
            <div className="flex gap-2">
              <button type="submit" className="flex items-center gap-1 bg-accent text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-accent/80">
                <Save size={12} /> {editing ? 'Update' : 'Add'} JD
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-fg text-xs">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-border">
              <tr>
                <th className="px-3 py-2.5 text-left text-muted font-medium">Role</th>
                <th className="px-3 py-2.5 text-left text-muted font-medium">Client</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">Bounty</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">Status</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">O1</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">O2</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">Intro</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">QA</th>
                <th className="px-3 py-2.5 text-right text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-muted text-xs">
                    No JDs match the filters.
                  </td>
                </tr>
              ) : filtered.map((j) => (
                <tr key={j.id} className="border-b border-border/30 hover:bg-border/20">
                  <td className="px-3 py-2.5 font-medium text-fg">{j.role}</td>
                  <td className="px-3 py-2.5 text-muted">{j.co}</td>
                  <td className="px-3 py-2.5 text-center text-muted font-mono">{j.bounty}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`${statusColors[j.status]} text-[10px] px-2 py-0.5 rounded-full`}>{j.status}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`${outreachColors[j.o1]} text-[10px] px-2 py-0.5 rounded-full`}>{j.o1}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`${outreachColors[j.o2]} text-[10px] px-2 py-0.5 rounded-full`}>{j.o2}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`${outreachColors[j.intro === 'Ready' ? 'Sent' : j.intro]} text-[10px] px-2 py-0.5 rounded-full`}>{j.intro}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {j.qa ? <span className="text-healthy">&#10003;</span> : <span className="text-muted">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(j)} className="text-muted hover:text-accent p-1">
                        <Edit3 size={12} />
                      </button>
                      <button onClick={() => remove(j.id)} className="text-muted hover:text-risk p-1">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[10px] text-muted text-center">
        Showing {filtered.length} of {jds.length} JDs · {qaComplete} QA'd
      </p>
    </div>
  );
}

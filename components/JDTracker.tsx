'use client';

import { useEffect, useMemo, useState } from 'react';
import { jds as seedJds, functionColors, type JD } from '@/data/jds';
import { getStorage, setStorage } from '@/lib/storage';
import StatCard from './StatCard';
import { Plus, Trash2, Edit3, X, Save, Search } from 'lucide-react';

const KEY = 'cc_jds_v2';

interface StoredJD extends JD {
  id: string;
  createdAt: string;
  seeded?: boolean;
}

function seedToStored(): StoredJD[] {
  return seedJds.map((j, i) => ({
    ...j,
    id: `seed-${i}`,
    createdAt: new Date('2026-04-01').toISOString(),
    seeded: true,
  }));
}

const empty: Omit<StoredJD, 'id' | 'createdAt'> = {
  company: '', role: '', function: 'Engineering',
  location: '', compensation: 'TBD', yoe: 'TBD', bounty: 'TBD', ats: 'Contrario',
  status: 'Active',
};

const statusColors = {
  Active: 'bg-healthy/15 text-healthy',
  Complete: 'bg-border text-muted',
};

const functionOptions = ['Engineering', 'GTM', 'Sales', 'Ops', 'Design', 'Data / ML'];
const atsOptions = ['Contrario', 'Ashby', 'Calendly', 'Lever', 'Other'];

export default function JDTracker() {
  const [jds, setJds] = useState<StoredJD[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StoredJD | null>(null);
  const [form, setForm] = useState<Omit<StoredJD, 'id' | 'createdAt'>>(empty);
  const [search, setSearch] = useState('');
  const [fnFilter, setFnFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | JD['status']>('All');

  useEffect(() => {
    const stored = getStorage<StoredJD[] | null>(KEY, null);
    if (stored === null) {
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
      company: jd.company, role: jd.role, function: jd.function,
      location: jd.location, compensation: jd.compensation, yoe: jd.yoe,
      bounty: jd.bounty, ats: jd.ats, status: jd.status,
    });
    setShowForm(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.role.trim() || !form.company.trim()) return;

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
    if (!confirm('Reset JD list to the seeded entries? This deletes any you added manually.')) return;
    persist(seedToStored());
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return jds
      .filter((j) => fnFilter === 'All' || j.function === fnFilter)
      .filter((j) => statusFilter === 'All' || j.status === statusFilter)
      .filter((j) => !q ||
        j.role.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q)
      );
  }, [jds, search, fnFilter, statusFilter]);

  const active = jds.filter((j) => j.status === 'Active').length;
  const complete = jds.filter((j) => j.status === 'Complete').length;
  const companies = Array.from(new Set(jds.map((j) => j.company))).length;
  const byFunction = functionOptions.map((fn) => ({
    fn,
    count: jds.filter((j) => j.function === fn).length,
  })).filter((x) => x.count > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total JDs" value={jds.length} />
        <StatCard label="Active" value={active} color="text-healthy" />
        <StatCard label="Complete" value={complete} color="text-muted" />
        <StatCard label="Companies" value={companies} color="text-accent" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-[10px] text-muted uppercase tracking-wider mb-2">By Function</p>
        <div className="flex flex-wrap gap-2">
          {byFunction.map(({ fn, count }) => (
            <span key={fn} className={`${functionColors[fn] || 'bg-border text-muted'} text-xs px-2.5 py-1 rounded-full`}>
              {fn} <b>{count}</b>
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search role, company, or location..."
            className="w-full bg-card border border-border rounded-full pl-8 pr-3 py-1.5 text-xs text-fg focus:border-accent focus:outline-none"
          />
        </div>
        <select
          value={fnFilter}
          onChange={(e) => setFnFilter(e.target.value)}
          className="bg-card border border-border rounded-full px-3 py-1.5 text-xs text-fg"
        >
          <option value="All">All Functions</option>
          {functionOptions.map((fn) => <option key={fn} value={fn}>{fn}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-card border border-border rounded-full px-3 py-1.5 text-xs text-fg"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Complete">Complete</option>
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
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company"
                required
                autoFocus
                className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
              />
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Role title"
                required
                className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={form.function}
                onChange={(e) => setForm({ ...form, function: e.target.value })}
                className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg"
              >
                {functionOptions.map((fn) => <option key={fn} value={fn}>{fn}</option>)}
              </select>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Location (e.g. SF in-person, Remote LATAM)"
                className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
              />
              <input
                value={form.yoe}
                onChange={(e) => setForm({ ...form, yoe: e.target.value })}
                placeholder="YoE (e.g. 2-5, 5+, TBD)"
                className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
              />
            </div>
            <input
              value={form.compensation}
              onChange={(e) => setForm({ ...form, compensation: e.target.value })}
              placeholder="Compensation (e.g. $150K-$200K / 0.5% equity)"
              className="w-full bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                value={form.bounty}
                onChange={(e) => setForm({ ...form, bounty: e.target.value })}
                placeholder="Bounty %"
                className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
              />
              <select
                value={form.ats}
                onChange={(e) => setForm({ ...form, ats: e.target.value })}
                className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg"
              >
                {atsOptions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as JD['status'] })} className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg">
                <option value="Active">Active</option>
                <option value="Complete">Complete</option>
              </select>
            </div>
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
                <th className="px-3 py-2.5 text-left text-muted font-medium">Company</th>
                <th className="px-3 py-2.5 text-left text-muted font-medium">Role</th>
                <th className="px-3 py-2.5 text-left text-muted font-medium">Function</th>
                <th className="px-3 py-2.5 text-left text-muted font-medium">Location</th>
                <th className="px-3 py-2.5 text-left text-muted font-medium">Comp</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">YoE</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">Bounty</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">ATS</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">Status</th>
                <th className="px-3 py-2.5 text-right text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-muted text-xs">
                    No JDs match the filters.
                  </td>
                </tr>
              ) : filtered.map((j) => (
                <tr key={j.id} className="border-b border-border/30 hover:bg-border/20">
                  <td className="px-3 py-2.5 font-medium text-fg whitespace-nowrap">{j.company}</td>
                  <td className="px-3 py-2.5 text-fg">{j.role}</td>
                  <td className="px-3 py-2.5">
                    <span className={`${functionColors[j.function] || 'bg-border text-muted'} text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap`}>
                      {j.function}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted text-[11px]">{j.location}</td>
                  <td className="px-3 py-2.5 text-muted text-[11px] max-w-[180px] truncate" title={j.compensation}>{j.compensation}</td>
                  <td className="px-3 py-2.5 text-center text-muted font-mono">{j.yoe}</td>
                  <td className="px-3 py-2.5 text-center text-muted font-mono">{j.bounty}</td>
                  <td className="px-3 py-2.5 text-center text-muted text-[11px]">{j.ats}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`${statusColors[j.status]} text-[10px] px-2 py-0.5 rounded-full`}>{j.status}</span>
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
        Showing {filtered.length} of {jds.length} JDs across {companies} companies
      </p>
    </div>
  );
}

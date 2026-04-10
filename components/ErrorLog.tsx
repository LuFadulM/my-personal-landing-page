'use client';

import { useEffect, useState } from 'react';
import { getStorage, setStorage } from '@/lib/storage';
import { Plus, Trash2, X } from 'lucide-react';

const LOG_KEY = 'cc_error_log';

type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
type IssueType = 'Missed Follow-Up' | 'Wrong Info Sent' | 'Late Response' | 'ATS Gap' | 'Process Missing' | 'Client Complaint' | 'Recruiter Issue' | 'Data Error' | 'Improvement Idea';
type LogStatus = 'Open' | 'In Progress' | 'Fixed';

interface LogEntry {
  id: string;
  date: string;
  issue: string;
  type: IssueType;
  severity: Severity;
  client: string;
  rootCause: string;
  fix: string;
  prevention: string;
  status: LogStatus;
}

const issueTypes: IssueType[] = ['Missed Follow-Up', 'Wrong Info Sent', 'Late Response', 'ATS Gap', 'Process Missing', 'Client Complaint', 'Recruiter Issue', 'Data Error', 'Improvement Idea'];
const severities: Severity[] = ['Critical', 'High', 'Medium', 'Low'];

export default function ErrorLog() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<LogEntry, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    issue: '', type: 'Missed Follow-Up', severity: 'Medium', client: '', rootCause: '', fix: '', prevention: '', status: 'Open',
  });

  useEffect(() => { setEntries(getStorage(LOG_KEY, [])); }, []);

  function save(next: LogEntry[]) { setEntries(next); setStorage(LOG_KEY, next); }

  function add() {
    if (!form.issue.trim()) return;
    save([{ ...form, id: Date.now().toString(36) }, ...entries]);
    setForm({ ...form, issue: '', client: '', rootCause: '', fix: '', prevention: '' });
    setShowForm(false);
  }

  function remove(id: string) { save(entries.filter((e) => e.id !== id)); }

  function toggleStatus(id: string) {
    save(entries.map((e) => {
      if (e.id !== id) return e;
      const next: LogStatus = e.status === 'Open' ? 'In Progress' : e.status === 'In Progress' ? 'Fixed' : 'Open';
      return { ...e, status: next };
    }));
  }

  const open = entries.filter((e) => e.status !== 'Fixed').length;
  const byType = issueTypes.map((t) => ({ type: t, count: entries.filter((e) => e.type === t).length })).filter((t) => t.count > 0);

  const sevColor = (s: Severity) => s === 'Critical' ? 'bg-risk/15 text-risk' : s === 'High' ? 'bg-attention/15 text-attention' : s === 'Medium' ? 'bg-newrole/15 text-newrole' : 'bg-border text-muted';
  const statusColor = (s: LogStatus) => s === 'Open' ? 'bg-risk/15 text-risk' : s === 'In Progress' ? 'bg-attention/15 text-attention' : 'bg-healthy/15 text-healthy';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-xs">
          <span className="text-muted">Open: <b className="text-risk">{open}</b></span>
          {byType.map((t) => (
            <span key={t.type} className="text-muted">{t.type}: <b className="text-fg">{t.count}</b></span>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 bg-accent/20 text-accent px-3 py-1.5 rounded-full text-xs font-medium hover:bg-accent/30">
          {showForm ? <X size={12} /> : <Plus size={12} />} {showForm ? 'Cancel' : 'New Entry'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} type="date" className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as IssueType })} className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg">
              {issueTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as Severity })} className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg">
              {severities.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <input value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} placeholder="Issue description" className="w-full bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Client (optional)" className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none" />
            <input value={form.rootCause} onChange={(e) => setForm({ ...form, rootCause: e.target.value })} placeholder="Root cause" className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.fix} onChange={(e) => setForm({ ...form, fix: e.target.value })} placeholder="Fix applied" className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none" />
            <input value={form.prevention} onChange={(e) => setForm({ ...form, prevention: e.target.value })} placeholder="Prevention" className="bg-border/50 border border-border rounded-lg px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none" />
          </div>
          <button onClick={add} className="bg-accent text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-accent/80">Add Entry</button>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <p className="text-sm text-muted mb-2">No entries yet.</p>
          <p className="text-xs text-muted">Use this log to track errors, process gaps, and improvement ideas. Every entry should have a root cause, fix, and prevention plan.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-border">
                <tr>
                  <th className="px-3 py-2 text-left text-muted font-medium">Date</th>
                  <th className="px-3 py-2 text-left text-muted font-medium">Issue</th>
                  <th className="px-3 py-2 text-left text-muted font-medium">Type</th>
                  <th className="px-3 py-2 text-center text-muted font-medium">Severity</th>
                  <th className="px-3 py-2 text-left text-muted font-medium">Client</th>
                  <th className="px-3 py-2 text-center text-muted font-medium">Status</th>
                  <th className="px-3 py-2 text-center text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-border/30 hover:bg-border/20">
                    <td className="px-3 py-2 text-muted font-mono whitespace-nowrap">{e.date}</td>
                    <td className="px-3 py-2 text-fg font-medium max-w-[200px] truncate" title={e.issue}>{e.issue}</td>
                    <td className="px-3 py-2 text-muted">{e.type}</td>
                    <td className="px-3 py-2 text-center"><span className={`${sevColor(e.severity)} text-[10px] px-2 py-0.5 rounded-full`}>{e.severity}</span></td>
                    <td className="px-3 py-2 text-muted">{e.client || '—'}</td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => toggleStatus(e.id)} className={`${statusColor(e.status)} text-[10px] px-2 py-0.5 rounded-full cursor-pointer`}>{e.status}</button>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => remove(e.id)} className="text-muted hover:text-risk"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

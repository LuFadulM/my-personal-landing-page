'use client';

import { useState } from 'react';
import { Loader2, Copy, Check, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormState {
  company: string;
  role: string;
  compensation: string;
  equity: string;
  ote: string;
  requirements: string;
  interviewStages: string;
  notes: string;
}

const EMPTY: FormState = {
  company: '',
  role: '',
  compensation: '',
  equity: '',
  ote: '',
  requirements: '',
  interviewStages: '',
  notes: '',
};

const SECTIONS = ['JD BODY', 'SEQ 1 — COLD OUTREACH', 'SEQ 2 — FOLLOW-UP', 'SEQ 3 — FINAL NUDGE', 'INTRO EMAIL'];

function parseOutput(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const section of SECTIONS) {
    const re = new RegExp(`## ${section}\\s*\\n([\\s\\S]*?)(?=## [A-Z]|$)`, 'i');
    const m = raw.match(re);
    if (m) result[section] = m[1].trim();
  }
  if (!Object.keys(result).length) result['Full Output'] = raw;
  return result;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-border hover:border-gold/40 text-muted hover:text-fg transition-all"
    >
      {copied ? <Check size={11} className="text-success" /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-elevated/30 hover:bg-elevated/50 transition-colors"
      >
        <span className="font-mono text-xs font-medium uppercase tracking-wider text-muted">{title}</span>
        <div className="flex items-center gap-2">
          {open && <CopyButton text={content} />}
          {open ? <ChevronDown size={13} className="text-muted" /> : <ChevronRight size={13} className="text-muted" />}
        </div>
      </button>
      {open && (
        <div className="p-4">
          <pre className="text-sm text-fg whitespace-pre-wrap font-sans leading-relaxed">{content}</pre>
        </div>
      )}
    </div>
  );
}

export default function JDCreator() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [raw, setRaw] = useState('');
  const [loading, setLoading] = useState(false);

  function set(k: keyof FormState, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) return;
    setRaw('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/jd-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setRaw((prev) => prev + decoder.decode(value));
      }
    } catch {
      setRaw('Error generating JD. Check ANTHROPIC_API_KEY.');
    } finally {
      setLoading(false);
    }
  }

  const parsed = raw ? parseOutput(raw) : null;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={15} className="text-gold" />
          <h2 className="font-display font-bold text-base">JD Quick-Create</h2>
        </div>

        <form onSubmit={generate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Company *">
              <input
                required
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="e.g. Acme Corp"
                className="input"
              />
            </Field>
            <Field label="Role Title *">
              <input
                required
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="input"
              />
            </Field>
            <Field label="Base Compensation">
              <input
                value={form.compensation}
                onChange={(e) => set('compensation', e.target.value)}
                placeholder="e.g. $180k–$220k base"
                className="input"
              />
            </Field>
            <Field label="Equity">
              <input
                value={form.equity}
                onChange={(e) => set('equity', e.target.value)}
                placeholder="e.g. 0.10%–0.25%"
                className="input"
              />
            </Field>
            <Field label="OTE (if applicable)">
              <input
                value={form.ote}
                onChange={(e) => set('ote', e.target.value)}
                placeholder="e.g. $260k–$300k OTE"
                className="input"
              />
            </Field>
          </div>

          <Field label="Key Requirements">
            <textarea
              value={form.requirements}
              onChange={(e) => set('requirements', e.target.value)}
              placeholder="e.g. 5+ years backend, TypeScript, distributed systems experience..."
              rows={3}
              className="input resize-none"
            />
          </Field>

          <Field label="Interview Stages">
            <textarea
              value={form.interviewStages}
              onChange={(e) => set('interviewStages', e.target.value)}
              placeholder="e.g. Intro call (30m) → Technical screen (60m) → System design (90m) → Offer"
              rows={2}
              className="input resize-none"
            />
          </Field>

          <Field label="Additional Notes">
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Venture-backed info, traction signals, hiring urgency, any context..."
              rows={2}
              className="input resize-none"
            />
          </Field>

          <button
            type="submit"
            disabled={loading || !form.company.trim() || !form.role.trim()}
            className="btn-primary inline-flex items-center gap-2 disabled:opacity-40"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? 'Generating…' : 'Generate JD Package'}
          </button>
        </form>
      </div>

      {loading && !raw && (
        <div className="card p-8 text-center">
          <Loader2 size={20} className="animate-spin text-gold mx-auto mb-2" />
          <p className="text-sm text-muted">Drafting your JD package…</p>
        </div>
      )}

      {parsed && (
        <div className="space-y-3">
          {Object.entries(parsed).map(([title, content]) => (
            <Section key={title} title={title} content={content} />
          ))}
        </div>
      )}

      {loading && raw && (
        <div className="space-y-3">
          {Object.entries(parseOutput(raw)).map(([title, content]) => (
            <Section key={title} title={title} content={content} />
          ))}
          <div className="flex items-center gap-2 text-xs text-muted px-1">
            <Loader2 size={11} className="animate-spin" /> Generating…
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

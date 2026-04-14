'use client';

import { useEffect, useState } from 'react';
import { getStorage, setStorage } from '@/lib/storage';
import { Save, Trash2, ClipboardCopy, ChevronDown, ChevronRight, FileText } from 'lucide-react';

const SCANS_KEY = 'cc_daily_scans';

interface Scan {
  id: string;
  date: string;
  content: string;
  stats: {
    replied: number;
    pending: number;
    needsFU: number;
  };
}

const SAMPLE_REPORT = `# Contrario Daily Inbox Scan
Date: ${new Date().toISOString().split('T')[0]}

## Summary
- Total threads scanned (last 14 days): 131
- Replied: —
- Pending (<3 days): —
- Needs Follow-Up (3+ days, no reply): —

## Needs Follow-Up Today (Round 1)
- [Candidate] — [Role] @ [Company] — sent 3 days ago

## Needs Follow-Up Today (Round 2)
- [Candidate] — [Role] @ [Company] — sent 6 days ago

## Needs Follow-Up Today (Round 3 — new thread)
- [Candidate] — [Role] @ [Company] — sent 9 days ago

## Drafts Created
- [Count] follow-up drafts created in Gmail

## Notes
- [Any anomalies or blockers]
`;

export default function DailyScan() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [content, setContent] = useState(SAMPLE_REPORT);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setScans(getStorage<Scan[]>(SCANS_KEY, []));
  }, []);

  function extractStats(text: string): Scan['stats'] {
    const replied = parseInt(text.match(/Replied[:\s]+(\d+)/i)?.[1] || '0', 10);
    const pending = parseInt(text.match(/Pending[^:]*:\s*(\d+)/i)?.[1] || '0', 10);
    const needsFU = parseInt(text.match(/Needs Follow[- ]Up[^:]*:\s*(\d+)/i)?.[1] || '0', 10);
    return { replied, pending, needsFU };
  }

  function save() {
    if (!content.trim()) return;
    const scan: Scan = {
      id: Date.now().toString(36),
      date: new Date().toISOString().split('T')[0],
      content,
      stats: extractStats(content),
    };
    const next = [scan, ...scans];
    setScans(next);
    setStorage(SCANS_KEY, next);
    setContent(SAMPLE_REPORT);
  }

  function remove(id: string) {
    const next = scans.filter((s) => s.id !== id);
    setScans(next);
    setStorage(SCANS_KEY, next);
  }

  async function copy(scan: Scan) {
    await navigator.clipboard.writeText(scan.content);
    setCopied(scan.id);
    setTimeout(() => setCopied(null), 2000);
  }

  const latest = scans[0];

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText size={14} /> Paste Today's Daily Scan
            </h3>
            <p className="text-[11px] text-muted mt-1">
              Run the n8n workflow or the Claude Code inbox scan, then paste the output report here. Stats auto-extract from the "Replied / Pending / Needs Follow-Up" lines.
            </p>
          </div>
          <button
            onClick={save}
            className="flex items-center gap-1 bg-accent/20 text-accent px-3 py-1.5 rounded-full text-xs font-medium hover:bg-accent/30"
          >
            <Save size={12} /> Save Scan
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          className="w-full bg-border/50 border border-border rounded-lg px-3 py-2 text-xs text-fg font-mono focus:border-accent focus:outline-none"
        />
      </div>

      {latest && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-[10px] text-muted uppercase tracking-wider">Latest Scan · {latest.date}</p>
            <p className="text-2xl font-bold text-healthy mt-1">{latest.stats.replied}</p>
            <p className="text-xs text-muted">Replied</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-[10px] text-muted uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-attention mt-1">{latest.stats.pending}</p>
            <p className="text-xs text-muted">&lt; 3 days</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-[10px] text-muted uppercase tracking-wider">Needs FU</p>
            <p className="text-2xl font-bold text-risk mt-1">{latest.stats.needsFU}</p>
            <p className="text-xs text-muted">3+ days no reply</p>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-3">Scan History ({scans.length})</h3>
        {scans.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-sm text-muted">No scans saved yet. Paste one above to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {scans.map((scan) => {
              const isOpen = expanded === scan.id;
              return (
                <div key={scan.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3">
                    <button
                      onClick={() => setExpanded(isOpen ? null : scan.id)}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                    >
                      {isOpen ? <ChevronDown size={14} className="text-muted" /> : <ChevronRight size={14} className="text-muted" />}
                      <span className="text-sm font-mono text-fg">{scan.date}</span>
                      <span className="text-[10px] text-muted ml-auto mr-3 flex gap-3">
                        <span className="text-healthy">{scan.stats.replied} replied</span>
                        <span className="text-attention">{scan.stats.pending} pending</span>
                        <span className="text-risk">{scan.stats.needsFU} FU</span>
                      </span>
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => copy(scan)} className="text-muted hover:text-fg" title="Copy to clipboard">
                        {copied === scan.id ? <Check size={12} /> : <ClipboardCopy size={12} />}
                      </button>
                      <button onClick={() => remove(scan.id)} className="text-muted hover:text-risk">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <pre className="px-4 pb-4 text-[11px] font-mono text-muted whitespace-pre-wrap border-t border-border bg-bg/40 pt-3 max-h-96 overflow-y-auto">
                      {scan.content}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Check({ size }: { size: number }) {
  return <span className="text-healthy text-[10px] leading-none" style={{ fontSize: size }}>✓</span>;
}

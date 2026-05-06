'use client';

import { useEffect, useState } from 'react';
import { Check, Circle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const TASKS = [
  { id: 'inbox-scan', label: 'Inbox scan', description: 'Check who replied, scheduled, or withdrew', href: '/emails' },
  { id: 'followups', label: 'Draft follow-ups', description: 'Threads 3+ days old with no response', href: '/emails?filter=needs_fu' },
  { id: 'slack-sweep', label: 'Recruiter Slack sweep', description: 'Answer questions from recruiters', href: '/tags' },
  { id: 'client-channels', label: 'Client channels review', description: 'Pending approvals, unread messages', href: '/' },
  { id: 'client-dashboard', label: 'Client dashboard check', description: 'Pipeline + pending candidates', href: '/clients' },
  { id: 'jd-creation', label: 'JD creation (if requested)', description: 'Draft any new JDs requested today', href: '/agent?tab=jd' },
  { id: 'respond-tags', label: 'Respond to all @tags', description: 'Clear all @lucia mentions', href: '/tags' },
];

function getTodayKey() {
  return `checklist-${new Date().toISOString().split('T')[0]}`;
}

export default function DailyChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(getTodayKey());
      if (saved) setChecked(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem(getTodayKey(), JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  const done = checked.size;
  const total = TASKS.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-base">Daily Ops Checklist</h2>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted">{done}/{total}</span>
          <div className="w-20 h-1.5 bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {TASKS.map((task) => {
          const isDone = checked.has(task.id);
          return (
            <div
              key={task.id}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                isDone ? 'opacity-50' : 'hover:bg-elevated/50'
              )}
            >
              <button
                onClick={() => toggle(task.id)}
                className={cn(
                  'shrink-0 w-4 h-4 rounded border transition-all flex items-center justify-center',
                  isDone
                    ? 'bg-gold border-gold text-black'
                    : 'border-border hover:border-gold/60'
                )}
              >
                {isDone && <Check size={10} strokeWidth={3} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', isDone && 'line-through')}>{task.label}</p>
                <p className="text-xs text-muted truncate">{task.description}</p>
              </div>
              <Link
                href={task.href}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-muted hover:text-fg transition-all"
              >
                <ArrowRight size={13} />
              </Link>
            </div>
          );
        })}
      </div>

      {done === total && (
        <div className="mt-4 px-3 py-2 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-medium text-center">
          All done — Lucía, you ran the ops today.
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { CheckSquare, Square, RotateCcw } from 'lucide-react';

const checklistItems = [
  'Check #operations for new @mentions',
  'Check all client channels for updates',
  'Check #bugs channel',
  'Review recruiter channels',
  'Check DMs from Will and Arya',
  'Action all pending @Lucía tasks',
  'Verify intro emails sent for new roles',
  'Follow up with stale candidates',
  'Verify all calendar links are active',
  'Review pipeline for archived/rejected candidates',
  'React ✅ to completed tasks in Slack',
  'Final check on intro email delivery',
];

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export default function DailyChecklist() {
  const [checked, setChecked] = useState<boolean[]>(
    new Array(checklistItems.length).fill(false)
  );
  const [dateKey, setDateKey] = useState('');

  useEffect(() => {
    const today = getTodayKey();
    setDateKey(today);
    const stored = localStorage.getItem(`contrario_checklist_${today}`);
    if (stored) {
      setChecked(JSON.parse(stored));
    } else {
      setChecked(new Array(checklistItems.length).fill(false));
    }
  }, []);

  const toggle = (index: number) => {
    const next = [...checked];
    next[index] = !next[index];
    setChecked(next);
    localStorage.setItem(
      `contrario_checklist_${dateKey}`,
      JSON.stringify(next)
    );
  };

  const resetAll = () => {
    const fresh = new Array(checklistItems.length).fill(false);
    setChecked(fresh);
    localStorage.setItem(
      `contrario_checklist_${dateKey}`,
      JSON.stringify(fresh)
    );
  };

  const completed = checked.filter(Boolean).length;
  const total = checklistItems.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Daily Checklist</h2>
          <p className="text-sm text-gray-400 mt-1">
            {dateKey} &mdash; {completed}/{total} completed
          </p>
        </div>
        <button
          onClick={resetAll}
          className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      <div className="mb-4">
        <div className="w-full bg-bg-hover rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-right text-xs text-gray-500 mt-1">{pct}%</p>
      </div>

      <div className="space-y-1">
        {checklistItems.map((item, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
              checked[i]
                ? 'bg-accent/10 text-accent'
                : 'bg-bg-card hover:bg-bg-hover text-gray-300'
            }`}
          >
            {checked[i] ? (
              <CheckSquare size={20} className="text-accent shrink-0" />
            ) : (
              <Square size={20} className="text-gray-500 shrink-0" />
            )}
            <span
              className={`text-sm ${checked[i] ? 'line-through opacity-70' : ''}`}
            >
              {item}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { followUps as initialFollowUps } from '../data/seed';
import HealthBadge from './HealthBadge';
import type { FollowUp, HealthStatus } from '../data/types';

export default function FollowUpTracker() {
  const [items, setItems] = useState<FollowUp[]>(initialFollowUps);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showResolved, setShowResolved] = useState(false);
  const [healthFilter, setHealthFilter] = useState<HealthStatus | 'All'>('All');

  const toggleResolved = (id: string) => {
    setItems((prev) =>
      prev.map((f) => (f.id === id ? { ...f, resolved: !f.resolved } : f))
    );
  };

  const active = items
    .filter((f) => !f.resolved)
    .filter((f) => healthFilter === 'All' || f.health === healthFilter);
  const resolved = items.filter((f) => f.resolved);

  const urgencyColor = (days: number) => {
    if (days >= 21) return 'text-red-400';
    if (days >= 14) return 'text-orange-400';
    if (days >= 7) return 'text-amber-400';
    return 'text-gray-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Follow-Up Tracker</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {active.length} roles need attention &middot; {resolved.length} resolved
          </p>
        </div>
        <select
          className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-xs text-white focus:border-brand-500/50 outline-none"
          value={healthFilter}
          onChange={(e) => setHealthFilter(e.target.value as HealthStatus | 'All')}
        >
          <option value="All">All Statuses</option>
          <option value="Needs Attention">Needs Attention</option>
          <option value="At Risk">At Risk</option>
        </select>
      </div>

      <div className="space-y-2">
        {active.map((item) => (
          <div
            key={item.id}
            className="bg-surface-card border border-surface-border rounded-xl p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white text-sm">
                    {item.clientName}
                  </span>
                  <span className="text-gray-600">/</span>
                  <span className="text-sm text-gray-300">{item.roleTitle}</span>
                  <HealthBadge status={item.health} size="xs" />
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-xs">
                  {item.pendingCount > 0 && (
                    <span className="text-amber-400">
                      {item.pendingCount} pending review
                    </span>
                  )}
                  <span className={urgencyColor(item.daysSinceResponse)}>
                    <Clock size={10} className="inline mr-1" />
                    Last response {item.daysSinceResponse}d ago
                  </span>
                </div>
                {item.note && (
                  <p className="text-[11px] text-gray-500 mt-1 italic">
                    {item.note}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleResolved(item.id)}
                  className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs px-3 py-2 rounded-lg transition-colors"
                >
                  <CheckCircle size={14} /> Mark Resolved
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <MessageSquare size={12} className="text-gray-500 shrink-0" />
              <input
                className="flex-1 bg-surface border border-surface-border rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:border-brand-500/50 outline-none"
                placeholder="Add a note or reminder..."
                value={notes[item.id] || ''}
                onChange={(e) =>
                  setNotes({ ...notes, [item.id]: e.target.value })
                }
              />
            </div>
          </div>
        ))}

        {active.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No roles need follow-up right now.</p>
          </div>
        )}
      </div>

      {resolved.length > 0 && (
        <div>
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 mb-2"
          >
            {showResolved ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Resolved ({resolved.length})
          </button>
          {showResolved && (
            <div className="space-y-1">
              {resolved.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-card/50 border border-surface-border/50 rounded-lg p-3 flex items-center justify-between opacity-50"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 line-through">
                      {item.clientName} / {item.roleTitle}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleResolved(item.id)}
                    className="text-[10px] text-gray-500 hover:text-gray-300"
                  >
                    Unresolve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

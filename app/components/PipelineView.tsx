'use client';

import { useMemo, useState } from 'react';
import {
  GitBranch,
  User,
  Building2,
  Briefcase,
  Filter,
  Search,
} from 'lucide-react';
import { allCandidates } from '../data/seed';
import type { CandidateStage } from '../data/types';

const STAGES: CandidateStage[] = [
  'Application Review',
  'Pending Approval',
  'Initial Screen',
  'Round 2',
  'Founder vibe check',
  'Final Review',
  'Offer Stage',
];

const stageColors: Record<CandidateStage, { bg: string; border: string; dot: string }> = {
  'Application Review': { bg: 'bg-slate-500/10', border: 'border-slate-500/30', dot: 'bg-slate-400' },
  'Pending Approval': { bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  'Initial Screen': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: 'bg-blue-400' },
  'Round 2': { bg: 'bg-purple-500/10', border: 'border-purple-500/30', dot: 'bg-purple-400' },
  'Founder vibe check': { bg: 'bg-pink-500/10', border: 'border-pink-500/30', dot: 'bg-pink-400' },
  'Final Review': { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  'Offer Stage': { bg: 'bg-green-500/10', border: 'border-green-500/30', dot: 'bg-green-400' },
};

export default function PipelineView() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<CandidateStage | 'All'>('All');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allCandidates.filter((c) => {
      const matchStage = stageFilter === 'All' || c.stage === stageFilter;
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.roleTitle.toLowerCase().includes(q);
      return matchStage && matchSearch;
    });
  }, [search, stageFilter]);

  const grouped = useMemo(() => {
    const map = new Map<CandidateStage, typeof filtered>();
    STAGES.forEach((s) => map.set(s, []));
    filtered.forEach((c) => {
      const arr = map.get(c.stage);
      if (arr) arr.push(c);
    });
    return map;
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Stage Pipeline</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {allCandidates.length} candidates across all stages
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="bg-surface-card border border-surface-border rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-brand-500/50 outline-none w-52"
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-xs text-white focus:border-brand-500/50 outline-none"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as CandidateStage | 'All')}
          >
            <option value="All">All Stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban-style columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
        {STAGES.map((stage) => {
          const candidates = grouped.get(stage) || [];
          if (stageFilter !== 'All' && stage !== stageFilter) return null;
          const sc = stageColors[stage];

          return (
            <div key={stage} className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
              <div className={`px-4 py-2.5 border-b ${sc.border} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                  <span className="text-xs font-semibold text-gray-300">{stage}</span>
                </div>
                <span className="text-[10px] text-gray-500 bg-surface px-2 py-0.5 rounded-full">
                  {candidates.length}
                </span>
              </div>
              <div className="p-2 space-y-1.5 max-h-80 overflow-y-auto scrollbar-thin">
                {candidates.length === 0 ? (
                  <p className="text-[10px] text-gray-600 text-center py-4">No candidates</p>
                ) : (
                  candidates.map((cand) => (
                    <div
                      key={cand.id}
                      className={`${sc.bg} border ${sc.border} rounded-lg p-2.5`}
                    >
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-gray-400 shrink-0" />
                        <span className="text-xs font-medium text-white truncate">
                          {cand.name}
                        </span>
                      </div>
                      <div className="mt-1.5 space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <Building2 size={9} /> {cand.clientName}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <Briefcase size={9} /> {cand.roleTitle}
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[9px] text-gray-600">
                          {cand.recruiter}
                        </span>
                        {cand.reviewStatus === 'pending' && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                            Review
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building2,
  Briefcase,
} from 'lucide-react';
import { forReviewCandidates } from '../data/seed';
import type { Candidate, ReviewAction } from '../data/types';

export default function ForReview() {
  const [candidates, setCandidates] = useState<Candidate[]>(forReviewCandidates);
  const [filter, setFilter] = useState<ReviewAction | 'all'>('pending');

  const act = (id: string, action: ReviewAction) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, reviewStatus: action } : c))
    );
  };

  const filtered = candidates.filter(
    (c) => filter === 'all' || c.reviewStatus === filter
  );

  const counts = {
    pending: candidates.filter((c) => c.reviewStatus === 'pending').length,
    approved: candidates.filter((c) => c.reviewStatus === 'approved').length,
    rejected: candidates.filter((c) => c.reviewStatus === 'rejected').length,
  };

  const daysSince = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    return Math.floor((now.getTime() - d.getTime()) / 86400000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">For Review</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {counts.pending} pending &middot; {counts.approved} approved &middot;{' '}
            {counts.rejected} rejected
          </p>
        </div>
        <div className="flex gap-1 bg-surface-card border border-surface-border rounded-lg p-0.5">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors capitalize ${
                filter === f
                  ? 'bg-brand-500/20 text-brand-400 font-medium'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {f}
              {f !== 'all' && (
                <span className="ml-1 text-[10px] opacity-60">
                  ({counts[f as keyof typeof counts]})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((cand) => {
          const days = daysSince(cand.submittedDate);
          return (
            <div
              key={cand.id}
              className={`bg-surface-card border rounded-xl p-4 transition-all ${
                cand.reviewStatus === 'approved'
                  ? 'border-emerald-500/20 opacity-70'
                  : cand.reviewStatus === 'rejected'
                  ? 'border-red-500/20 opacity-50'
                  : 'border-surface-border'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <User size={14} className="text-brand-400 shrink-0" />
                    <span className="font-medium text-white text-sm">
                      {cand.name}
                    </span>
                    {days >= 3 && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400">
                        <Clock size={10} /> {days}d waiting
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building2 size={11} /> {cand.clientName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={11} /> {cand.roleTitle}
                    </span>
                    <span>Recruiter: {cand.recruiter}</span>
                  </div>
                </div>

                {cand.reviewStatus === 'pending' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => act(cand.id, 'approved')}
                      className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs px-3 py-2 rounded-lg transition-colors"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      onClick={() => act(cand.id, 'rejected')}
                      className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg transition-colors"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                ) : (
                  <span
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg ${
                      cand.reviewStatus === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {cand.reviewStatus === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No candidates in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

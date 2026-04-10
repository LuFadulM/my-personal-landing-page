'use client';

import { forReviewCandidates } from '@/data/candidates';

export default function Candidates() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">{forReviewCandidates.length} shown of 42 total in For Review queue (as of April 10, 2026)</p>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-border">
              <tr>
                <th className="px-3 py-2.5 text-left text-muted font-medium">Candidate</th>
                <th className="px-3 py-2.5 text-left text-muted font-medium">Role</th>
                <th className="px-3 py-2.5 text-left text-muted font-medium">Client</th>
                <th className="px-3 py-2.5 text-left text-muted font-medium">Recruiter</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">Tier</th>
                <th className="px-3 py-2.5 text-center text-muted font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {forReviewCandidates.map((c, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-border/20">
                  <td className="px-3 py-2.5 font-medium text-fg">{c.name}</td>
                  <td className="px-3 py-2.5 text-muted">{c.role}</td>
                  <td className="px-3 py-2.5 text-muted">{c.co}</td>
                  <td className="px-3 py-2.5 text-muted">{c.rec}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      c.tier === 'T2' ? 'bg-healthy/15 text-healthy' :
                      c.tier === 'T3' ? 'bg-newrole/15 text-newrole' :
                      'bg-border text-muted'
                    }`}>{c.tier}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="bg-attention/15 text-attention text-[10px] px-2 py-0.5 rounded-full font-medium">{c.st}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

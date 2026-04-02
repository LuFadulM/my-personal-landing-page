'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle, MessageSquare } from 'lucide-react';

interface Client {
  id: string;
  name: string;
}

interface Role {
  id: string;
  clientId: string;
  title: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  introEmailSent: boolean;
  introEmailDate: string;
  replied: boolean;
  notes: string;
  clientId: string;
  roleId: string;
}

function getDaysSince(dateStr: string): number {
  if (!dateStr) return 0;
  const sent = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - sent.getTime()) / (1000 * 60 * 60 * 24));
}

export default function FollowUpQueue() {
  const [clients, setClients] = useState<Client[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [followUpNotes, setFollowUpNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    setClients(JSON.parse(localStorage.getItem('contrario_clients') || '[]'));
    setRoles(JSON.parse(localStorage.getItem('contrario_roles') || '[]'));
    setCandidates(JSON.parse(localStorage.getItem('contrario_candidates') || '[]'));
  }, []);

  const needsFollowUp = candidates
    .filter(
      (c) =>
        c.introEmailSent && !c.replied && getDaysSince(c.introEmailDate) >= 2
    )
    .sort(
      (a, b) =>
        getDaysSince(b.introEmailDate) - getDaysSince(a.introEmailDate)
    );

  const markAsReplied = (id: string) => {
    const updated = candidates.map((c) =>
      c.id === id ? { ...c, replied: true } : c
    );
    setCandidates(updated);
    localStorage.setItem('contrario_candidates', JSON.stringify(updated));
  };

  const getClientName = (clientId: string) =>
    clients.find((c) => c.id === clientId)?.name || 'Unknown';

  const getRoleTitle = (roleId: string) =>
    roles.find((r) => r.id === roleId)?.title || 'Unknown';

  const urgencyColor = (days: number) => {
    if (days >= 7) return 'text-red-400';
    if (days >= 4) return 'text-orange-400';
    return 'text-yellow-400';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Follow-Up Queue</h2>
        <span className="text-sm text-gray-400">
          {needsFollowUp.length} candidate{needsFollowUp.length !== 1 && 's'}{' '}
          awaiting reply
        </span>
      </div>

      {needsFollowUp.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <CheckCircle size={48} className="mx-auto mb-3 opacity-50" />
          <p>All caught up! No pending follow-ups.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {needsFollowUp.map((cand) => {
            const days = getDaysSince(cand.introEmailDate);
            return (
              <div
                key={cand.id}
                className="bg-bg-card border border-gray-800 rounded-xl p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-medium text-white">
                        {cand.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {cand.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="text-gray-400">
                        {getClientName(cand.clientId)} &rarr;{' '}
                        {getRoleTitle(cand.roleId)}
                      </span>
                      <span
                        className={`flex items-center gap-1 font-medium ${urgencyColor(
                          days
                        )}`}
                      >
                        <Clock size={14} />
                        {days} day{days !== 1 && 's'} waiting
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => markAsReplied(cand.id)}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1 shrink-0"
                  >
                    <CheckCircle size={14} /> Mark as Replied
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <MessageSquare size={14} className="text-gray-500 shrink-0" />
                  <input
                    className="flex-1 bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none"
                    placeholder="Follow-up note..."
                    value={followUpNotes[cand.id] || ''}
                    onChange={(e) =>
                      setFollowUpNotes({
                        ...followUpNotes,
                        [cand.id]: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

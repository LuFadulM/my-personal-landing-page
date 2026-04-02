'use client';

import { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Building2,
  Users,
  Clock,
  Search,
  Filter,
} from 'lucide-react';
import { clients } from '../data/seed';
import { cn } from '../lib/utils';
import HealthBadge from './HealthBadge';
import type { HealthStatus } from '../data/types';

export default function ClientList() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState<HealthStatus | 'All'>('All');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients
      .map((client) => {
        const roles = client.roles.filter((r) => {
          const matchHealth = healthFilter === 'All' || r.health === healthFilter;
          const matchSearch =
            !q ||
            client.name.toLowerCase().includes(q) ||
            r.title.toLowerCase().includes(q);
          return matchHealth && matchSearch;
        });
        return { ...client, roles };
      })
      .filter((c) => c.roles.length > 0);
  }, [search, healthFilter]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Clients & Roles</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {clients.length} clients &middot; {clients.reduce((a, c) => a + c.roles.length, 0)} roles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="bg-surface-card border border-surface-border rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-brand-500/50 outline-none w-56"
              placeholder="Search clients or roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-xs text-white focus:border-brand-500/50 outline-none"
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value as HealthStatus | 'All')}
          >
            <option value="All">All Health</option>
            <option value="Healthy">Healthy</option>
            <option value="Needs Attention">Needs Attention</option>
            <option value="At Risk">At Risk</option>
            <option value="New Role">New Role</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        {filtered.map((client) => {
          const isOpen = expanded.has(client.id);
          const totalCands = client.roles.reduce((a, r) => a + r.totalCandidates, 0);
          const totalPending = client.roles.reduce((a, r) => a + r.pendingReview, 0);

          return (
            <div key={client.id} className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(client.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-hover transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isOpen ? (
                    <ChevronDown size={16} className="text-brand-400 shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-500 shrink-0" />
                  )}
                  <Building2 size={16} className="text-brand-400 shrink-0" />
                  <span className="font-medium text-white text-sm truncate">
                    {client.name}
                  </span>
                  <span className="text-[10px] text-gray-500 shrink-0">
                    {client.roles.length} role{client.roles.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="flex items-center gap-1 text-[10px] text-gray-500">
                    <Users size={10} /> {totalCands}
                  </span>
                  {totalPending > 0 && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">
                      {totalPending} pending
                    </span>
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-3 border-t border-surface-border/50">
                  <table className="w-full mt-2">
                    <thead>
                      <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                        <th className="text-left py-1.5 pl-8">Role</th>
                        <th className="text-left py-1.5">Health</th>
                        <th className="text-center py-1.5">Candidates</th>
                        <th className="text-center py-1.5">Pending</th>
                        <th className="text-left py-1.5">Recruiters</th>
                        <th className="text-right py-1.5 pr-2">Last Response</th>
                      </tr>
                    </thead>
                    <tbody>
                      {client.roles.map((role) => (
                        <tr
                          key={role.id}
                          className="border-t border-surface-border/30 hover:bg-surface-hover/50 transition-colors"
                        >
                          <td className="py-2.5 pl-8 text-sm text-gray-200">
                            {role.title}
                          </td>
                          <td className="py-2.5">
                            <HealthBadge status={role.health} size="xs" />
                          </td>
                          <td className="py-2.5 text-center text-xs text-gray-400">
                            {role.totalCandidates}
                          </td>
                          <td className="py-2.5 text-center">
                            {role.pendingReview > 0 ? (
                              <span className="text-xs text-amber-400 font-medium">
                                {role.pendingReview}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-600">0</span>
                            )}
                          </td>
                          <td className="py-2.5 text-[11px] text-gray-400">
                            {role.activeRecruiters.join(', ')}
                          </td>
                          <td className={cn(
                            'py-2.5 pr-2 text-right text-[11px]',
                            role.lastResponseDaysAgo >= 14 ? 'text-red-400' :
                            role.lastResponseDaysAgo >= 7 ? 'text-amber-400' : 'text-gray-500'
                          )}>
                            {role.lastResponseDaysAgo === 0
                              ? 'Today'
                              : `${role.lastResponseDaysAgo}d ago`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No clients match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

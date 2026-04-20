'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import PageHeader from '@/components/ui/PageHeader';
import SupabaseGate from '@/components/ui/SupabaseGate';
import StatCard from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { Search, Building2, MapPin, DollarSign, Briefcase, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Role } from '@/lib/types';

const typeTones: Record<string, 'info' | 'success' | 'gold' | 'warning' | 'danger' | 'default'> = {
  Engineering: 'info',
  GTM: 'success',
  Sales: 'warning',
  Ops: 'gold',
  Design: 'danger',
  'Data / ML': 'info',
  Other: 'default',
};

export default function PortfolioPage() {
  const enabled = isSupabaseConfigured();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');

  const { data: roles = [] } = useQuery({
    queryKey: ['portfolio-roles'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase
        .from('roles')
        .select('*, client:clients(id, name)')
        .eq('archived', false)
        .order('created_at', { ascending: false });
      return (data || []) as Role[];
    },
  });

  const types = useMemo(() => {
    const set = new Set(roles.map((r) => r.type).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [roles]);

  const locations = useMemo(() => {
    const set = new Set(roles.map((r) => (r.location || '').split('/')[0].trim()).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [roles]);

  const clients = useMemo(() => Array.from(new Set(roles.map((r) => r.client?.name).filter(Boolean))).sort(), [roles]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return roles
      .filter((r) => typeFilter === 'All' || r.type === typeFilter)
      .filter((r) => locationFilter === 'All' || (r.location || '').includes(locationFilter))
      .filter((r) => !q ||
        r.title.toLowerCase().includes(q) ||
        (r.client?.name || '').toLowerCase().includes(q) ||
        (r.location || '').toLowerCase().includes(q) ||
        (r.compensation || '').toLowerCase().includes(q)
      );
  }, [roles, search, typeFilter, locationFilter]);

  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    roles.forEach((r) => { const t = r.type || 'Other'; map[t] = (map[t] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [roles]);

  function exportCSV() {
    const header = 'Company,Role,Function,Location,Compensation,YoE,Bounty,Status\n';
    const rows = filtered.map((r) =>
      `"${r.client?.name || ''}","${r.title}","${r.type || ''}","${r.location || ''}","${(r.compensation || '').replace(/"/g, '""')}","${r.yoe || ''}","${r.bounty || ''}","${r.status}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contrario-portfolio-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Portfolio"
        description={`${roles.length} roles across ${clients.length} clients`}
        action={
          <button onClick={exportCSV} className="btn-secondary inline-flex items-center gap-1.5 text-xs">
            <Download size={13} /> Export CSV
          </button>
        }
      />

      <SupabaseGate>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Roles" value={roles.length} tone="gold" />
          <StatCard label="Clients" value={clients.length} />
          <StatCard label="Showing" value={filtered.length} tone="info" />
          <StatCard
            label="Top Function"
            value={byType[0] ? `${byType[0][0]} (${byType[0][1]})` : '—'}
            tone="success"
          />
        </div>

        {/* Function breakdown */}
        <div className="flex flex-wrap gap-2">
          {byType.map(([type, count]) => (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? 'All' : type)}
              className={cn(
                'chip transition-all cursor-pointer',
                typeFilter === type ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-elevated text-muted hover:text-fg'
              )}
            >
              {type} <span className="font-mono ml-1">{count}</span>
            </button>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[260px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role, company, location, or compensation…"
              className="w-full bg-surface border border-border rounded-full pl-8 pr-4 py-2 text-sm focus:border-gold/50 focus:outline-none"
            />
          </div>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="bg-surface border border-border rounded-full px-3 py-2 text-xs"
          >
            {locations.map((l) => <option key={l} value={l}>{l === 'All' ? 'All Locations' : l}</option>)}
          </select>
        </div>

        {/* Role cards */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Briefcase size={32} />}
            title="No roles match your filters"
            description="Try broadening your search or clearing a filter."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((r) => (
              <div key={r.id} className="card p-5 transition-all hover:border-gold/30 group">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-semibold text-sm leading-tight group-hover:text-gold transition-colors">
                      {r.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted">
                      <Building2 size={11} />
                      <span>{r.client?.name || '—'}</span>
                    </div>
                  </div>
                  <Badge tone={typeTones[r.type || 'Other']}>{r.type || '—'}</Badge>
                </div>

                <div className="space-y-1.5 text-xs text-muted">
                  {r.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={11} />
                      <span>{r.location}</span>
                    </div>
                  )}
                  {r.compensation && r.compensation !== 'TBD' && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={11} />
                      <span className="truncate" title={r.compensation}>{r.compensation}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-xs">
                    {r.bounty && r.bounty !== 'TBD' && (
                      <span className="font-mono text-gold">{r.bounty}</span>
                    )}
                    {r.yoe && r.yoe !== 'TBD' && (
                      <span className="text-muted">{r.yoe} YoE</span>
                    )}
                  </div>
                  <Badge tone={r.status === 'live' ? 'success' : r.status === 'filled' ? 'muted' : 'warning'}>
                    {r.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted text-center">
          Showing {filtered.length} of {roles.length} roles
        </p>
      </SupabaseGate>
    </div>
  );
}

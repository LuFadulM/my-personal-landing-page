'use client';

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  followUpStore,
  seedFollowUpsIfNeeded,
  type FollowUp,
  type FUPCategory,
} from '@/lib/store';
import { formatRelative } from '@/lib/utils';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  MessageSquare,
  Clock,
  Flag,
  Archive,
  Building2,
} from 'lucide-react';

const categoryConfig: Record<
  FUPCategory,
  { label: string; dot: string; badge: string; text: string; rank: number }
> = {
  urgent: {
    label: 'Urgent',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700',
    text: 'text-red-600',
    rank: 0,
  },
  nudge: {
    label: 'Needs Nudge',
    dot: 'bg-orange-500',
    badge: 'bg-orange-100 text-orange-700',
    text: 'text-orange-600',
    rank: 1,
  },
  no_fup: {
    label: 'No FUP yet',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    text: 'text-amber-600',
    rank: 2,
  },
  active: {
    label: 'Active thread',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    text: 'text-emerald-600',
    rank: 3,
  },
  fup_sent: {
    label: 'FUP sent',
    dot: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    text: 'text-blue-600',
    rank: 4,
  },
  in_thread: {
    label: 'In thread',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-700',
    text: 'text-slate-600',
    rank: 5,
  },
  flagged: {
    label: 'Flagged',
    dot: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-700',
    text: 'text-rose-600',
    rank: 6,
  },
};

export default function FollowUpsPage() {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [query, setQuery] = useState('');
  const [company, setCompany] = useState('All');
  const [category, setCategory] = useState<'All' | FUPCategory>('All');
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    seedFollowUpsIfNeeded();
    setItems(followUpStore.list());
  }, []);

  const refresh = () => setItems(followUpStore.list());

  const companies = useMemo(() => {
    const set = new Set(items.map((i) => i.company));
    return ['All', ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items
      .filter((i) => (showResolved ? i.resolved : !i.resolved))
      .filter((i) => company === 'All' || i.company === company)
      .filter((i) => category === 'All' || i.category === category)
      .filter(
        (i) =>
          !q ||
          i.name.toLowerCase().includes(q) ||
          i.role.toLowerCase().includes(q) ||
          i.company.toLowerCase().includes(q) ||
          i.notes.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const rank = categoryConfig[a.category].rank - categoryConfig[b.category].rank;
        if (rank !== 0) return rank;
        return new Date(a.dateSent).getTime() - new Date(b.dateSent).getTime();
      });
  }, [items, query, company, category, showResolved]);

  const stats = useMemo(() => {
    const active = items.filter((i) => !i.resolved);
    const counts = active.reduce<Record<string, number>>((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    }, {});
    return {
      total: active.length,
      urgent: (counts.urgent || 0) + (counts.nudge || 0),
      noFup: counts.no_fup || 0,
      active: counts.active || 0,
      inThread: (counts.in_thread || 0) + (counts.fup_sent || 0),
    };
  }, [items]);

  function markResolved(id: string) {
    followUpStore.update(id, { resolved: true });
    refresh();
  }

  function unresolve(id: string) {
    followUpStore.update(id, { resolved: false });
    refresh();
  }

  function changeCategory(id: string, cat: FUPCategory) {
    followUpStore.update(id, { category: cat });
    refresh();
  }

  return (
    <div className="px-5 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Follow-Up Tracker"
        description={`${stats.total} active candidates across ${companies.length - 1} companies`}
      />

      {/* Stat bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatPill
          label="Urgent / Nudge"
          value={stats.urgent}
          icon={AlertOctagon}
          color="text-red-600"
          bg="bg-red-50"
        />
        <StatPill
          label="No FUP yet"
          value={stats.noFup}
          icon={Clock}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatPill
          label="Active threads"
          value={stats.active}
          icon={MessageSquare}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatPill
          label="FUP sent / in thread"
          value={stats.inThread}
          icon={CheckCircle2}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, role, company, or notes..."
            className="pl-8 rounded-full"
          />
        </div>
        <Select
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="sm:w-48 rounded-full"
        >
          {companies.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All Companies' : c}
            </option>
          ))}
        </Select>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value as 'All' | FUPCategory)}
          className="sm:w-48 rounded-full"
        >
          <option value="All">All Categories</option>
          <option value="urgent">Urgent</option>
          <option value="nudge">Needs Nudge</option>
          <option value="no_fup">No FUP yet</option>
          <option value="active">Active thread</option>
          <option value="fup_sent">FUP sent</option>
          <option value="in_thread">In thread</option>
          <option value="flagged">Flagged</option>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={() => setShowResolved(!showResolved)}
        >
          {showResolved ? 'Show Active' : `Show Resolved`}
        </Button>
      </div>

      {/* Results table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Company
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="text-center px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Thread
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-muted-foreground">
                      No follow-ups match these filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const cfg = categoryConfig[item.category];
                    return (
                      <tr
                        key={item.id}
                        className={`border-b hover:bg-muted/20 transition-colors ${
                          item.resolved ? 'opacity-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                              {item.name[0]}
                            </div>
                            <span className="font-medium text-foreground">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {item.role}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Building2 size={11} className="text-muted-foreground" />
                            {item.company}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelative(item.dateSent)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              item.threadCount >= 4 ? 'text-emerald-600' : 'text-muted-foreground'
                            }`}
                          >
                            <MessageSquare size={11} />
                            {item.threadCount}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.badge}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[240px] truncate">
                          {item.notes}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!item.resolved ? (
                              <>
                                <button
                                  title="Mark resolved"
                                  onClick={() => markResolved(item.id)}
                                  className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors"
                                >
                                  <CheckCircle2 size={13} />
                                </button>
                                <button
                                  title="Flag"
                                  onClick={() => changeCategory(item.id, 'flagged')}
                                  className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors"
                                >
                                  <Flag size={13} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => unresolve(item.id)}
                                className="text-[11px] text-primary hover:underline"
                              >
                                Unresolve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground mt-3 text-center">
        Showing {filtered.length} of {stats.total} {showResolved ? 'resolved' : 'active'} follow-ups
      </p>
    </div>
  );
}

function StatPill({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`${bg} p-2 rounded-lg`}>
          <Icon className={color} size={18} />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-[11px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

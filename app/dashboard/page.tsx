'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardStats, seedFollowUpsIfNeeded } from '@/lib/store';
import { formatRelative } from '@/lib/utils';
import {
  AlertOctagon,
  Clock,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Building2,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<ReturnType<typeof getDashboardStats> | null>(null);

  useEffect(() => {
    seedFollowUpsIfNeeded();
    setStats(getDashboardStats());
  }, []);

  if (!stats) {
    return (
      <div className="px-5 lg:px-8 py-6 max-w-[1400px] mx-auto">
        <PageHeader title="Dashboard" description="Your daily operations at a glance." />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const cards = [
    {
      label: 'Urgent Follow-Ups',
      value: stats.followUpUrgent,
      icon: AlertOctagon,
      href: '/followups',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'No FUP Yet',
      value: stats.followUpNoFup,
      icon: Clock,
      href: '/followups',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Active Threads',
      value: stats.followUpActive,
      icon: MessageSquare,
      href: '/followups',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Tasks Due Today',
      value: stats.tasksDueToday,
      icon: CheckCircle2,
      href: '/tasks',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="px-5 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Dashboard"
        description={`${stats.followUpTotal} active follow-ups · ${stats.jdCount} job positions · ${stats.tasksDueToday} tasks due today`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href}>
              <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-5 flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                  <div className={`${card.bg} p-2.5 rounded-lg`}>
                    <Icon className={card.color} size={18} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Needs Attention</CardTitle>
            <Link
              href="/followups"
              className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1"
            >
              View all follow-ups <ArrowRight size={11} />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {stats.recentFollowUps.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              All caught up.
            </p>
          ) : (
            <div className="space-y-1">
              {stats.recentFollowUps.map((f) => {
                const dotColor =
                  f.category === 'urgent'
                    ? 'bg-red-500'
                    : f.category === 'nudge'
                    ? 'bg-orange-500'
                    : f.category === 'no_fup'
                    ? 'bg-amber-500'
                    : f.category === 'active'
                    ? 'bg-emerald-500'
                    : 'bg-slate-400';
                return (
                  <Link
                    key={f.id}
                    href="/followups"
                    className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-muted/40 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                      {f.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {f.role} · {f.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      <span className="text-[11px] text-muted-foreground">
                        {formatRelative(f.dateSent)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

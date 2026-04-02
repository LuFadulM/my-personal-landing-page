'use client';

import {
  Users,
  ClipboardCheck,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Building2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { clients, getHealthSummary, forReviewCandidates, followUps } from '../data/seed';
import type { Section } from './Sidebar';

interface Props {
  onNavigate: (s: Section) => void;
}

const COLORS = {
  Healthy: '#34d399',
  'Needs Attention': '#fbbf24',
  'At Risk': '#f87171',
  'New Role': '#60a5fa',
};

export default function DashboardOverview({ onNavigate }: Props) {
  const health = getHealthSummary();
  const totalClients = clients.length;
  const urgentRoles = followUps.filter((f) => !f.resolved);

  const chartData = [
    { name: 'Healthy', value: health.healthy },
    { name: 'Needs Attention', value: health.needsAttention },
    { name: 'At Risk', value: health.atRisk },
    { name: 'New Role', value: health.newRole },
  ];

  const statCards = [
    {
      label: 'Active Clients',
      value: totalClients,
      icon: Building2,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10',
      nav: 'clients' as Section,
    },
    {
      label: 'Active Roles',
      value: health.total,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      nav: 'clients' as Section,
    },
    {
      label: 'For Review',
      value: forReviewCandidates.length,
      icon: ClipboardCheck,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      nav: 'review' as Section,
    },
    {
      label: 'At Risk / Attention',
      value: urgentRoles.length,
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      nav: 'followup' as Section,
    },
  ];

  const topUrgent = followUps
    .filter((f) => !f.resolved)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 mt-1">
          {totalClients} clients &middot; {health.total} active roles &middot;{' '}
          {forReviewCandidates.length} pending review
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => onNavigate(card.nav)}
              className="bg-surface-card border border-surface-border rounded-xl p-4 flex items-center gap-3 hover:border-brand-500/40 transition-all text-left group"
            >
              <div className={`${card.bg} p-2.5 rounded-lg group-hover:scale-105 transition-transform`}>
                <Icon className={card.color} size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{card.value}</p>
                <p className="text-[11px] text-gray-500">{card.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut Chart */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Role Health Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[entry.name as keyof typeof COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1c24',
                    border: '1px solid #35354a',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-xs text-gray-400">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {chartData.map((d) => (
              <div key={d.name} className="text-center">
                <p className="text-lg font-bold text-white">{d.value}</p>
                <p className="text-[10px] text-gray-500">{d.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Roles */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Most Urgent Roles</h3>
            <button
              onClick={() => onNavigate('followup')}
              className="text-[11px] text-brand-400 hover:text-brand-300"
            >
              View all &rarr;
            </button>
          </div>
          <div className="space-y-2">
            {topUrgent.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface-hover transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white font-medium truncate">
                    {item.clientName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{item.roleTitle}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  {item.pendingCount > 0 && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">
                      {item.pendingCount} pending
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500">
                    {item.daysSinceResponse}d ago
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import PageHeader from '@/components/ui/PageHeader';
import SupabaseGate from '@/components/ui/SupabaseGate';
import StatCard from '@/components/ui/StatCard';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, FunnelChart, Funnel, LabelList, PieChart, Pie, Cell } from 'recharts';
import { Save, TrendingUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { KPIEntry } from '@/lib/types';

const chartColors = { intros: '#E8C872', responses: '#5BB98C', interviews: '#6B9FD4', offers: '#E8A838', placements: '#D4544E' };

export default function KPIsPage() {
  const enabled = isSupabaseConfigured();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: entries = [] } = useQuery({
    queryKey: ['kpi-entries'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase.from('kpi_entries').select('*').order('date', { ascending: true }).limit(90);
      return (data || []) as KPIEntry[];
    },
  });

  const last30 = entries.slice(-30);
  const chartData = last30.map((e) => ({
    date: formatDate(e.date, 'MMM d'),
    intros: e.intros_sent,
    responses: e.responses_received,
    interviews: e.interviews_scheduled,
    offers: e.offers_extended,
    placements: e.placements,
    responseRate: e.intros_sent > 0 ? Math.round((e.responses_received / e.intros_sent) * 100) : 0,
    jdsDrafted: e.jds_drafted,
    jdsCompleted: e.jds_completed,
  }));

  const totals = entries.reduce(
    (acc, e) => {
      acc.intros += e.intros_sent;
      acc.responses += e.responses_received;
      acc.interviews += e.interviews_scheduled;
      acc.offers += e.offers_extended;
      acc.placements += e.placements;
      return acc;
    },
    { intros: 0, responses: 0, interviews: 0, offers: 0, placements: 0 }
  );

  const funnel = [
    { name: 'Intros', value: totals.intros, fill: '#E8C872' },
    { name: 'Responses', value: totals.responses, fill: '#5BB98C' },
    { name: 'Interviews', value: totals.interviews, fill: '#6B9FD4' },
    { name: 'Offers', value: totals.offers, fill: '#E8A838' },
    { name: 'Placements', value: totals.placements, fill: '#D4544E' },
  ];

  const latest = entries[entries.length - 1];
  const prev = entries[entries.length - 2];

  const weekData = useMemo(() => {
    const thisWeek = entries.slice(-7).reduce((a, e) => ({
      intros: a.intros + e.intros_sent,
      responses: a.responses + e.responses_received,
      interviews: a.interviews + e.interviews_scheduled,
      fuSent: a.fuSent + e.followups_sent,
    }), { intros: 0, responses: 0, interviews: 0, fuSent: 0 });
    const lastWeek = entries.slice(-14, -7).reduce((a, e) => ({
      intros: a.intros + e.intros_sent,
      responses: a.responses + e.responses_received,
      interviews: a.interviews + e.interviews_scheduled,
      fuSent: a.fuSent + e.followups_sent,
    }), { intros: 0, responses: 0, interviews: 0, fuSent: 0 });
    return { thisWeek, lastWeek };
  }, [entries]);

  async function logEntry(payload: Partial<KPIEntry>) {
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase.from('kpi_entries').select('id').eq('date', today).maybeSingle();
    if (existing) {
      await supabase.from('kpi_entries').update(payload).eq('id', existing.id);
    } else {
      await supabase.from('kpi_entries').insert({ ...payload, date: today, period: 'daily' });
    }
    qc.invalidateQueries({ queryKey: ['kpi-entries'] });
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="KPIs"
        description="Log daily numbers, track trends over time."
        action={
          <button onClick={() => setShowForm(!showForm)} className="btn-primary inline-flex items-center gap-1.5">
            <TrendingUp size={14} /> {showForm ? 'Hide form' : "Log today's KPIs"}
          </button>
        }
      />

      <SupabaseGate>
        {showForm && <DailyInput latest={latest} onSave={logEntry} />}

        {/* Top-line stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard label="Intros (total)" value={totals.intros} tone="gold" />
          <StatCard label="Responses" value={totals.responses} tone="success" hint={totals.intros ? `${Math.round(totals.responses / totals.intros * 100)}% rate` : undefined} />
          <StatCard label="Interviews" value={totals.interviews} tone="info" />
          <StatCard label="Offers" value={totals.offers} tone="warning" />
          <StatCard label="Placements" value={totals.placements} tone="danger" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Intros vs Responses bar */}
          <div className="card p-5">
            <h3 className="text-sm font-display font-semibold mb-3">Intros Sent vs Responses (last 30 days)</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgb(var(--muted))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgb(var(--muted))' }} />
                  <Tooltip contentStyle={{ background: 'rgb(var(--elevated))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="intros" fill={chartColors.intros} name="Intros" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="responses" fill={chartColors.responses} name="Responses" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Response rate trend */}
          <div className="card p-5">
            <h3 className="text-sm font-display font-semibold mb-3">Response Rate Trend</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgb(var(--muted))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgb(var(--muted))' }} unit="%" />
                  <Tooltip contentStyle={{ background: 'rgb(var(--elevated))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="responseRate" stroke="#E8C872" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pipeline funnel */}
          <div className="card p-5">
            <h3 className="text-sm font-display font-semibold mb-3">Pipeline Funnel (all time)</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip contentStyle={{ background: 'rgb(var(--elevated))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Funnel dataKey="value" data={funnel} isAnimationActive>
                    <LabelList position="right" fill="rgb(var(--fg))" stroke="none" dataKey="name" style={{ fontSize: 11 }} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* JD production */}
          <div className="card p-5">
            <h3 className="text-sm font-display font-semibold mb-3">JD Production Rate</h3>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgb(var(--muted))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgb(var(--muted))' }} />
                  <Tooltip contentStyle={{ background: 'rgb(var(--elevated))', border: '1px solid rgb(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="jdsDrafted" fill="#6B9FD4" name="Drafted" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="jdsCompleted" fill="#5BB98C" name="Completed" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Weekly scorecard */}
        <div className="card p-5">
          <h3 className="text-sm font-display font-semibold mb-3">Weekly Scorecard</h3>
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th className="pb-2 text-xs font-medium text-muted uppercase">Metric</th>
                <th className="pb-2 text-right text-xs font-medium text-muted uppercase">Last Week</th>
                <th className="pb-2 text-right text-xs font-medium text-muted uppercase">This Week</th>
                <th className="pb-2 text-right text-xs font-medium text-muted uppercase">Δ</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Intros sent', weekData.lastWeek.intros, weekData.thisWeek.intros],
                ['Responses', weekData.lastWeek.responses, weekData.thisWeek.responses],
                ['Interviews scheduled', weekData.lastWeek.interviews, weekData.thisWeek.interviews],
                ['Follow-ups sent', weekData.lastWeek.fuSent, weekData.thisWeek.fuSent],
              ].map(([label, prev, cur]) => {
                const diff = Number(cur) - Number(prev);
                const tone = diff > 0 ? 'text-success' : diff < 0 ? 'text-danger' : 'text-muted';
                return (
                  <tr key={label as string} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5">{label}</td>
                    <td className="py-2.5 text-right font-mono text-muted">{prev as number}</td>
                    <td className="py-2.5 text-right font-mono font-semibold">{cur as number}</td>
                    <td className={`py-2.5 text-right font-mono text-xs ${tone}`}>{diff > 0 ? `+${diff}` : diff}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SupabaseGate>
    </div>
  );
}

function DailyInput({ latest, onSave }: { latest?: KPIEntry; onSave: (payload: Partial<KPIEntry>) => void }) {
  const [form, setForm] = useState({
    intros_sent: 0,
    responses_received: 0,
    interviews_scheduled: 0,
    offers_extended: 0,
    placements: 0,
    jds_drafted: 0,
    jds_completed: 0,
    followups_sent: 0,
    notes: '',
  });

  const N = (k: keyof typeof form, label: string) => (
    <div>
      <label className="text-xs text-muted uppercase tracking-wider">{label}</label>
      <input
        type="number"
        min={0}
        value={form[k] as number}
        onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) || 0 })}
        className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm font-mono mt-1"
      />
    </div>
  );

  return (
    <div className="card p-5 border-gold/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-base">Log today's numbers</h3>
        {latest && <span className="text-xs text-muted">Last entry: {formatDate(latest.date, 'MMM d, yyyy')}</span>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {N('intros_sent', 'Intros Sent')}
        {N('responses_received', 'Responses')}
        {N('interviews_scheduled', 'Interviews')}
        {N('offers_extended', 'Offers')}
        {N('placements', 'Placements')}
        {N('jds_drafted', 'JDs Drafted')}
        {N('jds_completed', 'JDs Completed')}
        {N('followups_sent', 'Follow-ups Sent')}
      </div>
      <div className="mt-3">
        <label className="text-xs text-muted uppercase tracking-wider">Notes</label>
        <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm mt-1" />
      </div>
      <button onClick={() => onSave(form)} className="btn-primary mt-4 inline-flex items-center gap-1.5">
        <Save size={14} /> Save today's entry
      </button>
    </div>
  );
}

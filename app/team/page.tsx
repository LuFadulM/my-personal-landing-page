'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import PageHeader from '@/components/ui/PageHeader';
import SupabaseGate from '@/components/ui/SupabaseGate';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

const team = [
  { name: 'Arya', role: 'Recruiter', color: 'from-blue-500 to-purple-500' },
  { name: 'Will Zhong', role: 'Recruiter', color: 'from-emerald-500 to-teal-500' },
  { name: 'Rio', role: 'Recruiter', color: 'from-pink-500 to-rose-500' },
  { name: 'Anam', role: 'Recruiter', color: 'from-amber-500 to-orange-500' },
  { name: 'Caroline', role: 'Ops', color: 'from-cyan-500 to-blue-500' },
  { name: 'Calum', role: 'Recruiter', color: 'from-violet-500 to-fuchsia-500' },
  { name: 'Tae', role: 'Internal Tooling', color: 'from-slate-500 to-gray-500' },
];

export default function TeamPage() {
  const enabled = isSupabaseConfigured();
  const { data: tasks = [] } = useQuery({
    queryKey: ['team-tasks'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase.from('tasks').select('assigned_to, status').not('assigned_to', 'is', null);
      return data || [];
    },
  });

  const { data: candidates = [] } = useQuery({
    queryKey: ['team-candidates'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase.from('candidates').select('intro_sent_by, response_status, intro_sent_at')
        .gte('intro_sent_at', new Date(Date.now() - 7 * 86400000).toISOString());
      return data || [];
    },
  });

  const workload = team.map((t) => {
    const assignedTasks = tasks.filter((x) => x.assigned_to === t.name);
    const openTasks = assignedTasks.filter((x) => x.status !== 'done' && x.status !== 'blocked').length;
    const sent = candidates.filter((c) => (c.intro_sent_by || '').toLowerCase().includes(t.name.toLowerCase().split(' ')[0])).length;
    const replied = candidates.filter((c) => (c.intro_sent_by || '').toLowerCase().includes(t.name.toLowerCase().split(' ')[0]) && c.response_status === 'replied').length;
    const rate = sent ? Math.round((replied / sent) * 100) : 0;
    return { ...t, openTasks, sent, rate };
  });

  const max = Math.max(...workload.map((w) => w.openTasks), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Pulse"
        description="Who's doing what this week."
      />

      <SupabaseGate>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workload.map((m) => (
            <div key={m.name} className="card p-5 transition-all hover:border-gold/30">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn('w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-semibold text-sm', m.color)}>
                  {m.name[0]}
                </div>
                <div>
                  <div className="font-display font-semibold text-sm">{m.name}</div>
                  <div className="text-xs text-muted">{m.role}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="font-mono text-lg font-semibold">{m.openTasks}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">Open Tasks</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-semibold text-gold">{m.sent}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">Sent (7d)</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-semibold text-success">{m.rate}%</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">Reply Rate</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Workload heatmap */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-base mb-4">Workload distribution</h3>
          <div className="space-y-2">
            {workload.map((m) => {
              const pct = (m.openTasks / max) * 100;
              const tone = pct > 75 ? 'bg-danger' : pct > 50 ? 'bg-warning' : pct > 0 ? 'bg-success' : 'bg-muted';
              return (
                <div key={m.name} className="flex items-center gap-3">
                  <div className="w-24 text-sm">{m.name}</div>
                  <div className="flex-1 h-5 bg-elevated rounded-full overflow-hidden">
                    <div className={cn('h-full transition-all', tone)} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-12 text-xs text-muted text-right font-mono">{m.openTasks}</div>
                </div>
              );
            })}
          </div>
        </div>
      </SupabaseGate>
    </div>
  );
}

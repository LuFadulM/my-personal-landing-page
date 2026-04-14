'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatDate, daysSince } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import { Badge, Dot } from '@/components/ui/Badge';
import SupabaseGate from '@/components/ui/SupabaseGate';
import { CheckCircle2, Mail, Clock, Users, ArrowRight, Circle, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const enabled = isSupabaseConfigured();

  const { data: tasks = [] } = useQuery({
    queryKey: ['dashboard-tasks'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*, client:clients(name), role:roles(title)')
        .neq('status', 'done')
        .order('priority', { ascending: true })
        .order('due_date', { ascending: true })
        .limit(10);
      return data || [];
    },
  });

  const { data: todayKPI } = useQuery({
    queryKey: ['dashboard-today-kpi'],
    enabled,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase.from('kpi_entries').select('*').eq('date', today).maybeSingle();
      return data;
    },
  });

  const { data: followups = [] } = useQuery({
    queryKey: ['dashboard-followups'],
    enabled,
    queryFn: async () => {
      const today = new Date().toISOString();
      const { data } = await supabase
        .from('candidates')
        .select('*, role:roles(title, client:clients(name))')
        .eq('response_status', 'pending')
        .lte('next_followup_due', today)
        .eq('archived', false)
        .order('next_followup_due', { ascending: true })
        .limit(10);
      return data || [];
    },
  });

  const { data: activeRolesCount = 0 } = useQuery({
    queryKey: ['dashboard-active-roles'],
    enabled,
    queryFn: async () => {
      const { count } = await supabase
        .from('roles')
        .select('*', { count: 'exact', head: true })
        .in('status', ['live', 'outreach_ready', 'jd_complete'])
        .eq('archived', false);
      return count || 0;
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['dashboard-clients'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase
        .from('clients')
        .select('*, roles:roles(id, status)')
        .eq('status', 'active')
        .order('name');
      return data || [];
    },
  });

  const { data: activity = [] } = useQuery({
    queryKey: ['dashboard-activity'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase
        .from('candidates')
        .select('id, name, response_status, updated_at, role:roles(title, client:clients(name))')
        .order('updated_at', { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  const tasksPlanned = tasks.length;
  const tasksCompletedToday = 0;

  const priorityTone = (p: string | null) =>
    p === 'urgent' ? 'danger' : p === 'high' ? 'warning' : p === 'low' ? 'muted' : 'info';

  const responseTone = (s: string) =>
    s === 'replied' ? 'success' :
    s === 'interview_scheduled' ? 'info' :
    s === 'declined' ? 'danger' :
    s === 'ghosted' ? 'muted' : 'warning';

  return (
    <div className="space-y-8">
      <PageHeader
        title="Good morning, Lucía."
        description="Here's what matters today."
      />

      <SupabaseGate>
        {/* Today's Pulse */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <StatCard label="Tasks today" value={`${tasksCompletedToday}/${tasksPlanned}`} tone="gold" icon={<CheckCircle2 size={14} />} />
          <StatCard label="Intros sent" value={todayKPI?.intros_sent ?? 0} icon={<Mail size={14} />} />
          <StatCard label="Responses" value={todayKPI?.responses_received ?? 0} tone="success" />
          <StatCard label="Follow-ups due" value={followups.length} tone={followups.length > 0 ? 'danger' : 'default'} icon={<Clock size={14} />} />
          <StatCard label="Active roles" value={activeRolesCount} tone="info" icon={<Users size={14} />} />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Today's Tasks */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-base">Today's Tasks</h3>
              <Link href="/review" className="text-xs text-muted hover:text-gold flex items-center gap-1">
                Plan tomorrow <ArrowRight size={11} />
              </Link>
            </div>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">No open tasks. Use ⌘K to add one.</p>
            ) : (
              <div className="space-y-1.5">
                {tasks.slice(0, 6).map((t: any) => (
                  <div key={t.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-elevated/50 transition-colors">
                    <Circle size={14} className="text-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{t.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge tone={priorityTone(t.priority)}>{t.priority}</Badge>
                        {t.client?.name && <span className="text-xs text-muted">{t.client.name}</span>}
                        {t.due_date && <span className="text-xs text-muted">· due {formatDate(t.due_date)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Follow-Up Queue */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-base">Follow-Up Queue</h3>
              <Link href="/emails" className="text-xs text-muted hover:text-gold flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>
            {followups.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">All caught up.</p>
            ) : (
              <div className="space-y-1.5">
                {followups.slice(0, 6).map((c: any) => {
                  const days = daysSince(c.intro_sent_at);
                  return (
                    <div key={c.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-elevated/50">
                      <AlertTriangle size={13} className="text-danger shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-muted truncate">
                          {c.role?.title} · {c.role?.client?.name}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-xs text-danger font-mono">{days}d</div>
                        <div className="text-[10px] text-muted">Round {c.followup_round + 1}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-base">Recent Activity</h3>
          </div>
          {activity.length === 0 ? (
            <p className="text-sm text-muted py-6 text-center">Nothing yet.</p>
          ) : (
            <div className="space-y-0">
              {activity.slice(0, 8).map((a: any, i: number) => (
                <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                  <Dot tone={responseTone(a.response_status)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      <span className="font-medium">{a.name}</span>
                      <span className="text-muted"> · {a.role?.client?.name} · {a.role?.title}</span>
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <Badge tone={responseTone(a.response_status)}>{a.response_status.replace('_', ' ')}</Badge>
                    <span className="text-xs text-muted">{formatDate(a.updated_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client Health */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-base">Client Health</h3>
            <span className="text-xs text-muted">{clients.length} active</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {clients.map((c: any) => {
              const roleCount = c.roles?.length || 0;
              const live = c.roles?.filter((r: any) => r.status === 'live').length || 0;
              return (
                <Link
                  key={c.id}
                  href={`/clients/${c.id}`}
                  className="card p-4 border-l-4 border-l-success hover:border-gold/40 transition-all"
                >
                  <div className="font-display font-semibold text-sm truncate">{c.name}</div>
                  <div className="text-xs text-muted mt-1">
                    {roleCount} role{roleCount !== 1 && 's'} · {live} live
                  </div>
                </Link>
              );
            })}
            {clients.length === 0 && (
              <div className="col-span-full text-sm text-muted text-center py-8">No clients yet.</div>
            )}
          </div>
        </div>
      </SupabaseGate>
    </div>
  );
}

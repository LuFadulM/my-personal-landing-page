'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { daysSince } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import MorningBrief from '@/components/agent/MorningBrief';
import DailyChecklist from '@/components/agent/DailyChecklist';
import PendingApprovals from '@/components/agent/PendingApprovals';
import AIChatPanel from '@/components/agent/AIChatPanel';
import JDCreator from '@/components/agent/JDCreator';
import { Bot, MessageSquare, Layers, CheckSquare, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'overview' | 'jd';

export default function AgentPage() {
  const [chatOpen, setChatOpen] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const enabled = isSupabaseConfigured();

  const { data: context } = useQuery({
    queryKey: ['agent-context'],
    enabled,
    queryFn: async () => {
      const now = new Date().toISOString();
      const [{ data: followups }, { data: tasks }, { count: roles }, { count: pending }] = await Promise.all([
        supabase
          .from('candidates')
          .select('name, role:roles(title, client:clients(name)), intro_sent_at, followup_round')
          .eq('response_status', 'pending')
          .lte('next_followup_due', now)
          .eq('archived', false)
          .limit(10),
        supabase
          .from('tasks')
          .select('title, priority, client:clients(name)')
          .neq('status', 'done')
          .order('priority', { ascending: true })
          .limit(5),
        supabase.from('roles').select('*', { count: 'exact', head: true }).in('status', ['live', 'outreach_ready']).eq('archived', false),
        supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('response_status', 'pending').eq('archived', false),
      ]);

      const lines: string[] = [
        `Active roles: ${roles ?? 0}`,
        `Candidates pending response: ${pending ?? 0}`,
        `Follow-ups due today: ${followups?.length ?? 0}`,
      ];
      if (followups?.length) {
        lines.push('Overdue follow-ups: ' + followups.map((f: any) => `${f.name} (${f.role?.title} at ${f.role?.client?.name}, ${daysSince(f.intro_sent_at)}d, R${f.followup_round + 1})`).join('; '));
      }
      if (tasks?.length) {
        lines.push('Open tasks: ' + tasks.map((t: any) => `${t.title} [${t.priority}]${t.client?.name ? ` — ${t.client.name}` : ''}`).join('; '));
      }
      return lines.join('\n');
    },
  });

  return (
    <div className="flex gap-0 -mx-6 lg:-mx-10 min-h-[calc(100vh-120px)]">
      {/* Main column */}
      <div className="flex-1 min-w-0 px-6 lg:px-10 py-0 space-y-6 overflow-y-auto">
        <PageHeader
          title="AI Ops Agent"
          description="Morning brief · Follow-up intelligence · JD creation"
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChatOpen((o) => !o)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                  chatOpen
                    ? 'bg-gold/15 border-gold/30 text-gold'
                    : 'bg-surface border-border text-muted hover:text-fg'
                )}
              >
                <Bot size={13} /> AI Co-pilot
              </button>
            </div>
          }
        />

        {/* Tab nav */}
        <div className="flex gap-1 bg-elevated/50 rounded-xl p-1 w-fit">
          {([
            ['overview', 'Overview', Layers],
            ['jd', 'JD Creator', FileText],
          ] as const).map(([val, label, Icon]) => (
            <button
              key={val}
              onClick={() => setTab(val)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                tab === val ? 'bg-surface text-fg shadow-sm' : 'text-muted hover:text-fg'
              )}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            <MorningBrief />
            <DailyChecklist />
            <PendingApprovals />
          </div>
        )}

        {tab === 'jd' && <JDCreator />}
      </div>

      {/* Chat sidebar */}
      {chatOpen && (
        <div className="w-[340px] shrink-0 border-l border-border bg-surface flex flex-col sticky top-0 h-[calc(100vh-64px)]">
          <AIChatPanel context={context ?? undefined} />
        </div>
      )}
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { daysSince, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Clock, Users } from 'lucide-react';
import Link from 'next/link';

export default function PendingApprovals() {
  const enabled = isSupabaseConfigured();

  const { data: pending = [] } = useQuery({
    queryKey: ['pending-approvals'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase
        .from('candidates')
        .select('*, role:roles(title, client:clients(id, name, slack_channel))')
        .eq('response_status', 'pending')
        .eq('archived', false)
        .order('intro_sent_at', { ascending: true })
        .limit(50);
      return data || [];
    },
  });

  const byClient: Record<string, { clientName: string; clientId: string; slackChannel: string | null; items: any[] }> = {};
  for (const c of pending) {
    const clientId = c.role?.client?.id ?? 'unknown';
    const clientName = c.role?.client?.name ?? 'Unknown client';
    if (!byClient[clientId]) {
      byClient[clientId] = { clientName, clientId, slackChannel: c.role?.client?.slack_channel ?? null, items: [] };
    }
    byClient[clientId].items.push(c);
  }

  const sorted = Object.values(byClient).sort((a, b) => b.items.length - a.items.length);

  if (sorted.length === 0) return null;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-warning" />
          <h2 className="font-display font-bold text-base">Pending Approvals</h2>
        </div>
        <span className="font-mono text-xs text-muted">{pending.length} total</span>
      </div>

      <div className="space-y-3">
        {sorted.map(({ clientId, clientName, slackChannel, items }) => {
          const oldest = Math.max(...items.map((c: any) => daysSince(c.intro_sent_at)));
          const urgencyTone = oldest >= 5 ? 'danger' : oldest >= 3 ? 'warning' : 'success';
          return (
            <div key={clientId} className="flex items-center gap-4 px-3 py-3 rounded-lg border border-border hover:bg-elevated/30 transition-colors">
              <div className="flex-1 min-w-0">
                <Link href={`/clients/${clientId}`} className="font-medium text-sm hover:text-gold transition-colors">
                  {clientName}
                </Link>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {items.slice(0, 4).map((c: any) => (
                    <span key={c.id} className="text-xs text-muted font-mono truncate max-w-[120px]" title={c.name}>
                      {c.name}
                    </span>
                  ))}
                  {items.length > 4 && (
                    <span className="text-xs text-muted">+{items.length - 4} more</span>
                  )}
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Users size={11} className="text-muted" />
                    <span className="font-mono text-sm font-medium">{items.length}</span>
                  </div>
                  <div className="text-[10px] text-muted">pending</div>
                </div>
                <Badge tone={urgencyTone}>{oldest}d max</Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

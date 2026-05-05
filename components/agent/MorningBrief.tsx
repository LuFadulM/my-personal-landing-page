'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { daysSince } from '@/lib/utils';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';

export default function MorningBrief() {
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);
  const enabled = isSupabaseConfigured();

  const { data: followupsDue = [] } = useQuery({
    queryKey: ['morning-followups'],
    enabled,
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('candidates')
        .select('*, role:roles(title, client:clients(name))')
        .eq('response_status', 'pending')
        .lte('next_followup_due', now)
        .eq('archived', false)
        .limit(10);
      return (data || []).map((c: any) => ({ ...c, days: daysSince(c.intro_sent_at) }));
    },
  });

  const { data: openTasks = [] } = useQuery({
    queryKey: ['morning-tasks'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*, client:clients(name)')
        .neq('status', 'done')
        .order('priority', { ascending: true })
        .limit(8);
      return data || [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['morning-stats'],
    enabled,
    queryFn: async () => {
      const [{ count: roles }, { count: pending }] = await Promise.all([
        supabase.from('roles').select('*', { count: 'exact', head: true }).in('status', ['live', 'outreach_ready']).eq('archived', false),
        supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('response_status', 'pending').eq('archived', false),
      ]);
      return { activeRoles: roles || 0, pendingCandidates: pending || 0 };
    },
  });

  async function runBrief() {
    setLoading(true);
    setBrief('');
    try {
      const res = await fetch('/api/ai/morning-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followupsDue,
          openTasks,
          activeRoles: stats?.activeRoles ?? 0,
          pendingCandidates: stats?.pendingCandidates ?? 0,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate brief');
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setBrief((prev) => prev + decoder.decode(value));
      }
      setRan(true);
    } catch {
      setBrief('Failed to generate brief. Check your ANTHROPIC_API_KEY.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ran && !loading && (followupsDue.length > 0 || openTasks.length > 0 || stats)) {
      runBrief();
    }
  }, [followupsDue.length, openTasks.length, stats]);

  const lines = brief.split('\n');

  return (
    <div className="card p-6 border-l-4 border-l-gold">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-gold" />
          <h2 className="font-display font-bold text-base">Morning Brief</h2>
          {loading && <Loader2 size={13} className="text-muted animate-spin" />}
        </div>
        <button
          onClick={runBrief}
          disabled={loading}
          className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-elevated transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {!brief && !loading && (
        <div className="text-sm text-muted py-4 text-center">
          Loading context…
        </div>
      )}

      {brief && (
        <div className="space-y-1">
          {lines.map((line, i) => {
            if (!line.trim()) return <div key={i} className="h-2" />;
            if (line.startsWith('**') && line.endsWith('**')) {
              return (
                <p key={i} className="text-sm font-semibold text-gold mt-3 mb-1">
                  {line.replace(/\*\*/g, '')}
                </p>
              );
            }
            if (line.startsWith('- ') || line.startsWith('• ')) {
              return (
                <p key={i} className="text-sm text-fg pl-3 border-l border-border">
                  {line.replace(/^[•\-]\s/, '')}
                </p>
              );
            }
            return (
              <p key={i} className="text-sm text-fg">
                {line}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

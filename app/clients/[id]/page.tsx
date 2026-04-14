'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import PageHeader from '@/components/ui/PageHeader';
import SupabaseGate from '@/components/ui/SupabaseGate';
import StatCard from '@/components/ui/StatCard';
import { Badge, Dot } from '@/components/ui/Badge';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Client, Role, Candidate } from '@/lib/types';

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const enabled = isSupabaseConfigured();

  const { data: client } = useQuery({
    queryKey: ['client', params.id],
    enabled,
    queryFn: async () => {
      const { data } = await supabase.from('clients').select('*').eq('id', params.id).maybeSingle();
      return data as Client | null;
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['client-roles', params.id],
    enabled,
    queryFn: async () => {
      const { data } = await supabase.from('roles').select('*').eq('client_id', params.id).eq('archived', false);
      return (data || []) as Role[];
    },
  });

  const { data: candidates = [] } = useQuery({
    queryKey: ['client-candidates', params.id],
    enabled: enabled && roles.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from('candidates')
        .select('*, role:roles(title, client_id)')
        .in('role_id', roles.map((r) => r.id))
        .eq('archived', false);
      return (data || []) as Candidate[];
    },
  });

  if (!client) {
    return (
      <div>
        <Link href="/" className="text-sm text-muted hover:text-fg inline-flex items-center gap-1 mb-4"><ArrowLeft size={12} /> Back</Link>
        <p className="text-sm text-muted">Client not found or still loading.</p>
      </div>
    );
  }

  const replied = candidates.filter((c) => c.response_status === 'replied' || c.response_status === 'interview_scheduled').length;
  const rate = candidates.length ? Math.round((replied / candidates.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-muted hover:text-fg inline-flex items-center gap-1"><ArrowLeft size={12} /> Dashboard</Link>
      <PageHeader
        title={client.name}
        description={`${client.ats || 'No ATS'} · ${client.slack_channel || 'No Slack channel'}`}
      />

      <SupabaseGate>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Active Roles" value={roles.filter((r) => r.status === 'live' || r.status === 'outreach_ready').length} tone="gold" />
          <StatCard label="Total Roles" value={roles.length} />
          <StatCard label="Candidates" value={candidates.length} tone="info" />
          <StatCard label="Reply Rate" value={`${rate}%`} tone={rate >= 25 ? 'success' : 'warning'} />
        </div>

        <div className="card p-6">
          <h3 className="font-display font-semibold text-base mb-4">Roles</h3>
          {roles.length === 0 ? (
            <p className="text-sm text-muted">No roles yet.</p>
          ) : (
            <div className="space-y-1.5">
              {roles.map((r) => (
                <Link key={r.id} href={`/jds`} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-elevated/50">
                  <Dot tone={r.status === 'live' ? 'success' : r.status === 'filled' ? 'success' : 'warning'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{r.title}</p>
                    <p className="text-xs text-muted">{r.type} · {r.location}</p>
                  </div>
                  <Badge tone="muted">{r.status.replace('_', ' ')}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-display font-semibold text-base mb-4">Candidates ({candidates.length})</h3>
          {candidates.length === 0 ? (
            <p className="text-sm text-muted">No candidates yet.</p>
          ) : (
            <div className="space-y-1">
              {candidates.slice(0, 20).map((c) => (
                <div key={c.id} className="flex items-center gap-3 py-2 text-sm">
                  <Dot tone={c.response_status === 'replied' ? 'success' : c.response_status === 'interview_scheduled' ? 'info' : 'warning'} />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-muted truncate">{c.role?.title}</span>
                  <Badge tone="muted">{c.response_status.replace('_', ' ')}</Badge>
                  <span className="text-xs text-muted">{formatDate(c.intro_sent_at)}</span>
                </div>
              ))}
              {candidates.length > 20 && <p className="text-xs text-muted text-center pt-2">+{candidates.length - 20} more</p>}
            </div>
          )}
        </div>

        {client.notes && (
          <div className="card p-6">
            <h3 className="font-display font-semibold text-base mb-3">Client Notes</h3>
            <p className="text-sm text-muted whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </SupabaseGate>
    </div>
  );
}

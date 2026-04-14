'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import PageHeader from '@/components/ui/PageHeader';
import SupabaseGate from '@/components/ui/SupabaseGate';
import { Save, Link2, Database, AlertCircle } from 'lucide-react';
import type { SheetSync } from '@/lib/types';

const tables = ['clients', 'roles', 'candidates', 'kpi_entries'] as const;

export default function SettingsPage() {
  const enabled = isSupabaseConfigured();
  const qc = useQueryClient();
  const { data: syncs = [] } = useQuery({
    queryKey: ['syncs'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase.from('sheet_syncs').select('*');
      return (data || []) as SheetSync[];
    },
  });

  const [urls, setUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    const m: Record<string, string> = {};
    syncs.forEach((s) => m[s.target_table] = s.sheet_url);
    setUrls(m);
  }, [syncs]);

  async function save(table: string) {
    const url = urls[table] || '';
    const existing = syncs.find((s) => s.target_table === table);
    if (existing) {
      await supabase.from('sheet_syncs').update({ sheet_url: url }).eq('id', existing.id);
    } else {
      await supabase.from('sheet_syncs').insert({ target_table: table, sheet_url: url });
    }
    qc.invalidateQueries({ queryKey: ['syncs'] });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Google Sheet URLs for optional live sync + environment status."
      />

      <SupabaseGate>
        <div className="card p-6">
          <h3 className="font-display font-semibold text-base mb-1 flex items-center gap-2">
            <Database size={16} className="text-gold" /> Supabase Connection
          </h3>
          <p className="text-xs text-muted mb-4">
            {isSupabaseConfigured() ? (
              <>Connected to <code className="font-mono bg-elevated px-1.5 py-0.5 rounded">{process.env.NEXT_PUBLIC_SUPABASE_URL}</code></>
            ) : (
              'Not connected. Set env vars in Vercel.'
            )}
          </p>
          <div className="bg-elevated/50 rounded-lg p-3 text-xs text-muted">
            Schema file: <code className="font-mono">supabase/schema.sql</code> · Seed file: <code className="font-mono">supabase/seed.sql</code>.
            Run both in the Supabase SQL editor.
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-display font-semibold text-base mb-1 flex items-center gap-2">
            <Link2 size={16} className="text-gold" /> Google Sheet sync URLs
          </h3>
          <p className="text-xs text-muted mb-5">
            For each table, paste the public CSV URL (File → Share → Publish to web → CSV).
            Sync runs on-demand from each module's "Sync from Sheet" button.
          </p>
          <div className="space-y-4">
            {tables.map((t) => {
              const sync = syncs.find((s) => s.target_table === t);
              return (
                <div key={t}>
                  <label className="text-xs text-muted uppercase tracking-wider capitalize">{t.replace('_', ' ')}</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      value={urls[t] || ''}
                      onChange={(e) => setUrls({ ...urls, [t]: e.target.value })}
                      placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
                      className="flex-1 bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm font-mono"
                    />
                    <button onClick={() => save(t)} className="btn-primary text-xs inline-flex items-center gap-1">
                      <Save size={12} /> Save
                    </button>
                  </div>
                  {sync?.last_synced_at && (
                    <p className="text-[10px] text-muted mt-1">Last synced: {new Date(sync.last_synced_at).toLocaleString()}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6 border-info/20 bg-info/5 flex gap-3">
          <AlertCircle className="text-info shrink-0 mt-0.5" size={16} />
          <div className="text-xs text-muted">
            <b className="text-fg">Heads up:</b> The Google Sheets sync fetches the published CSV directly in the browser. For private sheets or OAuth-guarded exports, use the Import Data page instead.
          </div>
        </div>
      </SupabaseGate>
    </div>
  );
}

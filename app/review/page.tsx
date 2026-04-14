'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import PageHeader from '@/components/ui/PageHeader';
import SupabaseGate from '@/components/ui/SupabaseGate';
import { Save, Sunrise } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { DailyReview } from '@/lib/types';

const energyEmojis = ['😵', '😐', '🙂', '😊', '🔥'];

export default function DailyReviewPage() {
  const enabled = isSupabaseConfigured();
  const qc = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: current } = useQuery({
    queryKey: ['review', today],
    enabled,
    queryFn: async () => {
      const { data } = await supabase.from('daily_reviews').select('*').eq('date', today).maybeSingle();
      return data as DailyReview | null;
    },
  });

  const { data: history = [] } = useQuery({
    queryKey: ['reviews-history'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase.from('daily_reviews').select('*').order('date', { ascending: false }).limit(30);
      return (data || []) as DailyReview[];
    },
  });

  const [form, setForm] = useState<Partial<DailyReview>>({});

  useEffect(() => {
    if (current) setForm(current);
    else setForm({});
  }, [current]);

  async function save() {
    const payload = { ...form, date: today };
    if (current) {
      await supabase.from('daily_reviews').update(payload).eq('id', current.id);
    } else {
      await supabase.from('daily_reviews').insert(payload);
    }
    // Auto-create tasks for tomorrow from priorities
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const priorities = [form.priority_1, form.priority_2, form.priority_3].filter((p): p is string => !!p?.trim());
    for (const p of priorities) {
      await supabase.from('tasks').insert({
        title: p, priority: 'high', status: 'todo', due_date: tomorrow, category: 'other',
      });
    }
    qc.invalidateQueries({ queryKey: ['review', today] });
    qc.invalidateQueries({ queryKey: ['reviews-history'] });
    qc.invalidateQueries({ queryKey: ['dashboard-tasks'] });
    alert('Day closed out. Tomorrow\u2019s priorities are now tasks.');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Review"
        description="Close out today. Plan tomorrow."
      />

      <SupabaseGate>
        <div className="card p-6 space-y-5">
          <section>
            <label className="text-xs text-muted uppercase tracking-wider">What went well today?</label>
            <textarea value={form.went_well || ''} onChange={(e) => setForm({ ...form, went_well: e.target.value })} rows={3} className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm mt-1.5" />
          </section>

          <section>
            <label className="text-xs text-muted uppercase tracking-wider">What didn't go well?</label>
            <textarea value={form.didnt_go_well || ''} onChange={(e) => setForm({ ...form, didnt_go_well: e.target.value })} rows={3} className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm mt-1.5" />
          </section>

          <section>
            <div className="text-xs text-muted uppercase tracking-wider mb-2">Top 3 priorities for tomorrow (auto-create tasks)</div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <input
                  key={i}
                  placeholder={`Priority ${i}`}
                  value={(form as any)[`priority_${i}`] || ''}
                  onChange={(e) => setForm({ ...form, [`priority_${i}`]: e.target.value })}
                  className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm"
                />
              ))}
            </div>
          </section>

          <section>
            <label className="text-xs text-muted uppercase tracking-wider">Blockers</label>
            <textarea value={form.blockers || ''} onChange={(e) => setForm({ ...form, blockers: e.target.value })} rows={2} className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm mt-1.5" />
          </section>

          <section>
            <div className="text-xs text-muted uppercase tracking-wider mb-2">Energy level</div>
            <div className="flex gap-2">
              {energyEmojis.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => setForm({ ...form, energy_level: i + 1 })}
                  className={`text-2xl p-3 rounded-lg border transition-all ${form.energy_level === i + 1 ? 'border-gold bg-gold/10' : 'border-border hover:border-muted'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </section>

          <button onClick={save} className="btn-primary inline-flex items-center gap-2">
            <Save size={14} /> Save & close day
          </button>
        </div>

        {/* History */}
        <div>
          <h3 className="font-display font-semibold text-base mb-3 flex items-center gap-2">
            <Sunrise size={16} className="text-gold" /> Past Reviews
          </h3>
          <div className="space-y-2">
            {history.filter((h) => h.date !== today).map((h) => (
              <div key={h.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm">{formatDate(h.date, 'EEEE, MMM d')}</span>
                  {h.energy_level && <span className="text-xl">{energyEmojis[h.energy_level - 1]}</span>}
                </div>
                {h.went_well && <p className="text-xs text-muted mb-1"><b className="text-success">Went well:</b> {h.went_well}</p>}
                {h.didnt_go_well && <p className="text-xs text-muted mb-1"><b className="text-danger">Didn't:</b> {h.didnt_go_well}</p>}
                {(h.priority_1 || h.priority_2 || h.priority_3) && (
                  <p className="text-xs text-muted"><b className="text-gold">Priorities:</b> {[h.priority_1, h.priority_2, h.priority_3].filter(Boolean).join(' · ')}</p>
                )}
              </div>
            ))}
            {history.length === 0 && <p className="text-sm text-muted text-center py-6">No past reviews yet.</p>}
          </div>
        </div>
      </SupabaseGate>
    </div>
  );
}

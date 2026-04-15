'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import PageHeader from '@/components/ui/PageHeader';
import SupabaseGate from '@/components/ui/SupabaseGate';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Plus, ClipboardCopy, Check, Circle, Hash, User, X, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { SlackTag } from '@/lib/types';

export default function SlackTagsPage() {
  const enabled = isSupabaseConfigured();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('open');
  const [personFilter, setPersonFilter] = useState<string>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [copied, setCopied] = useState(false);
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());

  const { data: tags = [] } = useQuery({
    queryKey: ['slack_tags'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase
        .from('slack_tags')
        .select('*')
        .order('day', { ascending: false })
        .order('created_at', { ascending: true });
      return (data || []) as SlackTag[];
    },
  });

  // Realtime subscription — pick up Will's changes live
  useEffect(() => {
    if (!enabled) return;
    const channel = supabase
      .channel('slack_tags_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slack_tags' }, () => {
        qc.invalidateQueries({ queryKey: ['slack_tags'] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, qc]);

  const people = useMemo(() => {
    const set = new Set(tags.map((t) => t.from_person));
    return ['All', ...Array.from(set).sort()];
  }, [tags]);

  const filtered = useMemo(() => {
    return tags
      .filter((t) => personFilter === 'All' || t.from_person === personFilter)
      .filter((t) => filter === 'all' || (filter === 'open' ? !t.done : t.done));
  }, [tags, filter, personFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, SlackTag[]>();
    filtered.forEach((t) => {
      const arr = map.get(t.day) || [];
      arr.push(t);
      map.set(t.day, arr);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const total = tags.length;
  const done = tags.filter((t) => t.done).length;
  const open = total - done;
  const pct = total ? Math.round((done / total) * 100) : 0;

  async function toggleDone(tag: SlackTag) {
    await supabase.from('slack_tags').update({ done: !tag.done }).eq('id', tag.id);
    qc.invalidateQueries({ queryKey: ['slack_tags'] });
  }

  async function updateNotes(id: number, notes: string) {
    await supabase.from('slack_tags').update({ notes }).eq('id', id);
  }

  async function deleteTag(id: number) {
    if (!confirm('Delete this task?')) return;
    await supabase.from('slack_tags').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['slack_tags'] });
  }

  function toggleDayCollapse(day: string) {
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  async function copySummary() {
    const today = new Date().toISOString().split('T')[0];
    const doneToday = tags.filter((t) => t.done && t.day === today);
    const openToday = tags.filter((t) => !t.done && t.day === today);
    const openOlder = tags.filter((t) => !t.done && t.day !== today).sort((a, b) => a.day.localeCompare(b.day));

    const dayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const lines: string[] = [`Ops Update — ${dayStr}`, ''];

    if (doneToday.length) {
      lines.push('Completed today:');
      doneToday.forEach((t) => lines.push(`${shortDesc(t.description)} (${t.from_person})`));
      lines.push('');
    }

    if (openToday.length) {
      lines.push('Still open:');
      openToday.forEach((t) => lines.push(`${shortDesc(t.description)} (${t.from_person})`));
      lines.push('');
    }

    if (openOlder.length) {
      lines.push('Open from previous days:');
      openOlder.forEach((t) => {
        const dayLabel = new Date(t.day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        lines.push(`${shortDesc(t.description)} (${t.from_person}, ${dayLabel})`);
      });
    }

    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Slack Tags Tracker"
        description="Shared ops task tracker, synced in real time."
        action={
          <div className="flex gap-2">
            <button onClick={copySummary} className="btn-secondary inline-flex items-center gap-1.5 text-xs">
              {copied ? <Check size={13} /> : <ClipboardCopy size={13} />}
              {copied ? 'Copied!' : 'Copy Summary'}
            </button>
            <button onClick={() => setShowAdd(!showAdd)} className="btn-primary inline-flex items-center gap-1.5">
              <Plus size={14} /> Add Task
            </button>
          </div>
        }
      />

      <SupabaseGate>
        {/* Progress */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs text-muted uppercase tracking-wider">Progress</span>
            <span className="font-mono text-sm"><b className="text-gold">{done}</b><span className="text-muted"> / {total}</span></span>
          </div>
          <div className="h-2 bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted">
            <span>{pct}% complete</span>
            <span>{open} open · {done} done</span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total tasks" value={total} />
          <StatCard label="Open" value={open} tone={open > 0 ? 'warning' : 'default'} />
          <StatCard label="Done" value={done} tone="success" />
          <StatCard label="People" value={people.length - 1} tone="info" />
        </div>

        {/* Add form */}
        {showAdd && <AddTaskForm onClose={() => setShowAdd(false)} onCreated={() => qc.invalidateQueries({ queryKey: ['slack_tags'] })} people={people.filter((p) => p !== 'All')} />}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 bg-surface border border-border rounded-full p-0.5">
            {(['all', 'open', 'done'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  filter === f ? 'bg-gold/15 text-gold' : 'text-muted hover:text-fg'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <select
            value={personFilter}
            onChange={(e) => setPersonFilter(e.target.value)}
            className="bg-surface border border-border rounded-full px-3 py-1.5 text-xs"
          >
            {people.map((p) => <option key={p} value={p}>{p === 'All' ? 'All People' : p}</option>)}
          </select>
        </div>

        {/* Grouped tasks */}
        {grouped.length === 0 ? (
          <EmptyState
            icon={<Circle size={32} />}
            title={tags.length === 0 ? 'No tasks yet' : `No ${filter === 'all' ? '' : filter + ' '}tasks match these filters`}
            description={tags.length === 0 ? 'Run schema-slack-tags.sql + seed-slack-tags.sql to populate 43 tasks.' : 'Try a different filter.'}
          />
        ) : (
          <div className="space-y-4">
            {grouped.map(([day, dayTags]) => {
              const isCollapsed = collapsedDays.has(day);
              const dayDone = dayTags.filter((t) => t.done).length;
              const dayDate = new Date(day + 'T12:00:00');
              const dayLabel = dayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

              return (
                <div key={day}>
                  <button
                    onClick={() => toggleDayCollapse(day)}
                    className="flex items-center gap-2 text-sm font-display font-semibold mb-3 hover:text-gold transition-colors"
                  >
                    {isCollapsed ? <ChevronRight size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
                    <span>{dayLabel}</span>
                    <span className="text-xs text-muted font-body font-normal">
                      {dayDone}/{dayTags.length}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <div className="space-y-1.5">
                      {dayTags.map((tag) => (
                        <TaskRow
                          key={tag.id}
                          tag={tag}
                          onToggle={() => toggleDone(tag)}
                          onDelete={() => deleteTag(tag.id)}
                          onNotesBlur={(notes) => updateNotes(tag.id, notes)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SupabaseGate>
    </div>
  );
}

function shortDesc(desc: string): string {
  const firstSentence = desc.split(/[.—]/)[0].trim();
  return firstSentence.length > 80 ? firstSentence.slice(0, 77) + '...' : firstSentence;
}

function TaskRow({
  tag,
  onToggle,
  onDelete,
  onNotesBlur,
}: {
  tag: SlackTag;
  onToggle: () => void;
  onDelete: () => void;
  onNotesBlur: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(tag.notes);
  const [showNotes, setShowNotes] = useState(!!tag.notes);

  useEffect(() => { setNotes(tag.notes); }, [tag.notes]);

  return (
    <div className={cn('card p-3.5 transition-all', tag.done && 'opacity-60')}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={cn(
            'mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
            tag.done ? 'bg-gold border-gold text-black' : 'border-muted hover:border-gold'
          )}
          aria-label={tag.done ? 'Mark as open' : 'Mark as done'}
        >
          {tag.done && <Check size={10} strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={cn('text-sm leading-relaxed', tag.done && 'line-through text-muted')}>
            {tag.description}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <User size={10} />
              {tag.from_person}
            </span>
            <span className="inline-flex items-center gap-1 font-mono">
              {tag.channel.startsWith('#') ? <Hash size={10} /> : null}
              {tag.channel.replace(/^#/, '')}
            </span>
            {!showNotes && !tag.notes && (
              <button onClick={() => setShowNotes(true)} className="text-muted hover:text-gold">+ add note</button>
            )}
          </div>

          {(showNotes || tag.notes) && (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => { if (notes !== tag.notes) onNotesBlur(notes); }}
              placeholder="Add context or notes…"
              rows={2}
              className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-xs mt-2 focus:border-gold/50 focus:outline-none resize-none"
            />
          )}
        </div>

        <button onClick={onDelete} className="text-muted hover:text-danger p-1 shrink-0" aria-label="Delete task">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

function AddTaskForm({
  onClose,
  onCreated,
  people,
}: {
  onClose: () => void;
  onCreated: () => void;
  people: string[];
}) {
  const [description, setDescription] = useState('');
  const [fromPerson, setFromPerson] = useState('');
  const [channel, setChannel] = useState('#operations');
  const [day, setDay] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setSaving(true);
    await supabase.from('slack_tags').insert({
      description: description.trim(),
      from_person: fromPerson,
      channel: channel.trim(),
      day,
      done: false,
    });
    setSaving(false);
    onCreated();
    onClose();
  }

  return (
    <div className="card p-5 border-gold/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-sm">New task</h3>
        <button onClick={onClose} className="text-muted hover:text-fg"><X size={14} /></button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <textarea
          autoFocus
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description…"
          rows={2}
          required
          className="w-full bg-elevated border border-border rounded-md px-3 py-2 text-sm focus:border-gold/50 focus:outline-none resize-none"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted uppercase tracking-wider">From</label>
            <input
              value={fromPerson}
              onChange={(e) => setFromPerson(e.target.value)}
              list="people-list"
              placeholder="Who tagged you?"
              required
              className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm mt-1"
            />
            <datalist id="people-list">
              {people.map((p) => <option key={p} value={p} />)}
            </datalist>
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider">Channel</label>
            <input
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="#operations or DM"
              className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-muted uppercase tracking-wider">Date</label>
            <input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm mt-1"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-1.5">
            <Plus size={13} /> {saving ? 'Saving…' : 'Add Task'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}

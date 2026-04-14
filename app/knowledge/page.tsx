'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import PageHeader from '@/components/ui/PageHeader';
import SupabaseGate from '@/components/ui/SupabaseGate';
import { Badge } from '@/components/ui/Badge';
import { Search, Plus, Pin, Save, Trash2, BookOpen, X } from 'lucide-react';
import type { KBCategory, KnowledgeEntry } from '@/lib/types';
import { formatDate, cn } from '@/lib/utils';

const categories: KBCategory[] = ['process', 'template', 'faq', 'client_intel', 'tool_guide', 'sop', 'reference'];

export default function KnowledgePage() {
  const enabled = isSupabaseConfigured();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<KBCategory | 'All'>('All');
  const [selected, setSelected] = useState<KnowledgeEntry | null>(null);
  const [showNew, setShowNew] = useState(false);

  const { data: entries = [] } = useQuery({
    queryKey: ['knowledge'],
    enabled,
    queryFn: async () => {
      const { data } = await supabase.from('knowledge_base').select('*').order('pinned', { ascending: false }).order('updated_at', { ascending: false });
      return (data || []) as KnowledgeEntry[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries
      .filter((e) => category === 'All' || e.category === category)
      .filter((e) => !q || e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q) || e.tags.some((t) => t.toLowerCase().includes(q)));
  }, [entries, search, category]);

  async function save(patch: Partial<KnowledgeEntry>, id?: string) {
    if (id) {
      await supabase.from('knowledge_base').update(patch).eq('id', id);
    } else {
      await supabase.from('knowledge_base').insert({ title: 'Untitled', category: 'process', content: '', tags: [], ...patch });
    }
    qc.invalidateQueries({ queryKey: ['knowledge'] });
  }

  async function remove(id: string) {
    if (!confirm('Delete this entry?')) return;
    await supabase.from('knowledge_base').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['knowledge'] });
    setSelected(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base"
        description="SOPs, templates, and client intel. Everything you'll reach for, searchable in one place."
        action={
          <button onClick={() => setShowNew(true)} className="btn-primary inline-flex items-center gap-1.5">
            <Plus size={14} /> New Entry
          </button>
        }
      />

      <SupabaseGate>
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
          {/* Sidebar */}
          <div className="space-y-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full bg-surface border border-border rounded-full pl-8 pr-3 py-1.5 text-sm focus:border-gold/50 focus:outline-none"
              />
            </div>
            <div className="space-y-0.5">
              <button onClick={() => setCategory('All')} className={cn('w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors', category === 'All' ? 'bg-elevated text-fg font-medium' : 'text-muted hover:text-fg')}>
                All entries ({entries.length})
              </button>
              {categories.map((c) => {
                const ct = entries.filter((e) => e.category === c).length;
                return (
                  <button key={c} onClick={() => setCategory(c)} className={cn('w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-between', category === c ? 'bg-elevated text-fg font-medium' : 'text-muted hover:text-fg')}>
                    <span className="capitalize">{c.replace('_', ' ')}</span>
                    <span className="text-xs text-muted">{ct}</span>
                  </button>
                );
              })}
            </div>
            <div className="pt-3 border-t border-border">
              <div className="space-y-1">
                {filtered.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className={cn('w-full text-left px-3 py-2 rounded-lg text-sm transition-colors', selected?.id === e.id ? 'bg-elevated' : 'hover:bg-elevated/50')}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {e.pinned && <Pin size={10} className="text-gold" />}
                      <span className="text-sm font-medium truncate">{e.title}</span>
                    </div>
                    <Badge tone="muted">{e.category.replace('_', ' ')}</Badge>
                  </button>
                ))}
                {filtered.length === 0 && <p className="text-xs text-muted text-center py-4">No entries.</p>}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div>
            {selected ? (
              <EntryEditor
                entry={selected}
                onSave={(patch) => save(patch, selected.id)}
                onDelete={() => remove(selected.id)}
                onPin={() => save({ pinned: !selected.pinned }, selected.id)}
              />
            ) : (
              <div className="card p-16 text-center">
                <BookOpen size={36} className="mx-auto mb-3 text-muted opacity-50" />
                <h3 className="font-display font-semibold mb-1">Select an entry</h3>
                <p className="text-sm text-muted">Or click "New Entry" to add a new SOP, template, or note.</p>
              </div>
            )}
          </div>
        </div>
      </SupabaseGate>

      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6" onClick={() => setShowNew(false)}>
          <NewEntry onClose={() => setShowNew(false)} onCreate={async (e) => { await save(e); setShowNew(false); }} />
        </div>
      )}
    </div>
  );
}

function EntryEditor({ entry, onSave, onDelete, onPin }: { entry: KnowledgeEntry; onSave: (patch: Partial<KnowledgeEntry>) => void; onDelete: () => void; onPin: () => void }) {
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [cat, setCat] = useState(entry.category);
  const [tags, setTags] = useState(entry.tags.join(', '));

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => onSave({ title })}
          className="font-display font-bold text-xl bg-transparent border-0 focus:outline-none flex-1"
        />
        <div className="flex items-center gap-1">
          <button onClick={onPin} className={cn('p-2 rounded-lg', entry.pinned ? 'text-gold' : 'text-muted hover:text-fg')} title="Toggle pin">
            <Pin size={14} />
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg text-muted hover:text-danger"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4 text-xs">
        <select value={cat} onChange={(e) => { setCat(e.target.value as KBCategory); onSave({ category: e.target.value as KBCategory }); }} className="bg-elevated border border-border rounded-md px-2 py-1">
          {categories.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
        </select>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          onBlur={() => onSave({ tags: tags.split(',').map((t) => t.trim()).filter(Boolean) })}
          placeholder="tags, comma-separated"
          className="bg-elevated border border-border rounded-md px-2 py-1 flex-1 focus:border-gold/50 focus:outline-none"
        />
        <span className="text-muted">Updated {formatDate(entry.updated_at, 'MMM d, h:mm a')}</span>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={() => onSave({ content })}
        rows={24}
        className="w-full bg-transparent border-0 text-sm font-mono focus:outline-none resize-none leading-relaxed"
      />
      <div className="flex justify-end pt-2 border-t border-border">
        <button onClick={() => onSave({ title, content, category: cat, tags: tags.split(',').map((t) => t.trim()).filter(Boolean) })} className="btn-primary inline-flex items-center gap-1.5 text-xs">
          <Save size={12} /> Save
        </button>
      </div>
    </div>
  );
}

function NewEntry({ onClose, onCreate }: { onClose: () => void; onCreate: (e: Partial<KnowledgeEntry>) => void }) {
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState<KBCategory>('process');
  return (
    <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg">New Entry</h3>
        <button onClick={onClose}><X size={16} className="text-muted" /></button>
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (title.trim()) onCreate({ title, category: cat }); }}
        className="space-y-3"
      >
        <input autoFocus placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm" />
        <select value={cat} onChange={(e) => setCat(e.target.value as KBCategory)} className="w-full bg-elevated border border-border rounded-md px-2.5 py-1.5 text-sm">
          {categories.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
        </select>
        <button type="submit" className="btn-primary w-full">Create</button>
      </form>
    </div>
  );
}

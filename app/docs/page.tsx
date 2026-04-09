'use client';

import { useEffect, useState, useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { docStore, type Doc, type DocType } from '@/lib/store';
import { Plus, Search, Trash2, Save, Edit3, BookOpen, FileText } from 'lucide-react';
import { formatRelative } from '@/lib/utils';

export default function DocsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [selected, setSelected] = useState<Doc | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<DocType>('knowledge');
  const [tags, setTags] = useState('');

  useEffect(() => {
    setDocs(docStore.list());
  }, []);

  const refresh = () => setDocs(docStore.list());

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return docs;
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [docs, query]);

  function openNew() {
    setEditing(null);
    setTitle('');
    setContent('');
    setType('knowledge');
    setTags('');
    setShowForm(true);
  }

  function openEdit(doc: Doc) {
    setEditing(doc);
    setTitle(doc.title);
    setContent(doc.content);
    setType(doc.type);
    setTags(doc.tags.join(', '));
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (editing) {
      docStore.update(editing.id, { title, content, type, tags: tagList });
    } else {
      docStore.create({ title, content, type, tags: tagList });
    }
    setShowForm(false);
    refresh();
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this doc?')) return;
    docStore.delete(id);
    setSelected(null);
    refresh();
  }

  return (
    <div className="px-5 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <PageHeader title="Docs" description="SOPs and knowledge base — searchable and tagged." />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search docs..."
                className="pl-8"
              />
            </div>
            <Button size="sm" onClick={openNew}>
              <Plus size={14} />
            </Button>
          </div>

          <div className="space-y-1.5">
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-xs text-muted-foreground">No docs.</p>
                </CardContent>
              </Card>
            ) : (
              filtered.map((doc) => {
                const Icon = doc.type === 'sop' ? FileText : BookOpen;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelected(doc)}
                    className={`w-full text-left rounded-md border p-3 transition-colors ${
                      selected?.id === doc.id ? 'border-primary/50 bg-primary/5' : 'border-border hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon size={14} className="text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{doc.title}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <Badge variant="secondary">{doc.type}</Badge>
                          {doc.tags.slice(0, 2).map((t) => (
                            <Badge key={t} variant="outline">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div>
          {showForm ? (
            <Card>
              <CardContent className="p-5">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Type</Label>
                      <Select value={type} onChange={(e) => setType(e.target.value as DocType)}>
                        <option value="knowledge">Knowledge</option>
                        <option value="sop">SOP</option>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tags (comma-separated)</Label>
                      <Input value={tags} onChange={(e) => setTags(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Content</Label>
                    <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={18} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      <Save size={14} /> {editing ? 'Update' : 'Create'}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : selected ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold">{selected.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{selected.type}</Badge>
                      {selected.tags.map((t) => (
                        <Badge key={t} variant="outline">{t}</Badge>
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-2">
                        Updated {formatRelative(selected.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => openEdit(selected)}>
                      <Edit3 size={12} /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(selected.id)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed text-foreground/90">
                  {selected.content}
                </pre>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <BookOpen size={36} className="mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Select a doc to read, or create a new one.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

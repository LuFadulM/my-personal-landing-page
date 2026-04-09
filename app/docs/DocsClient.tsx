'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createDoc, updateDoc, deleteDoc } from '@/actions/docs';
import { Plus, Search, Trash2, Save, Edit3, BookOpen, FileText } from 'lucide-react';
import { formatRelative } from '@/lib/utils';
import type { Doc, DocType } from '@prisma/client';

export default function DocsClient({ docs, initialQuery }: { docs: Doc[]; initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [selected, setSelected] = useState<Doc | null>(null);
  const [, startTransition] = useTransition();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<DocType>('knowledge');
  const [tags, setTags] = useState('');

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

  function handleSubmit(formData: FormData) {
    formData.set('title', title);
    formData.set('content', content);
    formData.set('type', type);
    formData.set('tags', tags);
    startTransition(async () => {
      if (editing) await updateDoc(editing.id, formData);
      else await createDoc(formData);
      setShowForm(false);
      location.reload();
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/docs?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search docs..."
              className="pl-8"
            />
          </div>
          <Button size="sm" onClick={openNew} type="button">
            <Plus size={14} />
          </Button>
        </form>

        <div className="space-y-1.5">
          {docs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-xs text-muted-foreground">No docs.</p>
              </CardContent>
            </Card>
          ) : (
            docs.map((doc) => {
              const Icon = doc.type === 'sop' ? FileText : BookOpen;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelected(doc)}
                  className={`w-full text-left rounded-md border p-3 transition-colors ${
                    selected?.id === doc.id
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Icon size={14} className="text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge variant="secondary">{doc.type}</Badge>
                        {doc.tags.slice(0, 2).map((t) => (
                          <Badge key={t} variant="outline">
                            {t}
                          </Badge>
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
              <form action={handleSubmit} className="space-y-3">
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
                      <Badge key={t} variant="outline">
                        {t}
                      </Badge>
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
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      startTransition(async () => {
                        await deleteDoc(selected.id);
                        setSelected(null);
                        location.reload();
                      });
                    }}
                  >
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
              <p className="text-sm text-muted-foreground">
                Select a doc to read, or create a new one.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { qaStore, type QAReview } from '@/lib/store';
import { summarizeQA } from '@/lib/ai';
import { Plus, Sparkles, Trash2, Save, Loader2, ExternalLink, Star } from 'lucide-react';
import { formatRelative } from '@/lib/utils';

export default function QAPage() {
  const [reviews, setReviews] = useState<QAReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [callLink, setCallLink] = useState('');
  const [score, setScore] = useState(7);
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setReviews(qaStore.list());
  }, []);

  const refresh = () => setReviews(qaStore.list());

  async function handleGenerate() {
    if (!notes.trim()) {
      alert('Write some notes first.');
      return;
    }
    setGenerating(true);
    try {
      const text = await summarizeQA(notes);
      setSummary(text);
    } finally {
      setGenerating(false);
    }
  }

  function resetForm() {
    setCallLink('');
    setScore(7);
    setNotes('');
    setSummary('');
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    qaStore.create({ callLink, score, notes, summary });
    resetForm();
    refresh();
  }

  async function generateForExisting(review: QAReview) {
    const text = await summarizeQA(review.notes);
    qaStore.update(review.id, { summary: text });
    refresh();
  }

  function handleDelete(id: string) {
    qaStore.delete(id);
    refresh();
  }

  function scoreVariant(s: number): 'success' | 'warning' | 'destructive' {
    if (s >= 8) return 'success';
    if (s >= 5) return 'warning';
    return 'destructive';
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <PageHeader title="QA Reviews" description={`${reviews.length} review${reviews.length !== 1 ? 's' : ''}`} />

      <div className="space-y-4">
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={14} /> New Review
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-3">
                  <div className="space-y-1.5">
                    <Label>Call link</Label>
                    <Input value={callLink} onChange={(e) => setCallLink(e.target.value)} placeholder="https://..." required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Score ({score}/10)</Label>
                    <Input type="range" min="1" max="10" value={score} onChange={(e) => setScore(Number(e.target.value))} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} placeholder="Detailed review notes..." />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Summary (optional)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
                      {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      Summarize Feedback
                    </Button>
                  </div>
                  <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={6} />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    <Save size={14} /> Save Review
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No QA reviews yet.</p>
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Badge variant={scoreVariant(review.score)}>
                        <Star size={10} className="mr-1" />
                        {review.score}/10
                      </Badge>
                      <a
                        href={review.callLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
                      >
                        <ExternalLink size={10} />
                        {review.callLink}
                      </a>
                      <span className="text-[10px] text-muted-foreground">{formatRelative(review.createdAt)}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!review.summary && (
                        <Button variant="outline" size="sm" onClick={() => generateForExisting(review)}>
                          <Sparkles size={12} /> Summarize
                        </Button>
                      )}
                      <button onClick={() => handleDelete(review.id)} className="text-muted-foreground hover:text-destructive p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                      <p className="whitespace-pre-wrap text-xs leading-relaxed">{review.notes}</p>
                    </div>
                    {review.summary && (
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Summary</p>
                        <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/80">{review.summary}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

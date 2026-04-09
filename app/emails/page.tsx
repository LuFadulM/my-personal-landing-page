'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  emailStore,
  createEmailWithAutomation,
  updateEmailWithAutomation,
  type Email,
  type EmailStatus,
  type EmailType,
} from '@/lib/store';
import { generateEmail } from '@/lib/ai';
import { Plus, Sparkles, Trash2, Loader2, Save } from 'lucide-react';
import { formatRelative } from '@/lib/utils';

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [type, setType] = useState<EmailType>('candidate');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<EmailStatus>('draft');
  const [purpose, setPurpose] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setEmails(emailStore.list());
  }, []);

  const refresh = () => setEmails(emailStore.list());

  async function handleGenerate() {
    if (!recipient) {
      alert('Enter a recipient first.');
      return;
    }
    setGenerating(true);
    try {
      const result = await generateEmail({ recipient, type, purpose });
      setSubject(result.subject);
      setContent(result.content);
    } finally {
      setGenerating(false);
    }
  }

  function resetForm() {
    setRecipient('');
    setType('candidate');
    setSubject('');
    setContent('');
    setStatus('draft');
    setPurpose('');
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createEmailWithAutomation({ recipient, type, subject, content, status });
    resetForm();
    refresh();
  }

  function statusBadge(s: EmailStatus) {
    const v = s === 'replied' ? 'success' : s === 'sent' ? 'info' : s === 'follow_up' ? 'warning' : 'secondary';
    return <Badge variant={v}>{s.replace('_', ' ')}</Badge>;
  }

  function changeStatus(id: string, newStatus: EmailStatus) {
    updateEmailWithAutomation(id, { status: newStatus });
    refresh();
  }

  function handleDelete(id: string) {
    emailStore.delete(id);
    refresh();
  }

  return (
    <div className="px-5 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Email Tracker"
        description={`${emails.length} tracked email${emails.length !== 1 ? 's' : ''}`}
      />

      <div className="space-y-4">
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={14} /> New Email
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardContent className="p-5">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Recipient</Label>
                    <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Jane Doe <jane@acme.co>" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select value={type} onChange={(e) => setType(e.target.value as EmailType)}>
                      <option value="candidate">Candidate</option>
                      <option value="client">Client</option>
                      <option value="recruiter">Recruiter</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Purpose (for AI)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
                      {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      Generate Email
                    </Button>
                  </div>
                  <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Follow up after first interview" />
                </div>

                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                  <Label>Content</Label>
                  <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={status} onChange={(e) => setStatus(e.target.value as EmailStatus)}>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent (auto-creates follow-up task)</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="replied">Replied</option>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    <Save size={14} /> Save Email
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {emails.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No emails yet.</p>
              </CardContent>
            </Card>
          ) : (
            emails.map((email) => (
              <Card key={email.id}>
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{email.recipient}</span>
                      <Badge variant="outline">{email.type}</Badge>
                      {statusBadge(email.status)}
                    </div>
                    {email.subject && <p className="text-xs text-muted-foreground mt-1 truncate">{email.subject}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">{formatRelative(email.updatedAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Select
                      value={email.status}
                      onChange={(e) => changeStatus(email.id, e.target.value as EmailStatus)}
                      className="h-7 text-xs w-auto"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="follow_up">Follow-up</option>
                      <option value="replied">Replied</option>
                    </Select>
                    <button onClick={() => handleDelete(email.id)} className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 size={14} />
                    </button>
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

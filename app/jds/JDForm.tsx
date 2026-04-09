'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { createJD, updateJD, aiGenerateJD } from '@/actions/jds';
import { Sparkles, Save, Loader2 } from 'lucide-react';

interface Props {
  jd?: {
    id: string;
    title: string;
    company: string;
    seniority: string;
    description: string;
  };
}

export default function JDForm({ jd }: Props) {
  const [title, setTitle] = useState(jd?.title || '');
  const [company, setCompany] = useState(jd?.company || '');
  const [seniority, setSeniority] = useState(jd?.seniority || 'Mid');
  const [description, setDescription] = useState(jd?.description || '');
  const [pending, startTransition] = useTransition();
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    if (!title || !company) {
      alert('Fill in Title and Company first.');
      return;
    }
    setGenerating(true);
    try {
      const text = await aiGenerateJD({ title, company, seniority });
      setDescription(text);
    } finally {
      setGenerating(false);
    }
  }

  function handleSubmit(formData: FormData) {
    formData.set('title', title);
    formData.set('company', company);
    formData.set('seniority', seniority);
    formData.set('description', description);
    startTransition(async () => {
      if (jd) await updateJD(jd.id, formData);
      else await createJD(formData);
    });
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Role Title</Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior Software Engineer"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="AfterQuery"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="seniority">Seniority</Label>
            <Select
              id="seniority"
              name="seniority"
              value={seniority}
              onChange={(e) => setSeniority(e.target.value)}
            >
              <option value="Junior">Junior</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
              <option value="Staff">Staff</option>
              <option value="Principal">Principal</option>
              <option value="Founding">Founding</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Sparkles size={12} />
                )}
                Generate JD
              </Button>
            </div>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={14}
              placeholder="Write or generate the job description..."
              className="font-mono text-xs"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {jd ? 'Update' : 'Create'} JD
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

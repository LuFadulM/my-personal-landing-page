'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import JDForm from '../JDForm';
import { jdStore, type JobDescription } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function EditJDPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [jd, setJd] = useState<JobDescription | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const found = jdStore.get(params.id);
    setJd(found || null);
    setLoaded(true);
  }, [params.id]);

  function handleDelete() {
    if (!confirm('Delete this JD?')) return;
    jdStore.delete(params.id);
    router.push('/jds');
  }

  if (!loaded) return <div className="p-8 text-sm text-muted-foreground">Loading...</div>;
  if (!jd) return <div className="p-8 text-sm text-muted-foreground">JD not found.</div>;

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <PageHeader
        title="Edit Job Description"
        action={
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 size={12} /> Delete
          </Button>
        }
      />
      <JDForm jd={jd} />
    </div>
  );
}

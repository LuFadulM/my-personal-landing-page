import { notFound } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import JDForm from '../JDForm';
import { getJD, deleteJD } from '@/actions/jds';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditJDPage({ params }: { params: { id: string } }) {
  const jd = await getJD(params.id);
  if (!jd) notFound();

  async function handleDelete() {
    'use server';
    await deleteJD(params.id);
    redirect('/jds');
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <PageHeader
        title="Edit Job Description"
        action={
          <form action={handleDelete}>
            <Button variant="destructive" size="sm" type="submit">
              <Trash2 size={12} /> Delete
            </Button>
          </form>
        }
      />
      <JDForm
        jd={{
          id: jd.id,
          title: jd.title,
          company: jd.company,
          seniority: jd.seniority,
          description: jd.description,
        }}
      />
    </div>
  );
}

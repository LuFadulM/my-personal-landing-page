'use client';

import PageHeader from '@/components/PageHeader';
import JDForm from '../JDForm';

export default function NewJDPage() {
  return (
    <div className="px-5 lg:px-8 py-6 max-w-3xl mx-auto">
      <PageHeader
        title="New Job Description"
        description="Draft a JD from scratch or use AI to get started."
      />
      <JDForm />
    </div>
  );
}

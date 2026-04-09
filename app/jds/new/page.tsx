import PageHeader from '@/components/PageHeader';
import JDForm from '../JDForm';

export default function NewJDPage() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <PageHeader
        title="New Job Description"
        description="Draft a JD from scratch or use AI to get started."
      />
      <JDForm />
    </div>
  );
}

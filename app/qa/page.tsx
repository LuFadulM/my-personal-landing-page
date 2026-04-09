import PageHeader from '@/components/PageHeader';
import { listQAReviews } from '@/actions/qa';
import QAClient from './QAClient';

export const dynamic = 'force-dynamic';

export default async function QAPage() {
  const reviews = await listQAReviews();
  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <PageHeader
        title="QA Reviews"
        description={`${reviews.length} review${reviews.length !== 1 ? 's' : ''}`}
      />
      <QAClient reviews={reviews} />
    </div>
  );
}

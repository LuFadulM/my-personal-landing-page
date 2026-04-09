import PageHeader from '@/components/PageHeader';
import { listDocs } from '@/actions/docs';
import DocsClient from './DocsClient';

export const dynamic = 'force-dynamic';

export default async function DocsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const docs = await listDocs(searchParams.q);
  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <PageHeader
        title="Docs"
        description="SOPs and knowledge base — searchable and tagged."
      />
      <DocsClient docs={docs} initialQuery={searchParams.q || ''} />
    </div>
  );
}

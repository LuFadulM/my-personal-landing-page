import PageHeader from '@/components/PageHeader';
import { listEmails } from '@/actions/emails';
import EmailsClient from './EmailsClient';

export const dynamic = 'force-dynamic';

export default async function EmailsPage() {
  const emails = await listEmails();
  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <PageHeader
        title="Email Tracker"
        description={`${emails.length} tracked email${emails.length !== 1 ? 's' : ''}`}
      />
      <EmailsClient emails={emails} />
    </div>
  );
}

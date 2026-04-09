import PageHeader from '@/components/PageHeader';
import { listTasks } from '@/actions/tasks';
import TasksClient from './TasksClient';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const tasks = await listTasks();
  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <PageHeader title="Tasks" description={`${tasks.length} total`} />
      <TasksClient tasks={tasks} />
    </div>
  );
}

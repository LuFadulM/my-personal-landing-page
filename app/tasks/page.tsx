'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { taskStore, type Task, type TaskStatus, type TaskPriority } from '@/lib/store';
import { Plus, Check, Trash2, Circle, CircleDot, CheckCircle2 } from 'lucide-react';
import { formatRelative } from '@/lib/utils';

const statusConfig: Record<TaskStatus, { label: string; icon: typeof Circle; color: string }> = {
  todo: { label: 'To do', icon: Circle, color: 'text-muted-foreground' },
  doing: { label: 'Doing', icon: CircleDot, color: 'text-blue-400' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-emerald-400' },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    setTasks(taskStore.list());
  }, []);

  const refresh = () => setTasks(taskStore.list());

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    taskStore.create({
      title: title.trim(),
      status: 'todo',
      priority,
      dueDate: dueDate || null,
    });
    setTitle('');
    setPriority('medium');
    setDueDate('');
    setShowForm(false);
    refresh();
  }

  function cycleStatus(task: Task) {
    const next: TaskStatus = task.status === 'todo' ? 'doing' : task.status === 'doing' ? 'done' : 'todo';
    taskStore.update(task.id, { status: next });
    refresh();
  }

  function handleDelete(id: string) {
    taskStore.delete(id);
    refresh();
  }

  const filtered = tasks.filter((t) => filter === 'all' || t.status === filter);

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <PageHeader title="Tasks" description={`${tasks.length} total`} />

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 bg-card border rounded-lg p-0.5">
            {(['all', 'todo', 'doing', 'done'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors capitalize ${
                  filter === f ? 'bg-primary/20 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f === 'all' ? 'All' : statusConfig[f].label}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={14} /> New Task
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleCreate} className="space-y-3">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                  required
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                    <option value="low">Low priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="high">High priority</option>
                  </Select>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    <Check size={14} /> Add
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-1.5">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No tasks here.</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((task) => {
              const StatusIcon = statusConfig[task.status].icon;
              return (
                <Card key={task.id} className={task.status === 'done' ? 'opacity-50' : ''}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <button
                      onClick={() => cycleStatus(task)}
                      className={`${statusConfig[task.status].color} hover:scale-110 transition-transform`}
                    >
                      <StatusIcon size={18} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${task.status === 'done' ? 'line-through' : ''}`}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'warning' : 'secondary'}>
                          {task.priority}
                        </Badge>
                        {task.dueDate && (
                          <span className="text-[10px] text-muted-foreground">
                            Due {formatRelative(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(task.id)} className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 size={14} />
                    </button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

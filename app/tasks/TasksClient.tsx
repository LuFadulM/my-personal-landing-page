'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  createTask,
  updateTaskStatus,
  deleteTask,
} from '@/actions/tasks';
import { Plus, Check, Trash2, Circle, CircleDot, CheckCircle2 } from 'lucide-react';
import { formatRelative } from '@/lib/utils';
import type { Task, TaskStatus } from '@prisma/client';

const statusConfig: Record<TaskStatus, { label: string; icon: typeof Circle; color: string }> = {
  todo: { label: 'To do', icon: Circle, color: 'text-muted-foreground' },
  doing: { label: 'Doing', icon: CircleDot, color: 'text-blue-400' },
  done: { label: 'Done', icon: CheckCircle2, color: 'text-emerald-400' },
};

export default function TasksClient({ tasks: initialTasks }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [, startTransition] = useTransition();

  const filtered = tasks.filter((t) => filter === 'all' || t.status === filter);

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createTask(formData);
      // Optimistic: re-fetch via full reload would be cleaner in production
      location.reload();
    });
  }

  function cycleStatus(task: Task) {
    const next: TaskStatus =
      task.status === 'todo' ? 'doing' : task.status === 'doing' ? 'done' : 'todo';
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: next } : t))
    );
    startTransition(() => updateTaskStatus(task.id, next));
  }

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    startTransition(() => deleteTask(id));
  }

  return (
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
            <form action={handleCreate} className="space-y-3">
              <Input name="title" placeholder="Task title" required autoFocus />
              <div className="grid grid-cols-2 gap-3">
                <Select name="priority" defaultValue="medium">
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                </Select>
                <Input name="dueDate" type="date" />
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
              <Card
                key={task.id}
                className={task.status === 'done' ? 'opacity-50' : ''}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <button
                    onClick={() => cycleStatus(task)}
                    className={`${statusConfig[task.status].color} hover:scale-110 transition-transform`}
                  >
                    <StatusIcon size={18} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.status === 'done' ? 'line-through' : ''}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant={
                          task.priority === 'high'
                            ? 'destructive'
                            : task.priority === 'medium'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {task.priority}
                      </Badge>
                      {task.dueDate && (
                        <span className="text-[10px] text-muted-foreground">
                          Due {formatRelative(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-muted-foreground hover:text-destructive p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

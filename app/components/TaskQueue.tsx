'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  CheckCircle,
  Trash2,
  X,
  Save,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Sun,
  Calendar,
} from 'lucide-react';

interface Task {
  id: string;
  description: string;
  assignedTo: string;
  channel: string;
  priority: 'Urgent' | 'Today' | 'This Week';
  status: 'Pending' | 'Done';
  createdAt: string;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const priorityConfig = {
  Urgent: {
    icon: AlertTriangle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
  Today: {
    icon: Sun,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
  'This Week': {
    icon: Calendar,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
};

export default function TaskQueue() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [form, setForm] = useState({
    description: '',
    assignedTo: 'Will',
    channel: '#operations',
    priority: 'Today' as 'Urgent' | 'Today' | 'This Week',
  });

  useEffect(() => {
    setTasks(JSON.parse(localStorage.getItem('contrario_tasks') || '[]'));
  }, []);

  const saveTasks = (t: Task[]) => {
    setTasks(t);
    localStorage.setItem('contrario_tasks', JSON.stringify(t));
  };

  const addTask = () => {
    if (!form.description.trim()) return;
    saveTasks([
      ...tasks,
      {
        id: genId(),
        ...form,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      },
    ]);
    setForm({
      description: '',
      assignedTo: 'Will',
      channel: '#operations',
      priority: 'Today',
    });
    setShowForm(false);
  };

  const toggleDone = (id: string) => {
    saveTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'Done' ? 'Pending' : 'Done' }
          : t
      )
    );
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter((t) => t.id !== id));
  };

  const pendingTasks = tasks.filter((t) => t.status === 'Pending');
  const doneTasks = tasks.filter((t) => t.status === 'Done');

  const renderGroup = (priority: 'Urgent' | 'Today' | 'This Week') => {
    const grouped = pendingTasks.filter((t) => t.priority === priority);
    if (grouped.length === 0) return null;
    const config = priorityConfig[priority];
    const Icon = config.icon;

    return (
      <div key={priority} className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon size={16} className={config.color} />
          <h3 className={`text-sm font-semibold ${config.color}`}>
            {priority}
          </h3>
          <span className="text-xs text-gray-500">({grouped.length})</span>
        </div>
        <div className="space-y-2">
          {grouped.map((task) => (
            <div
              key={task.id}
              className={`${config.bg} border ${config.border} rounded-lg p-3 flex items-center gap-3`}
            >
              <button
                onClick={() => toggleDone(task.id)}
                className="text-gray-500 hover:text-green-400 transition-colors shrink-0"
              >
                <CheckCircle size={20} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{task.description}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>Assigned: {task.assignedTo}</span>
                  <span>{task.channel}</span>
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-500 hover:text-red-400 shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Task Queue</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent hover:bg-accent-dim text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1"
        >
          <Plus size={14} /> Add Task
        </button>
      </div>

      {showForm && (
        <div className="bg-bg-card border border-gray-700 rounded-xl p-4 mb-6 space-y-3">
          <input
            className="w-full bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-accent outline-none"
            placeholder="Task description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            autoFocus
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              className="bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-accent outline-none"
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
            >
              <option value="Will">Will</option>
              <option value="Arya">Arya</option>
              <option value="Taeyoung">Taeyoung</option>
              <option value="Other">Other</option>
            </select>
            <select
              className="bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-accent outline-none"
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
            >
              <option value="#operations">#operations</option>
              <option value="#[client]-contrario">#[client]-contrario</option>
              <option value="DM">DM</option>
              <option value="Other">Other</option>
            </select>
            <select
              className="bg-bg-hover border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-accent outline-none"
              value={form.priority}
              onChange={(e) =>
                setForm({
                  ...form,
                  priority: e.target.value as 'Urgent' | 'Today' | 'This Week',
                })
              }
            >
              <option value="Urgent">Urgent</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addTask}
              className="bg-accent hover:bg-accent-dim text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1"
            >
              <Save size={14} /> Add Task
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {pendingTasks.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-500">
          <CheckCircle size={48} className="mx-auto mb-3 opacity-50" />
          <p>No pending tasks. Great work!</p>
        </div>
      )}

      {renderGroup('Urgent')}
      {renderGroup('Today')}
      {renderGroup('This Week')}

      {doneTasks.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 mb-3"
          >
            {showCompleted ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
            Completed ({doneTasks.length})
          </button>
          {showCompleted && (
            <div className="space-y-2">
              {doneTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-bg-card/50 border border-gray-800/50 rounded-lg p-3 flex items-center gap-3 opacity-60"
                >
                  <button
                    onClick={() => toggleDone(task.id)}
                    className="text-green-400 shrink-0"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 line-through">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{task.assignedTo}</span>
                      <span>{task.channel}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-600 hover:text-red-400 shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

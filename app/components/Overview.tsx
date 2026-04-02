'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  AlertCircle,
  Mail,
  MessageSquare,
  ListTodo,
  AlertTriangle,
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  introEmailSent: boolean;
  introEmailDate: string;
  replied: boolean;
  notes: string;
  clientId: string;
  roleId: string;
}

interface Task {
  id: string;
  description: string;
  assignedTo: string;
  channel: string;
  priority: 'Urgent' | 'Today' | 'This Week';
  status: 'Pending' | 'Done';
}

interface OverviewProps {
  onNavigate: (section: string) => void;
}

function getDaysSince(dateStr: string): number {
  if (!dateStr) return 0;
  const sent = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - sent.getTime()) / (1000 * 60 * 60 * 24));
}

export default function Overview({ onNavigate }: OverviewProps) {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    needFollowUp: 0,
    emailsSent: 0,
    replied: 0,
    openTasks: 0,
    urgentTasks: 0,
  });

  useEffect(() => {
    const candidates: Candidate[] = JSON.parse(
      localStorage.getItem('contrario_candidates') || '[]'
    );
    const tasks: Task[] = JSON.parse(
      localStorage.getItem('contrario_tasks') || '[]'
    );

    const needFollowUp = candidates.filter(
      (c) =>
        c.introEmailSent &&
        !c.replied &&
        getDaysSince(c.introEmailDate) >= 2
    ).length;

    setStats({
      totalCandidates: candidates.length,
      needFollowUp,
      emailsSent: candidates.filter((c) => c.introEmailSent).length,
      replied: candidates.filter((c) => c.replied).length,
      openTasks: tasks.filter((t) => t.status === 'Pending').length,
      urgentTasks: tasks.filter(
        (t) => t.priority === 'Urgent' && t.status === 'Pending'
      ).length,
    });
  }, []);

  const cards = [
    {
      label: 'Total Candidates',
      value: stats.totalCandidates,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      nav: 'candidates',
    },
    {
      label: 'Need Follow-Up',
      value: stats.needFollowUp,
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      nav: 'followup',
    },
    {
      label: 'Emails Sent',
      value: stats.emailsSent,
      icon: Mail,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      nav: 'candidates',
    },
    {
      label: 'Replied',
      value: stats.replied,
      icon: MessageSquare,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      nav: 'candidates',
    },
    {
      label: 'Open Tasks',
      value: stats.openTasks,
      icon: ListTodo,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      nav: 'tasks',
    },
    {
      label: 'Urgent Tasks',
      value: stats.urgentTasks,
      icon: AlertTriangle,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
      nav: 'tasks',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => onNavigate(card.nav)}
              className="bg-bg-card border border-gray-800 rounded-xl p-5 flex items-center gap-4 hover:border-accent/50 transition-all text-left group"
            >
              <div
                className={`${card.bg} p-3 rounded-lg group-hover:scale-110 transition-transform`}
              >
                <Icon className={card.color} size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-sm text-gray-400">{card.label}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDashboardStats } from '@/lib/store';
import { formatRelative } from '@/lib/utils';
import { CheckSquare, Mail, FileText, ClipboardCheck, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<ReturnType<typeof getDashboardStats> | null>(null);

  useEffect(() => {
    setStats(getDashboardStats());
  }, []);

  if (!stats) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl">
        <PageHeader title="Dashboard" description="Your daily operations at a glance." />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const cards = [
    { label: 'Tasks due today', value: stats.tasksDueToday, icon: CheckSquare, href: '/tasks', color: 'text-primary' },
    { label: 'Emails needing follow-up', value: stats.emailsFollowUp, icon: Mail, href: '/emails', color: 'text-amber-400' },
    { label: 'Active Job Descriptions', value: stats.jdCount, icon: FileText, href: '/jds', color: 'text-emerald-400' },
    { label: 'Pending QA Reviews', value: stats.qaPending, icon: ClipboardCheck, href: '/qa', color: 'text-blue-400' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <PageHeader title="Dashboard" description="Your daily operations at a glance." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href}>
              <Card className="hover:border-primary/40 transition-colors">
                <CardContent className="p-5 flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                  <Icon className={card.color} size={20} />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Upcoming Tasks</CardTitle>
              <Link href="/tasks" className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {stats.recentTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No open tasks.</p>
            ) : (
              stats.recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{task.title}</p>
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
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Recent Emails</CardTitle>
              <Link href="/emails" className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1">
                View all <ArrowRight size={11} />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {stats.recentEmails.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No emails yet.</p>
            ) : (
              stats.recentEmails.map((email) => (
                <div key={email.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{email.recipient}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {email.subject || email.content.slice(0, 60)}
                    </p>
                  </div>
                  <Badge variant={email.status === 'replied' ? 'success' : email.status === 'sent' ? 'info' : email.status === 'follow_up' ? 'warning' : 'secondary'}>
                    {email.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

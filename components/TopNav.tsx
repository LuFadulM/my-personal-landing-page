'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bell,
  FileText,
  CheckSquare,
  Mail,
  BookOpen,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  followUpStore,
  taskStore,
  seedFollowUpsIfNeeded,
} from '@/lib/store';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, countKey: null },
  { href: '/followups', label: 'Follow-Ups', icon: Bell, countKey: 'followups' as const },
  { href: '/jds', label: 'Job Positions', icon: FileText, countKey: null },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare, countKey: 'tasks' as const },
  { href: '/emails', label: 'Emails', icon: Mail, countKey: null },
  { href: '/docs', label: 'Docs', icon: BookOpen, countKey: null },
  { href: '/qa', label: 'QA Reviews', icon: ClipboardCheck, countKey: null },
];

export default function TopNav() {
  const pathname = usePathname();
  const [counts, setCounts] = useState({ followups: 0, tasks: 0 });

  useEffect(() => {
    seedFollowUpsIfNeeded();

    const urgent = followUpStore
      .list()
      .filter(
        (f) => !f.resolved && (f.category === 'urgent' || f.category === 'nudge' || f.category === 'no_fup')
      ).length;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const tasksDue = taskStore.list().filter((t) => {
      if (t.status === 'done' || !t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= start && d <= end;
    }).length;

    setCounts({ followups: urgent, tasks: tasksDue });
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="flex items-center px-5 h-[60px] gap-1 overflow-x-auto">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 pr-4 mr-2 border-r border-border shrink-0">
          <span className="logo-badge">C</span>
          <span className="text-sm font-bold logo-gradient">Contrario</span>
        </Link>

        {/* Nav items */}
        <nav className="flex items-center gap-0.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            const count = item.countKey ? counts[item.countKey] : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-full text-[13px] transition-all whitespace-nowrap',
                  active
                    ? 'btn-gradient'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon size={15} />
                <span>{item.label}</span>
                {count > 0 && !active && <span className="count-badge">{count}</span>}
                {count > 0 && active && (
                  <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 rounded-full">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

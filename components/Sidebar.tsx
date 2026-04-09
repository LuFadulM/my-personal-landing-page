'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Mail,
  BookOpen,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jds', label: 'Job Descriptions', icon: FileText },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/emails', label: 'Emails', icon: Mail },
  { href: '/docs', label: 'Docs', icon: BookOpen },
  { href: '/qa', label: 'QA Reviews', icon: ClipboardCheck },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 flex-col border-r bg-card">
      <div className="px-5 py-5 border-b">
        <h1 className="text-base font-bold tracking-tight">
          <span className="text-primary">Ops</span>OS
        </h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">Recruiting Operations</p>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t">
        <p className="text-[10px] text-muted-foreground">OpsOS v0.1 · MVP</p>
      </div>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  Mail,
  BarChart3,
  Sunrise,
  BookOpen,
  Upload,
  Tag,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/tags', label: 'Slack Tags', icon: Tag },
  { href: '/jds', label: 'JD Tracker', icon: FileText },
  { href: '/emails', label: 'Email Tracker', icon: Mail },
  { href: '/kpis', label: 'KPIs', icon: BarChart3 },
  { href: '/review', label: 'Daily Review', icon: Sunrise },
  { href: '/knowledge', label: 'Knowledge', icon: BookOpen },
  { href: '/import', label: 'Import Data', icon: Upload },
];

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const w = collapsed ? 'w-[68px]' : 'w-[230px]';

  return (
    <aside className={cn('border-r border-border bg-surface flex flex-col shrink-0 transition-all', w)}>
      <div className={cn('flex items-center justify-between px-4 py-5 border-b border-border', collapsed && 'px-3')}>
        {!collapsed && (
          <div>
            <div className="font-display font-bold text-base text-gold tracking-tight">Contrario</div>
            <div className="text-xs text-muted">Command Center</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-elevated text-muted hover:text-fg transition-colors"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex-1 py-3">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm transition-all relative',
                active ? 'text-fg bg-elevated' : 'text-muted hover:text-fg hover:bg-elevated/50',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.label : undefined}
            >
              {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-gold rounded-r" />}
              <Icon size={17} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border py-3">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-fg hover:bg-elevated/50 transition-colors',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={17} />
          {!collapsed && <span className="font-medium">Settings</span>}
        </Link>
      </div>
    </aside>
  );
}

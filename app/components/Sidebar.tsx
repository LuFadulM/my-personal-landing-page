'use client';

import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  AlertTriangle,
  GitBranch,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';

export type Section =
  | 'overview'
  | 'clients'
  | 'review'
  | 'followup'
  | 'pipeline'
  | 'roles';

interface Props {
  active: Section;
  onNavigate: (s: Section) => void;
  reviewCount: number;
}

const items: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients & Roles', icon: Building2 },
  { id: 'review', label: 'For Review', icon: ClipboardCheck },
  { id: 'followup', label: 'Follow-Up Tracker', icon: AlertTriangle },
  { id: 'pipeline', label: 'Stage Pipeline', icon: GitBranch },
];

export default function Sidebar({ active, onNavigate, reviewCount }: Props) {
  return (
    <aside className="w-60 bg-surface-card border-r border-surface-border flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-surface-border">
        <h1 className="text-lg font-bold tracking-tight text-white">
          <span className="text-brand-500">C</span>ontrario
        </h1>
        <p className="text-[11px] text-gray-500 mt-0.5">Recruiting Ops Dashboard</p>
      </div>

      <nav className="flex-1 py-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-5 py-2.5 text-[13px] transition-all relative',
                isActive
                  ? 'bg-brand-500/10 text-brand-400 font-medium'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface-hover'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-brand-500" />
              )}
              <Icon size={18} />
              <span>{item.label}</span>
              {item.id === 'review' && reviewCount > 0 && (
                <span className="ml-auto bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {reviewCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-surface-border">
        <p className="text-[10px] text-gray-600">Contrario Dashboard v2.0</p>
      </div>
    </aside>
  );
}

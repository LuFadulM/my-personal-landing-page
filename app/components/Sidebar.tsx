'use client';

import {
  LayoutDashboard,
  Users,
  Clock,
  ListTodo,
  CheckSquare,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  active: string;
  onNavigate: (section: string) => void;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'candidates', label: 'Candidate Tracker', icon: Users },
  { id: 'followup', label: 'Follow-Up Queue', icon: Clock },
  { id: 'tasks', label: 'Task Queue', icon: ListTodo },
  { id: 'checklist', label: 'Daily Checklist', icon: CheckSquare },
  { id: 'roles', label: 'Roles Health', icon: Activity },
];

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } bg-bg-card border-r border-gray-800 flex flex-col transition-all duration-200 shrink-0`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        {!collapsed && (
          <h1 className="text-lg font-bold text-white tracking-tight">
            <span className="text-accent">C</span>ontrario
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-bg-hover text-gray-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                isActive
                  ? 'bg-accent/10 text-accent border-r-2 border-accent'
                  : 'text-gray-400 hover:text-white hover:bg-bg-hover'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        {!collapsed && (
          <p className="text-xs text-gray-500">Contrario Ops v1.0</p>
        )}
      </div>
    </aside>
  );
}

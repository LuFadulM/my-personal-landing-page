'use client';

import { useEffect, useState } from 'react';
import { Search, Bell, Moon, Sun } from 'lucide-react';

export default function TopBar({ onOpenCmd }: { onOpenCmd: () => void }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('cc_theme') : null;
    const isDark = saved !== 'light';
    document.documentElement.classList.toggle('light', !isDark);
    setDark(isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('light', !next);
    localStorage.setItem('cc_theme', next ? 'dark' : 'light');
  }

  return (
    <header className="h-14 border-b border-border bg-surface/60 backdrop-blur-sm flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-30">
      <button
        onClick={onOpenCmd}
        className="flex items-center gap-2.5 text-muted hover:text-fg bg-elevated/50 border border-border rounded-full px-3.5 py-1.5 text-sm transition-colors min-w-[260px]"
      >
        <Search size={14} />
        <span className="flex-1 text-left">Search or jump to…</span>
        <kbd className="text-[10px] font-mono bg-surface border border-border rounded px-1.5 py-0.5">
          {typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac') ? '⌘K' : 'Ctrl+K'}
        </kbd>
      </button>

      <div className="flex items-center gap-1">
        <button onClick={toggle} className="p-2 rounded-lg hover:bg-elevated text-muted hover:text-fg" aria-label="Toggle theme">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button className="p-2 rounded-lg hover:bg-elevated text-muted hover:text-fg relative" aria-label="Notifications">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gold rounded-full" />
        </button>
      </div>
    </header>
  );
}

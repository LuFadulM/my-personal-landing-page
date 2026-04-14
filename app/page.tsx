'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Mail,
  Target,
  ClipboardList,
  AlertTriangle,
} from 'lucide-react';
import Overview from '@/components/Overview';
import JDTracker from '@/components/JDTracker';
import IntroEmails from '@/components/IntroEmails';
import KPIs from '@/components/KPIs';
import WeeklyReport from '@/components/WeeklyReport';
import ErrorLog from '@/components/ErrorLog';

type Tab = 'overview' | 'jds' | 'emails' | 'kpis' | 'report' | 'errorlog';

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'jds', label: 'JD Tracker', icon: FileText },
  { id: 'emails', label: 'Emails', icon: Mail },
  { id: 'kpis', label: 'KPIs', icon: Target },
  { id: 'report', label: 'Weekly Report', icon: ClipboardList },
  { id: 'errorlog', label: 'Error Log', icon: AlertTriangle },
];

export default function Home() {
  const [active, setActive] = useState<Tab>('overview');

  const render = () => {
    switch (active) {
      case 'overview': return <Overview />;
      case 'jds': return <JDTracker />;
      case 'emails': return <IntroEmails />;
      case 'kpis': return <KPIs />;
      case 'report': return <WeeklyReport />;
      case 'errorlog': return <ErrorLog />;
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-base font-display font-bold tracking-tight">
              <span className="text-accent">Contrario</span>{' '}
              <span className="text-muted font-body font-normal text-xs">Command Center</span>
            </h1>
            <span className="text-[10px] text-muted font-mono">v3.1</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-accent via-accent2 to-transparent h-px" />
      </header>

      <nav className="border-b border-border bg-card/30 sticky top-[57px] z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex gap-0.5 overflow-x-auto py-1 scrollbar-thin">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = active === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-accent/15 text-accent'
                      : 'text-muted hover:text-fg hover:bg-border/40'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        {render()}
      </main>

      <footer className="border-t border-border py-4 mt-8">
        <p className="text-center text-[10px] text-muted font-mono">
          Contrario Command Center v3.1 — Built by Lucia
        </p>
      </footer>
    </div>
  );
}

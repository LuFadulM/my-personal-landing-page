'use client';

import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { Home, FileText, Mail, BarChart3, Sunrise, BookOpen, Upload, Tag, Briefcase, Settings, Plus } from 'lucide-react';
import { useEffect } from 'react';

interface Props { open: boolean; onClose: () => void; }

const pages = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Slack Tags Tracker', href: '/tags', icon: Tag },
  { label: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { label: 'JD Tracker', href: '/jds', icon: FileText },
  { label: 'Email Tracker', href: '/emails', icon: Mail },
  { label: 'KPIs', href: '/kpis', icon: BarChart3 },
  { label: 'Daily Review', href: '/review', icon: Sunrise },
  { label: 'Knowledge Base', href: '/knowledge', icon: BookOpen },
  { label: 'Import Data', href: '/import', icon: Upload },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  function go(href: string) {
    router.push(href);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div
        className="w-full max-w-[560px] bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command palette" className="flex flex-col">
          <Command.Input
            autoFocus
            placeholder="Search pages, tasks, or candidates…"
            className="w-full bg-transparent border-0 border-b border-border px-5 py-4 text-base text-fg placeholder:text-muted focus:outline-none"
          />
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted">No results.</Command.Empty>
            <Command.Group heading="Navigate" className="text-xs">
              {pages.map((p) => {
                const Icon = p.icon;
                return (
                  <Command.Item
                    key={p.href}
                    value={p.label}
                    onSelect={() => go(p.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm data-[selected=true]:bg-elevated"
                  >
                    <Icon size={15} className="text-muted" />
                    {p.label}
                  </Command.Item>
                );
              })}
            </Command.Group>
            <Command.Group heading="Quick Actions" className="text-xs">
              <Command.Item onSelect={() => go('/jds?new=1')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm data-[selected=true]:bg-elevated">
                <Plus size={15} className="text-gold" /> New role
              </Command.Item>
              <Command.Item onSelect={() => go('/kpis?log=1')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm data-[selected=true]:bg-elevated">
                <Plus size={15} className="text-gold" /> Log today's KPIs
              </Command.Item>
              <Command.Item onSelect={() => go('/review')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm data-[selected=true]:bg-elevated">
                <Plus size={15} className="text-gold" /> Write today's review
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

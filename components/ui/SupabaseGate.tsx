'use client';

import { isSupabaseConfigured } from '@/lib/supabase';
import { AlertCircle } from 'lucide-react';

export default function SupabaseGate({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="card p-6 flex gap-4 border-warning/30 bg-warning/5">
        <AlertCircle className="text-warning shrink-0" size={20} />
        <div>
          <h3 className="font-display font-semibold text-fg mb-1">Supabase not connected</h3>
          <p className="text-sm text-muted">
            Set <code className="font-mono text-xs bg-elevated px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="font-mono text-xs bg-elevated px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel,
            then run <code className="font-mono text-xs bg-elevated px-1.5 py-0.5 rounded">supabase/schema.sql</code> +{' '}
            <code className="font-mono text-xs bg-elevated px-1.5 py-0.5 rounded">supabase/seed.sql</code> in your Supabase SQL editor.
          </p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

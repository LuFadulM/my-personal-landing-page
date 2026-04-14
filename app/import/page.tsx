'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import PageHeader from '@/components/ui/PageHeader';
import SupabaseGate from '@/components/ui/SupabaseGate';
import { Upload, FileSpreadsheet, Check, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

type Target = 'clients' | 'roles' | 'candidates' | 'kpi_entries';

const schemas: Record<Target, { fields: string[]; required: string[]; }> = {
  clients: { fields: ['name', 'status', 'slack_channel', 'ats', 'notes'], required: ['name'] },
  roles: { fields: ['company', 'title', 'type', 'location', 'compensation', 'bounty', 'yoe', 'ats', 'status'], required: ['title'] },
  candidates: { fields: ['role_id', 'name', 'email', 'linkedin', 'intro_sent_at', 'response_status', 'followup_round'], required: ['name'] },
  kpi_entries: { fields: ['date', 'intros_sent', 'responses_received', 'interviews_scheduled', 'offers_extended', 'placements', 'jds_drafted', 'jds_completed', 'followups_sent', 'notes'], required: ['date'] },
};

// Aliases: commonly-seen CSV column names → our canonical field
const aliases: Record<string, string> = {
  role_title: 'title',
  role: 'title',
  function: 'type',
  bounty_pct: 'bounty',
  client: 'company',
  client_name: 'company',
};

// Status normalizers for roles
const roleStatusMap: Record<string, string> = {
  active: 'live',
  complete: 'filled',
  completed: 'filled',
  live: 'live',
  draft: 'draft',
  paused: 'paused',
  filled: 'filled',
  cancelled: 'cancelled',
};

export default function ImportPage() {
  const [target, setTarget] = useState<Target>('roles');
  const [rows, setRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState('');
  const [pasted, setPasted] = useState('');
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [replaceMode, setReplaceMode] = useState(false);

  function ingestCSVText(text: string, name = 'pasted.csv') {
    setFileName(name);
    setResult(null);
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    setRows(parsed.data as any[]);
    setHeaders(parsed.meta.fields || []);
    autoMap(parsed.meta.fields || []);
  }

  function handleFile(f: File) {
    setResult(null);
    const ext = f.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (ext === 'csv' || ext === 'tsv') {
          ingestCSVText(reader.result as string, f.name);
        } else if (ext === 'xlsx' || ext === 'xls') {
          const buf = new Uint8Array(reader.result as ArrayBuffer);
          const wb = XLSX.read(buf, { type: 'array' });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' });
          setFileName(f.name);
          setRows(json);
          const h = Object.keys(json[0] || {});
          setHeaders(h);
          autoMap(h);
        }
      } catch (err: any) {
        alert('Failed to parse file: ' + err.message);
      }
    };
    if (ext === 'xlsx' || ext === 'xls') reader.readAsArrayBuffer(f);
    else reader.readAsText(f);
  }

  function autoMap(h: string[]) {
    const schema = schemas[target];
    const m: Record<string, string> = {};
    h.forEach((col) => {
      const norm = col.toLowerCase().trim().replace(/[\s-]+/g, '_');
      const aliased = aliases[norm] || norm;
      const match = schema.fields.find((f) => f === aliased || f === norm);
      if (match) m[col] = match;
    });
    setMapping(m);
  }

  async function resolveClientId(companyName: string, cache: Map<string, string>): Promise<string | null> {
    if (!companyName) return null;
    if (cache.has(companyName)) return cache.get(companyName)!;
    const { data: existing } = await supabase.from('clients').select('id').eq('name', companyName).maybeSingle();
    if (existing) {
      cache.set(companyName, existing.id);
      return existing.id;
    }
    const { data: created, error } = await supabase.from('clients').insert({ name: companyName, status: 'active' }).select('id').single();
    if (error || !created) return null;
    cache.set(companyName, created.id);
    return created.id;
  }

  async function doImport() {
    setBusy(true);
    setResult(null);
    let success = 0, failed = 0;
    const errors: string[] = [];
    const schema = schemas[target];
    const clientCache = new Map<string, string>();

    // Replace mode (roles only): archive existing before inserting
    if (replaceMode && target === 'roles') {
      await supabase.from('roles').update({ archived: true }).eq('archived', false);
    }

    for (const row of rows) {
      const mapped: any = {};
      for (const [src, dst] of Object.entries(mapping)) {
        if (dst && row[src] !== undefined && String(row[src]).trim() !== '') {
          mapped[dst] = String(row[src]).trim();
        }
      }

      // Special handling for roles: resolve company → client_id, normalize status
      if (target === 'roles') {
        if (mapped.company) {
          const cid = await resolveClientId(mapped.company, clientCache);
          if (cid) mapped.client_id = cid;
          delete mapped.company;
        }
        if (mapped.status) {
          const norm = roleStatusMap[mapped.status.toLowerCase()];
          mapped.status = norm || 'draft';
        }
      }

      const missingRequired = schema.required.filter((f) => !mapped[f]);
      if (missingRequired.length) {
        failed++;
        errors.push(`Row skipped — missing: ${missingRequired.join(', ')}`);
        continue;
      }

      const { error } = await supabase.from(target).insert(mapped);
      if (error) { failed++; errors.push(`${mapped.title || mapped.name}: ${error.message}`); }
      else success++;
    }

    await supabase.from('imports').insert({
      filename: fileName, target_table: target, rows_imported: success,
      status: failed === 0 ? 'completed' : 'failed',
      error_log: errors.length ? errors.join('\n').slice(0, 2000) : null,
    });

    setResult({ success, failed, errors: errors.slice(0, 10) });
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Data"
        description="Upload a CSV, TSV, or XLSX file — or paste the raw CSV directly. Map columns, validate, import."
      />

      <SupabaseGate>
        <div className="card p-6 space-y-5">
          <section>
            <label className="text-xs text-muted uppercase tracking-wider">Target table</label>
            <div className="flex gap-2 mt-2">
              {(Object.keys(schemas) as Target[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTarget(t); if (headers.length) autoMap(headers); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${target === t ? 'bg-gold/15 text-gold' : 'bg-surface border border-border text-muted hover:text-fg'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            {target === 'roles' && (
              <p className="text-[11px] text-muted mt-2 flex items-center gap-1.5">
                <Sparkles size={11} className="text-gold" /> For roles: we auto-resolve "company" names to client_id,
                create missing clients, and map Active→live / Complete→filled.
              </p>
            )}
          </section>

          <section>
            <label className="text-xs text-muted uppercase tracking-wider">Upload file</label>
            <label className="mt-2 block border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-gold/50 transition-colors">
              <input type="file" accept=".csv,.tsv,.xlsx,.xls" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
              <FileSpreadsheet className="mx-auto mb-2 text-muted" size={28} />
              <p className="text-sm">{fileName || 'Drop file here or click to browse'}</p>
              <p className="text-xs text-muted mt-1">.csv, .tsv, .xlsx up to 10MB</p>
            </label>
          </section>

          <section>
            <label className="text-xs text-muted uppercase tracking-wider">Or paste CSV directly</label>
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder="company,role_title,function,location,compensation,yoe,bounty_pct,ats,status&#10;AfterQuery,Technical Account Manager,GTM,SF,TBD,TBD,15%,Contrario,Active"
              rows={6}
              className="mt-2 w-full bg-elevated border border-border rounded-md px-3 py-2 text-xs font-mono focus:border-gold/50 focus:outline-none"
            />
            <button
              disabled={!pasted.trim()}
              onClick={() => ingestCSVText(pasted.trim())}
              className="mt-2 btn-secondary text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <ArrowRight size={12} /> Parse pasted CSV
            </button>
          </section>

          {headers.length > 0 && (
            <>
              <section>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted uppercase tracking-wider">Column mapping</label>
                  <button onClick={() => autoMap(headers)} className="text-[11px] text-gold hover:underline flex items-center gap-1">
                    <Sparkles size={10} /> Auto-map
                  </button>
                </div>
                <div className="space-y-1.5 mt-2">
                  {headers.map((h) => (
                    <div key={h} className="flex items-center gap-3">
                      <div className="flex-1 text-sm font-mono text-muted">{h}</div>
                      <ArrowRight size={12} className="text-muted" />
                      <select
                        value={mapping[h] || ''}
                        onChange={(e) => setMapping({ ...mapping, [h]: e.target.value })}
                        className="flex-1 bg-elevated border border-border rounded-md px-2 py-1 text-sm"
                      >
                        <option value="">— ignore —</option>
                        {schemas[target].fields.map((f) => (
                          <option key={f} value={f}>{f}{schemas[target].required.includes(f) ? ' *' : ''}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <label className="text-xs text-muted uppercase tracking-wider mb-2 block">Preview ({rows.length} rows)</label>
                <div className="max-h-48 overflow-y-auto bg-elevated rounded-lg p-3 text-xs font-mono">
                  {rows.slice(0, 3).map((r, i) => (
                    <pre key={i} className="border-b border-border/50 last:border-0 py-1.5 whitespace-pre-wrap">{JSON.stringify(r, null, 2)}</pre>
                  ))}
                </div>
              </section>

              {target === 'roles' && (
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={replaceMode} onChange={(e) => setReplaceMode(e.target.checked)} />
                  <span>Replace mode: archive all existing roles before importing (fresh start)</span>
                </label>
              )}

              <button onClick={doImport} disabled={busy} className="btn-primary inline-flex items-center gap-1.5 disabled:opacity-50">
                <Upload size={14} /> {busy ? 'Importing…' : `Import ${rows.length} rows`}
              </button>
            </>
          )}

          {result && (
            <div className={`rounded-xl p-4 ${result.failed === 0 ? 'bg-success/10 border border-success/30' : 'bg-warning/10 border border-warning/30'}`}>
              <div className="flex items-center gap-2 font-medium">
                {result.failed === 0 ? <Check size={16} className="text-success" /> : <AlertCircle size={16} className="text-warning" />}
                Imported {result.success} of {result.success + result.failed} rows
              </div>
              {result.errors.length > 0 && (
                <ul className="mt-2 text-xs text-muted space-y-0.5">
                  {result.errors.map((e, i) => <li key={i}>· {e}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
      </SupabaseGate>
    </div>
  );
}

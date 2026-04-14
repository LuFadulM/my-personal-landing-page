'use client';

import type { IntroEmail } from '@/data/emails';

/**
 * Fetch a published Google Sheet as CSV and parse into intro-email rows.
 *
 * HOW TO GET THE URL:
 * 1. Open the Contrario Email Tracker Google Sheet
 * 2. File -> Share -> Publish to web
 * 3. Choose the tab, select "Comma-separated values (.csv)"
 * 4. Click Publish, copy the URL
 * 5. Paste it into the Intro Emails tab settings
 *
 * Expected columns (from the n8n workflow spec):
 * A Candidate Name | B Candidate Email | C Company | D Role | E Intro Date
 * F Days Since | G Replied? | H Reply Date | I Reply Snippet
 * J FU Sent? | K FU Round | L Status | M Thread ID | N Last Updated
 */

function parseCSVLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQuote = false;
      else cur += ch;
    } else {
      if (ch === ',') { cells.push(cur); cur = ''; }
      else if (ch === '"') inQuote = true;
      else cur += ch;
    }
  }
  cells.push(cur);
  return cells;
}

export function parseCSV(csv: string): string[][] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.map(parseCSVLine);
}

export async function fetchSheetCSV(url: string): Promise<IntroEmail[]> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const text = await res.text();
  const rows = parseCSV(text);
  if (rows.length < 2) return [];

  // Skip header row
  return rows.slice(1).map((r) => {
    const replied = (r[6] || '').trim().toUpperCase();
    return {
      date: normalizeDate(r[4] || ''),
      name: (r[0] || '').trim(),
      role: (r[3] || '').trim(),
      co: (r[2] || '').trim(),
      replied: replied === 'YES' || replied === 'Y' || replied === 'TRUE',
    } as IntroEmail;
  }).filter((e) => e.name && e.date);
}

function normalizeDate(s: string): string {
  const trimmed = s.trim();
  if (!trimmed) return '';
  // Try ISO first
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  // Try M/D/YYYY or MM/DD/YYYY
  const slash = trimmed.split('/');
  if (slash.length === 3) {
    const [m, d, y] = slash;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  // Try "Apr 10, 2026"
  const dt = new Date(trimmed);
  if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
  return '';
}

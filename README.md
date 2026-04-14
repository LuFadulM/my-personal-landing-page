# Contrario Command Center v4

Lucía's personal daily operating system for Contrario recruiting ops.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Supabase** (Postgres + Auth + Realtime) for all data
- **React Query** for server state
- **Recharts** for KPI viz
- **PapaParse / SheetJS** for CSV + XLSX import
- **cmdk** for the ⌘K command palette

## Features

9 modules:

1. **Dashboard** — Today's Pulse, task list, follow-up queue, activity feed, client health strip
2. **JD Tracker** — 88-role seed, 13-section detail panel, filters, create/edit/archive
3. **Email Tracker** — candidate pipeline with response status, follow-up rounds, smart filters
4. **KPIs** — daily input form, 5 Recharts visualizations, weekly scorecard
5. **Daily Review** — EOD ritual: wins / misses / tomorrow's priorities auto-create tasks
6. **Knowledge Base** — SOPs, templates, FAQs, client intel; full-text search; pinned; tags
7. **Import Data** — drag-drop CSV/TSV/XLSX upload, column mapping, validation preview
8. **Team Pulse** — recruiter cards (7 team members), open tasks, reply rate, workload heatmap
9. **Client Deep-Dive** — per-client detail with all roles, candidates, and metrics

Plus: **⌘K command palette**, dark/light mode toggle, sidebar collapse, notifications bell.

## Setup

### 1. Create env vars in Vercel

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

(Already configured in your Vercel project per latest confirmation.)

### 2. Run the Supabase migrations

In the Supabase SQL editor (https://supabase.com/dashboard/project/dhgmbbororzuexksczwj/sql):

1. Paste `supabase/schema.sql` → Run (creates 9 tables + RLS)
2. Paste `supabase/seed.sql` → Run (loads 46 clients, 88 roles, 10 KB entries, 1 KPI row)

### 3. Local dev

```bash
cp .env.example .env.local  # fill in NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

## Design

- Dark default, optional light mode
- Gold accent (`#E8C872`) — Contrario warmth
- Outfit (display) + DM Sans (body) + JetBrains Mono (numbers)
- Max content width 1200px
- Calm, focused, never overwhelming

## Data Model

9 Postgres tables: `clients`, `roles`, `candidates`, `tasks`, `kpi_entries`, `knowledge_base`, `daily_reviews`, `sheet_syncs`, `imports`. See `supabase/schema.sql`.

Row-level security enabled with permissive anon policies for the single-user tool. Tighten later when adding auth.

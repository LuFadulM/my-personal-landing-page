-- Contrario Command Center v4 — Supabase schema
-- Run this in the Supabase SQL editor BEFORE loading the app.

create extension if not exists "uuid-ossp";

-- ── CLIENTS ─────────────────────────────────────────
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text default 'active' check (status in ('active', 'paused', 'churned')),
  slack_channel text,
  ats text default 'Ashby',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── ROLES (JDs) ─────────────────────────────────────
create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  type text check (type in ('Engineering', 'GTM', 'Ops', 'Design', 'Data / ML', 'Sales', 'Other')),
  location text,
  remote_policy text,
  compensation text,
  equity text,
  bounty text,
  yoe text,
  headcount int default 1,
  status text default 'draft' check (status in ('draft', 'jd_in_progress', 'jd_complete', 'outreach_ready', 'live', 'paused', 'filled', 'cancelled')),
  jd_link text,
  ashby_link text,
  key_requirements text[],
  nice_to_haves text[],
  green_flags text[],
  red_flags text[],
  interview_process text[],
  internal_notes text,
  seq1_draft text,
  seq2_draft text,
  seq3_draft text,
  connection_request text,
  intro_email_template text,
  archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── CANDIDATES ──────────────────────────────────────
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  role_id uuid references roles(id) on delete cascade,
  name text not null,
  email text,
  linkedin text,
  intro_sent_at timestamptz,
  intro_sent_by text default 'team@contrario.ai',
  response_status text default 'pending' check (response_status in ('pending', 'replied', 'declined', 'no_response', 'auto_reply', 'interview_scheduled', 'ghosted')),
  response_date timestamptz,
  response_snippet text,
  followup_round int default 0,
  last_followup_at timestamptz,
  next_followup_due timestamptz,
  notes text,
  archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── TASKS ───────────────────────────────────────────
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text check (category in ('jd_production', 'outreach', 'follow_up', 'client_comms', 'pipeline', 'automation', 'admin', 'other')),
  priority text default 'medium' check (priority in ('urgent', 'high', 'medium', 'low')),
  status text default 'todo' check (status in ('todo', 'in_progress', 'done', 'blocked')),
  due_date date,
  client_id uuid references clients(id) on delete set null,
  role_id uuid references roles(id) on delete set null,
  assigned_to text,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- ── KPI ENTRIES ─────────────────────────────────────
create table if not exists kpi_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  period text default 'daily' check (period in ('daily', 'weekly', 'monthly')),
  intros_sent int default 0,
  responses_received int default 0,
  interviews_scheduled int default 0,
  offers_extended int default 0,
  placements int default 0,
  jds_drafted int default 0,
  jds_completed int default 0,
  outreach_sequences_created int default 0,
  followups_sent int default 0,
  followups_pending int default 0,
  active_clients int default 0,
  active_roles int default 0,
  notes text,
  created_at timestamptz default now()
);

-- ── KNOWLEDGE BASE ──────────────────────────────────
create table if not exists knowledge_base (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text check (category in ('process', 'template', 'faq', 'client_intel', 'tool_guide', 'sop', 'reference')),
  content text not null default '',
  tags text[] default array[]::text[],
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── DAILY REVIEWS ───────────────────────────────────
create table if not exists daily_reviews (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date unique,
  tasks_planned int,
  tasks_completed int,
  went_well text,
  didnt_go_well text,
  priority_1 text,
  priority_2 text,
  priority_3 text,
  blockers text,
  energy_level int check (energy_level between 1 and 5),
  created_at timestamptz default now()
);

-- ── SHEET SYNC SETTINGS ─────────────────────────────
create table if not exists sheet_syncs (
  id uuid primary key default gen_random_uuid(),
  target_table text not null unique check (target_table in ('clients', 'roles', 'candidates', 'kpi_entries')),
  sheet_url text not null,
  last_synced_at timestamptz,
  last_status text,
  created_at timestamptz default now()
);

-- ── IMPORT LOG ──────────────────────────────────────
create table if not exists imports (
  id uuid primary key default gen_random_uuid(),
  filename text,
  source_url text,
  rows_imported int,
  target_table text,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  error_log text,
  created_at timestamptz default now()
);

-- ── Trigger: touch updated_at ───────────────────────
create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$ declare t text;
begin
  foreach t in array array['clients','roles','candidates','knowledge_base']
  loop
    execute format('drop trigger if exists trg_%I_updated_at on %I', t, t);
    execute format('create trigger trg_%I_updated_at before update on %I for each row execute function touch_updated_at()', t, t);
  end loop;
end $$;

-- ── Row-level security (enable, allow anon read/write for now) ──
-- Personal tool, single user. Tighten later with auth.
alter table clients enable row level security;
alter table roles enable row level security;
alter table candidates enable row level security;
alter table tasks enable row level security;
alter table kpi_entries enable row level security;
alter table knowledge_base enable row level security;
alter table daily_reviews enable row level security;
alter table sheet_syncs enable row level security;
alter table imports enable row level security;

do $$ declare t text;
begin
  foreach t in array array['clients','roles','candidates','tasks','kpi_entries','knowledge_base','daily_reviews','sheet_syncs','imports']
  loop
    execute format('drop policy if exists "allow_anon_all" on %I', t);
    execute format('create policy "allow_anon_all" on %I for all to anon using (true) with check (true)', t);
  end loop;
end $$;

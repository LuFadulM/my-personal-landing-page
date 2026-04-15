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

-- Contrario Command Center v4 — Seed data
-- Run AFTER schema.sql. Idempotent: re-running clears + reinserts.

begin;

truncate candidates, roles, clients, knowledge_base, kpi_entries, daily_reviews, tasks, sheet_syncs, imports restart identity cascade;

-- ── Seed clients ────────────────────────────────────
insert into clients (name, status, ats, slack_channel) values
  ('AfterQuery', 'active', 'Contrario', '#afterquery-contrario'),
  ('Alinea Invest', 'active', 'Contrario', '#alinea-contrario'),
  ('Amari AI', 'active', 'Contrario', '#amari-contrario'),
  ('Antes AI', 'active', 'Contrario', null),
  ('Aravalli Capital', 'active', 'Contrario', null),
  ('AthenaHQ', 'active', 'Ashby', '#athenahq-contrario'),
  ('BACH', 'active', 'Contrario', null),
  ('Bespoke Labs', 'active', 'Ashby', '#bespokelabs-contrario'),
  ('Besty AI', 'active', 'Contrario', '#bestyai-contrario'),
  ('Bluejay', 'active', 'Contrario', '#bluejay-contrario'),
  ('Cardinal', 'active', 'Contrario', '#cardinal-contrario'),
  ('CollectWise', 'active', 'Contrario', null),
  ('Colonist', 'active', 'Contrario', null),
  ('Contrario', 'active', 'Contrario', null),
  ('Convexia', 'active', 'Contrario', null),
  ('DoDo Inc.', 'active', 'Contrario', null),
  ('Dots (YC S21)', 'active', 'Contrario', '#dots-contrario'),
  ('Dynamo AI', 'active', 'Contrario', null),
  ('foam', 'active', 'Contrario', '#foam-contrario'),
  ('Gallium', 'active', 'Contrario', null),
  ('Gigi', 'active', 'Contrario', '#gigi-contrario'),
  ('Innate Inc.', 'active', 'Contrario', null),
  ('Jampack AI', 'active', 'Ashby', null),
  ('Judgment Labs', 'active', 'Contrario', '#judgmentlabs-contrario'),
  ('Known', 'active', 'Ashby', null),
  ('Kobalt Labs', 'active', 'Contrario', '#kobaltlabs-contrario'),
  ('Liquid', 'active', 'Contrario', null),
  ('Listen Labs', 'active', 'Ashby', '#listenlabs-contrario'),
  ('Loop AI', 'active', 'Contrario', null),
  ('Mason AI', 'active', 'Calendly', null),
  ('Maximor AI', 'active', 'Contrario', null),
  ('Mem0', 'active', 'Contrario', '#mem0-contrario'),
  ('Mixed Nuts Inc.', 'active', 'Contrario', null),
  ('Porter', 'active', 'Contrario', '#porter-contrario'),
  ('Remy AI', 'active', 'Calendly', null),
  ('Sieve', 'active', 'Contrario', '#sieve-contrario'),
  ('Simula', 'active', 'Contrario', '#simula-contrario'),
  ('Soff (YC)', 'active', 'Contrario', '#soff-contrario'),
  ('Sphinx Labs', 'active', 'Contrario', '#sphinx-contrario'),
  ('Strala', 'active', 'Contrario', '#strala-contrario'),
  ('Trellis AI', 'active', 'Contrario', '#trellis-contrario'),
  ('TriFetch', 'active', 'Contrario', '#trifetch-contrario'),
  ('Uncountable', 'active', 'Contrario', null),
  ('Verita AI', 'active', 'Contrario', '#veritaai-contrario'),
  ('VRChat', 'active', 'Lever', '#vrchat-contrario'),
  ('Wildcard', 'active', 'Calendly', null),
  ('Wispr AI', 'active', 'Contrario', null)
on conflict do nothing;

-- ── Seed roles (88 JDs from Lucía's actual data) ────
-- Status mapping: Active → 'live', Complete → 'filled'
insert into roles (client_id, title, type, location, compensation, yoe, bounty, status)
select (select id from clients where name = c), r, t::text, l, cm, y, b, s::text
from (values
  ('AfterQuery', 'Technical Account Manager', 'GTM', 'SF (in-person)', 'TBD', 'TBD', '15%', 'live'),
  ('AfterQuery', 'Tech GTM Associate / GTM Lead', 'GTM', 'SF (in-person)', 'TBD', 'TBD', '15%', 'live'),
  ('AfterQuery', 'Growth Associate', 'GTM', 'SF (in-person)', 'TBD', 'TBD', '14%', 'live'),
  ('AfterQuery', 'Research Scientist', 'Data / ML', 'SF (in-person)', 'TBD', 'TBD', '15%', 'live'),
  ('AfterQuery', 'Sr Software Engineer, Infra & Platform', 'Engineering', 'SF (in-person)', '$220K-$280K / $500K-$1M equity (4yr)', '5+', '15%', 'live'),
  ('AfterQuery', 'Software Engineer, Platform & Research', 'Engineering', 'SF (in-person)', 'TBD', '3-6', '15%', 'live'),
  ('AfterQuery', 'Strategic Projects Lead', 'Ops', 'SF (in-person)', 'TBD', 'TBD', '15%', 'live'),
  ('Alinea Invest', 'Software Engineer, Reliability & Platform', 'Engineering', 'Remote US / NYC preferred', '$170K-$220K', '3-7', 'TBD', 'live'),
  ('Alinea Invest', 'iOS Product Engineer, LATAM', 'Engineering', 'Remote LATAM', '$8K-$10K/mo', '3+', 'TBD', 'live'),
  ('Alinea Invest', 'Founding AI Engineer', 'Engineering', 'NYC (in-person)', '$160K-$200K', 'Any', 'TBD', 'live'),
  ('Amari AI', 'Full Stack Engineer', 'Engineering', 'SF (in-person)', 'Up to high $200s / 0.2%-0.5% equity', '4+', '25%', 'live'),
  ('Amari AI', 'Senior Frontend Engineer', 'Engineering', 'SF (in-person)', '$170K-$220K + equity', 'TBD', '18.5%', 'live'),
  ('Antes AI', 'Applied AI Engineer', 'Engineering', 'SF (in-person)', '$180K-$250K / 0.1%-1% equity', 'TBD', 'TBD', 'live'),
  ('Aravalli Capital', 'AI Systems Engineer', 'Engineering', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('AthenaHQ', 'Account Executive', 'Sales', 'SF (in-person)', '$120K-$150K base / $240K-$300K OTE', '2-5', '15.5%', 'live'),
  ('AthenaHQ', 'Product Engineer', 'Engineering', 'SF (in-person)', '$140K-$200K', '0-5', '17.5%', 'live'),
  ('BACH', 'Account Executive', 'Sales', 'SF (in-person)', '$65K-$75K base / up to $171K OTE', 'TBD', '15.5%', 'live'),
  ('Bespoke Labs', 'Strategic Projects Lead', 'Ops', 'Bangalore / Mountain View', '$40K-$60K (India) / $160K-$300K (US)', '1-3', '15.5%', 'live'),
  ('Bespoke Labs', 'Senior DevOps Engineer (Contract)', 'Engineering', 'Remote worldwide', '$600-$1K/deliverable / $10K-$50K total', '2-15', '20% of contract', 'live'),
  ('Besty AI', 'Operations & Strategy Lead', 'Ops', 'TBD', 'TBD', 'TBD', 'TBD', 'filled'),
  ('Besty AI', 'Head of Finance & Operations', 'Ops', 'NYC (in-person)', '$150K-$200K / 0.3%-0.5% equity', '4+', 'TBD', 'live'),
  ('Bluejay', 'Senior Founding Engineer', 'Engineering', 'SF (in-person)', '$200K-$250K / 0.20%-1.00% equity', 'TBD', 'TBD', 'live'),
  ('Bluejay', 'Founding GTM', 'GTM', 'SF (in-person)', '$120K-$220K + 8-15% commission', 'TBD', 'TBD', 'live'),
  ('Cardinal', 'Founding Sales', 'Sales', 'SF (in-person)', '$100K-$140K base / $200K-$280K OTE', '2-5', '15.5%', 'live'),
  ('Cardinal', 'Founding Engineer', 'Engineering', 'SF (in-person)', '$160K-$235K', '2-5', 'TBD', 'live'),
  ('CollectWise', 'Forward Deployed Engineer', 'Engineering', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('CollectWise', 'Founding Account Executive', 'Sales', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('CollectWise', 'AI Agent Engineer', 'Engineering', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('Colonist', 'Full-Stack Product Developer', 'Engineering', 'Remote', 'TBD', 'TBD', 'TBD', 'live'),
  ('Contrario', 'Member of Technical Staff', 'Engineering', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('Convexia', 'Operations Assistant', 'Ops', 'TBD', 'TBD', 'TBD', 'N/A', 'filled'),
  ('DoDo Inc.', 'Customer Support Rep', 'Ops', 'Remote', 'TBD', 'TBD', 'TBD', 'live'),
  ('Dots (YC S21)', 'Head of Growth', 'GTM', 'SF / NYC', 'TBD', 'TBD', 'TBD', 'live'),
  ('Dots (YC S21)', 'Enterprise AE', 'Sales', 'SF / NYC', 'TBD', 'TBD', 'TBD', 'live'),
  ('Dynamo AI', 'Federal Account Executive', 'Sales', 'TBD', 'TBD', 'TBD', 'TBD', 'live'),
  ('foam', 'Founding Engineer', 'Engineering', 'SF (in-person)', '$250K-$400K / 0.25%-2% equity', '3-6', 'TBD', 'live'),
  ('Gallium', 'Content Strategist - LinkedIn', 'GTM', 'Remote US / Remote LATAM', '$60K-$80K / $4K-$6K/mo (LATAM)', 'Flexible', '10%', 'live'),
  ('Gigi', 'Founding CTO', 'Engineering', 'TBD', '$250K-$400K / 5%-10% equity', 'TBD', '18.5%', 'live'),
  ('Gigi', 'Founding Product Designer', 'Design', 'TBD', '$200K-$300K / 1%-3% equity', 'TBD', '17.5%', 'live'),
  ('Innate Inc.', 'Founding Engineer', 'Engineering', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('Innate Inc.', 'GTM Lead', 'GTM', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('Innate Inc.', 'Chief of Staff', 'Ops', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('Jampack AI', 'Integrations Engineer, LATAM', 'Engineering', 'Remote LATAM', '$7K-$10K/mo', '6-8', '10%', 'live'),
  ('Jampack AI', 'Founding Full Stack Engineer', 'Engineering', 'Brooklyn NYC (in-person)', '$160K-$220K / 0.1%-0.5% equity', '2-5', '16.5%', 'live'),
  ('Judgment Labs', 'Forward Deployed AI Engineer', 'Engineering', 'SF (in-person)', '$200K-$400K', 'TBD', 'TBD', 'live'),
  ('Known', 'Strategy & Operations Fellow', 'Ops', 'SF (in-person)', 'TBD', '1-4', 'TBD', 'live'),
  ('Known', 'ML Engineer, Matchmaking', 'Data / ML', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('Known', 'Product Engineer, Mobile', 'Engineering', 'SF (in-person)', '$170K-$230K + equity', '2-6', 'TBD', 'live'),
  ('Kobalt Labs', 'Founding Full Stack Engineer', 'Engineering', 'NYC (in-person)', '$200K-$250K / 0.5%-1% equity', '4-7', 'TBD', 'live'),
  ('Kobalt Labs', 'Account Executive (x3)', 'Sales', 'NYC (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('Liquid', 'Growth Marketer', 'GTM', 'NYC (in-person)', '$140K-$180K / 0.2%-0.4% equity', 'TBD', 'TBD', 'live'),
  ('Liquid', 'Product Designer', 'Design', 'NYC (in-person)', '$140K-$180K / 0.1%-0.3% equity', 'TBD', 'TBD', 'live'),
  ('Listen Labs', 'Lead GTM Engineer', 'GTM', 'SF / NYC', '$140K-$210K', '3-7', 'TBD', 'live'),
  ('Listen Labs', 'Growth Operations Lead', 'GTM', 'SF / NYC', 'TBD', 'TBD', 'TBD', 'live'),
  ('Loop AI', 'Staff Engineer', 'Engineering', 'SF (in-person)', 'TBD', '6+', 'TBD', 'live'),
  ('Mason AI', 'Founding Engineer', 'Engineering', 'NYC (in-person)', '$150K-$190K / 1%-2% equity', '2-5', '16.5%', 'live'),
  ('Maximor AI', 'Full Stack Engineer, India', 'Engineering', 'Remote India', '60-80L INR/yr', '3-5', '18%', 'live'),
  ('Maximor AI', 'Full Stack Engineer, LATAM', 'Engineering', 'Remote LATAM', '$10K-$12K/mo', '6-10', '18%', 'live'),
  ('Mem0', 'Full Stack Engineer', 'Engineering', 'SF (in-person)', '$180K-$250K / 0.1%-0.4% equity', 'TBD', '16.5%', 'live'),
  ('Mem0', 'Head of Growth', 'GTM', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('Mem0', 'Backend Engineer', 'Engineering', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('Mixed Nuts Inc.', 'Buyer, Inventory & Import Specialist', 'Ops', 'Pico Rivera, CA', '$75K-$90K', '2-4', '14.5%', 'live'),
  ('Porter', 'Design / Micro-Interaction Engineer', 'Design', 'NYC (in-person)', '$200K-$280K + equity', '5+', '18%', 'live'),
  ('Porter', 'Kubernetes & Cloud Engineer', 'Engineering', 'NYC (in-person)', 'TBD', 'TBD', '18%', 'live'),
  ('Porter', 'Senior Backend Engineer', 'Engineering', 'NYC (in-person)', 'TBD', 'TBD', '18%', 'live'),
  ('Remy AI', 'Senior Full Stack Engineer, LATAM', 'Engineering', 'Remote LATAM', '$8K-$10K/mo + equity', '5+', 'TBD', 'live'),
  ('Sieve', 'Research Engineer, Computer Vision', 'Data / ML', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('Sieve', 'Data Operations Lead', 'Ops', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('Simula', 'Senior Mobile SDK Engineer', 'Engineering', 'Remote LATAM', 'TBD', 'TBD', 'TBD', 'live'),
  ('Simula', 'HTML5 Mini Game Developer', 'Engineering', 'Remote LATAM', 'TBD', 'TBD', 'TBD', 'live'),
  ('Soff (YC)', 'Founding AI PM', 'Ops', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('Soff (YC)', 'Backend AI Engineer', 'Engineering', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('Sphinx Labs', 'Head of Sales', 'Sales', 'SF (in-person)', '$160K-$250K / 0.20%-0.50% equity', '3+', 'TBD', 'live'),
  ('Sphinx Labs', 'Member of Technical Staff', 'Engineering', 'TBD', 'TBD', 'TBD', 'TBD', 'live'),
  ('Strala', 'Sales Development Representative', 'Sales', 'SF (in-person)', 'TBD', 'TBD', '16.5%', 'live'),
  ('Strala', 'Software Engineer', 'Engineering', 'SF (in-person)', 'TBD', 'TBD', '16.5%', 'live'),
  ('Strala', 'Growth', 'GTM', 'SF (in-person)', '$130K-$190K + equity', '0-5', '16.5%', 'live'),
  ('Trellis AI', 'Technical Deployment Strategist', 'Engineering', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('Trellis AI', 'Backend AI Engineer', 'Engineering', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live'),
  ('TriFetch', 'Founding Sales', 'Sales', 'SF (in-person)', '$150K-$250K base / $300K-$500K OTE', '3-8', '16.5%', 'live'),
  ('Uncountable', 'AI Full-Stack Engineer', 'Engineering', 'TBD', '$130K-$175K + equity', 'TBD', 'TBD', 'live'),
  ('Verita AI', 'Strategic Projects Lead', 'Ops', 'SF (in-person)', '$130K-$160K + equity', '2-5', 'TBD', 'live'),
  ('Verita AI', 'Full Stack Engineer, LATAM', 'Engineering', 'Remote LATAM', 'TBD', 'TBD', 'TBD', 'live'),
  ('VRChat', 'Recommendations Engineer', 'Data / ML', 'Remote US/Canada', '$110K-$150K + equity', '2-6', '17%', 'live'),
  ('Wildcard', 'Full Stack Engineer, LATAM', 'Engineering', 'Remote LATAM', '$7K-$9K/mo', '1.5-5', '10%', 'live'),
  ('Wildcard', 'Founding Engineer', 'Engineering', 'SF (in-person)', '$160K-$200K', 'TBD', 'TBD', 'live'),
  ('Wispr AI', 'LATAM iOS Engineer', 'Engineering', 'Remote LATAM', 'TBD', 'TBD', 'TBD', 'live'),
  ('Wispr AI', 'Growth Engineer', 'Engineering', 'SF (in-person)', 'TBD', 'TBD', 'TBD', 'live')
) as v(c, r, t, l, cm, y, b, s);

-- ── Knowledge base pre-seeds ────────────────────────
insert into knowledge_base (title, category, content, tags, pinned) values
  ('Intro Email Format', 'template', E'## Subject\nName (Role) <> Company Intro\n\n## Body\n(fill in template here)', array['email','template'], true),
  ('Follow-Up Cadence Rules', 'process', E'- FU1 (3 biz days): same thread, same CCs\n- FU2 (6 biz days): same thread, same CCs\n- FU3 (9 biz days): NEW thread, subject "note re: company", under 70 words, flip the ask', array['followup','process'], true),
  ('JD Template — 13 Sections', 'template', E'(fill in the 13-section template)', array['jd','template'], true),
  ('Outreach Rules — No Company Name', 'process', '(fill in rules)', array['outreach'], false),
  ('Ashby Pipeline Stages', 'tool_guide', '(fill in Ashby stage definitions)', array['ashby','ats'], false),
  ('Client Response SLA', 'process', '(fill in SLA rules)', array['client','sla'], false),
  ('Candidate Status Definitions', 'reference', '(fill in definitions)', array['reference'], false),
  ('ATS Archiving vs Rejecting', 'faq', '(fill in)', array['ats','faq'], false),
  ('n8n Automation Inventory', 'tool_guide', '(list all n8n automations)', array['n8n','automation'], false),
  ('Comp Benchmarks by Role Type', 'reference', '(fill in benchmarks)', array['comp','reference'], false);

-- ── Initial KPI entry ───────────────────────────────
insert into kpi_entries (date, period, active_clients, active_roles, notes) values
  (current_date, 'daily', 46, 88, 'Initial seed from v3 migration');

commit;

-- Contrario Command Center — Email tracker seed
-- Seeds 117 candidates from Lucía's Gmail tracker (March 29 – April 15, 2026)
-- Run AFTER schema.sql + seed.sql have been applied.
-- Idempotent within itself: truncates candidates first, then re-inserts.

begin;

truncate candidates restart identity cascade;

-- ── helper: infer role type from title ──────────────
create or replace function _infer_role_type(p_title text) returns text as $$
begin
  if p_title ilike '%designer%' or p_title ilike '%design /%' then return 'Design';
  elsif p_title ilike '%research%' and (p_title ilike '%ml%' or p_title ilike '%machine%') then return 'Data / ML';
  elsif p_title ilike '%ml researcher%' or p_title ilike '%research scientist%' or p_title ilike '%recommendations%' then return 'Data / ML';
  elsif p_title ilike '%growth%' or p_title ilike '%gtm%' then return 'GTM';
  elsif p_title ilike '%sales%' or p_title ilike '%account executive%' or p_title ilike '%sdr%' then return 'Sales';
  elsif p_title ilike '%founders associate%' or p_title ilike '%founding ai pm%' or p_title ilike '%customer success%'
        or p_title ilike '%operations%' or p_title ilike '%projects lead%' or p_title ilike '%buyer%'
        or p_title ilike '%customer support%' or p_title ilike '%chief of staff%' or p_title ilike '%talent%' then return 'Ops';
  elsif p_title ilike '%engineer%' or p_title ilike '%mts%' or p_title ilike '%member of technical staff%'
        or p_title ilike '%technical interview%' or p_title ilike '%cto%' then return 'Engineering';
  else return 'Other';
  end if;
end;
$$ language plpgsql;

-- ── main loop ───────────────────────────────────────
do $$
declare
  v_record record;
  v_client_id uuid;
  v_role_id uuid;
  v_role_type text;
  v_intro_at timestamptz;
  v_reply_at timestamptz;
  v_last_fu_at timestamptz;
  v_next_fu_at timestamptz;
begin
  for v_record in
    select * from (values
      -- 4-15
      ('Innate Inc.', 'Robotics Research Engineer', 'Sakethram', 'sakethmvsaketh@gmail.com', '2026-04-15'::date, 'pending', null::date, 0),
      ('Innate Inc.', 'Robotics Research Engineer', 'Hua-Hsuan', 'hl3811@columbia.edu', '2026-04-15', 'pending', null, 0),
      ('Maximor AI', 'India Full Stack Engineer', 'Saundarya', 'saundaryakhatri1008@gmail.com', '2026-04-15', 'pending', null, 0),
      -- 4-14
      ('CollectWise', 'AI Agent Engineer', 'Justin', 'justinpettitxai@gmail.com', '2026-04-14', 'interview_scheduled', '2026-04-14'::date, 0),
      ('Dots', 'Founding Growth Lead', 'Peter', 'peterverprauskus@gmail.com', '2026-04-14', 'pending', null, 0),
      ('Sphinx Labs', 'Founding Sales', 'Neal', 'neal.siganporia@gmail.com', '2026-04-14', 'pending', null, 0),
      ('Auctor', 'Founding Account Executive', 'Griffin', 'griffinmcgrath5@gmail.com', '2026-04-14', 'pending', null, 0),
      ('CollectWise', 'Founding Account Executive', 'Harold', 'harolddrumgoole@gmail.com', '2026-04-14', 'pending', null, 0),
      ('Antes AI', 'Founding Engineer - Applied AI', 'Aman', 'amankr5934@gmail.com', '2026-04-14', 'pending', null, 0),
      ('Amari AI', 'Senior Frontend Engineer', 'Ignacio', 'IVALENZUELA89@gmail.com', '2026-04-14', 'pending', null, 0),
      ('Cardinal AI', 'Founding Engineer', 'Anupam', 'anupamdas7959@gmail.com', '2026-04-14', 'pending', null, 0),
      ('Antes AI', 'Founding Engineer - Applied AI', 'Gonzalo', 'elg0nz@gmail.com', '2026-04-14', 'interview_scheduled', '2026-04-14', 0),
      -- 4-13
      ('Jampack AI', 'Founding Engineer - FDE', 'Lucas', 'cazlu_bios@hotmail.com', '2026-04-13', 'pending', null, 0),
      ('Auctor', 'Software Engineer', 'Siddhant', 'sijadhav@ucsd.edu', '2026-04-13', 'pending', null, 0),
      ('Judgment Labs', 'Forward Deployed AI Engineer', 'Ignacio', 'IVALENZUELA89@gmail.com', '2026-04-13', 'pending', null, 0),
      ('Wildcard', 'LATAM Full Stack Engineer', 'Carlos', 'carlos.rafaellira@gmail.com', '2026-04-13', 'pending', null, 0),
      ('Mason AI', 'Founding Engineer', 'Ali', 'alirazakhan.offi@gmail.com', '2026-04-13', 'interview_scheduled', '2026-04-13', 0),
      -- 4-12
      ('Amari AI', 'Senior Backend Engineer', 'Vivek', 'vivagarwal18@gmail.com', '2026-04-12', 'interview_scheduled', '2026-04-15', 1),
      ('Optifye', 'Founding Backend Engineer', 'Garv', 'garv18chauhan@gmail.com', '2026-04-12', 'pending', null, 0),
      -- 4-11
      ('Contrario', 'REMOTE Frontend Engineer', 'Nathalia', 'nathi.bruno@gmail.com', '2026-04-11', 'interview_scheduled', '2026-04-11', 0),
      ('Truvo', 'Founders Associate', 'Jiho', 'jihopark10@outlook.com', '2026-04-11', 'interview_scheduled', '2026-04-12', 0),
      ('Truvo', 'Founders Associate', 'Julian', 'julian.s.lynch@gmail.com', '2026-04-11', 'interview_scheduled', '2026-04-11', 0),
      ('Truvo', 'Founders Associate', 'Dev', 'devhp.1125@gmail.com', '2026-04-11', 'pending', null, 0),
      ('Truvo', 'Founders Associate', 'Amy', 'amyhlchen@gmail.com', '2026-04-11', 'pending', null, 0),
      ('Innate Inc.', 'Robotics Research Engineer', 'Zechariah', 'zechariahtay@gmail.com', '2026-04-11', 'pending', null, 0),
      ('Truvo', 'Founders Associate', 'Leopold', 'leoschwarz1999@gmail.com', '2026-04-11', 'interview_scheduled', '2026-04-11', 0),
      ('Truvo', 'Founders Associate', 'Brandon', 'brandonhylton3@gmail.com', '2026-04-11', 'pending', null, 0),
      ('Wildcard', 'Founding Engineer', 'Wendong', 'career@wdsong.net', '2026-04-11', 'pending', null, 1),
      ('Wildcard', 'Founding Engineer', 'Jonathan', 'jonathanamar28@gmail.com', '2026-04-11', 'interview_scheduled', '2026-04-13', 1),
      ('Wildcard', 'Founding Engineer', 'Scott', 'scottqlai@gmail.com', '2026-04-11', 'interview_scheduled', '2026-04-13', 1),
      ('Wildcard', 'LATAM Full Stack Engineer', 'Guilherme', 'guijacobus2@gmail.com', '2026-04-11', 'pending', null, 0),
      ('Wildcard', 'LATAM Full Stack Engineer', 'Leticia', 'leticia.machado50@gmail.com', '2026-04-11', 'interview_scheduled', '2026-04-11', 0),
      ('Wildcard', 'LATAM Full Stack Engineer', 'Pedro', 'pedromonteirogui@gmail.com', '2026-04-11', 'interview_scheduled', '2026-04-11', 0),
      ('Judgment Labs', 'Forward Deployed AI Engineer', 'Alex', 'pasjoman@gmail.com', '2026-04-11', 'interview_scheduled', '2026-04-13', 0),
      -- 4-10
      ('Dodo Health', 'Forward Deployed Engineer', 'Mubashir', 'mubashir.hus24@gmail.com', '2026-04-10', 'interview_scheduled', '2026-04-10', 0),
      ('Porter', 'Design Engineer', 'Diego', 'diego.pinna@gmx.com', '2026-04-10', 'pending', null, 0),
      ('Besty AI', 'Founding Engineer', 'Collin', 'collinlung1@gmail.com', '2026-04-10', 'pending', null, 0),
      ('Closure Intel', 'Founding AI/ML Engineer', 'Kyle', 'kylekovacs253@gmail.com', '2026-04-10', 'interview_scheduled', '2026-04-10', 0),
      ('Bluejay', 'Senior Founding Engineer', 'Brian', 'brianbscho@gmail.com', '2026-04-10', 'interview_scheduled', '2026-04-10', 0),
      -- 4-09
      ('ClarityCare', 'Backend Engineer', 'Scott', 'scottqlai@gmail.com', '2026-04-09', 'pending', null, 0),
      ('Mixed Nuts Inc.', 'Buyer, Inventory and Import Specialist', 'Daniel', 'hernandezdaniel1331@yahoo.com', '2026-04-09', 'interview_scheduled', '2026-04-10', 0),
      ('Mixed Nuts Inc.', 'Buyer, Inventory and Import Specialist', 'Veronica', 'Vechase53@gmail.com', '2026-04-09', 'interview_scheduled', '2026-04-10', 0),
      ('Alinea Invest', 'Software Engineer, Reliability & Platform', 'Vi', 'vi.n.tran1212@gmail.com', '2026-04-09', 'pending', null, 0),
      ('Alinea Invest', 'Software Engineer, Reliability & Platform', 'Arshaan', 'arshaan.bhimani@gmail.com', '2026-04-09', 'pending', null, 0),
      ('Auctor', 'Software Engineer', 'Chenfei', 'louchenfei8@gmail.com', '2026-04-09', 'pending', null, 0),
      ('Mixed Nuts Inc.', 'Buyer, Inventory and Import Specialist', 'Briana', 'Almarazbriana22@gmail.com', '2026-04-09', 'interview_scheduled', '2026-04-10', 0),
      ('Amari AI', 'Senior Backend Engineer', 'Boopesh', 's.boopesh@gmail.com', '2026-04-09', 'pending', null, 0),
      -- 4-03
      ('Unsiloed AI', 'Founding ML Researcher', 'Satish', 'Satishmattam525@gmail.com', '2026-04-03', 'pending', null, 1),
      ('Unsiloed AI', 'Founding ML Researcher', 'Kevin', 'kevintan135531@outlook.com', '2026-04-03', 'replied', '2026-04-07', 1),
      ('Kobalt Labs', 'Account Executive', 'Jay', 'jshah23@gmail.com', '2026-04-03', 'no_response', null, 0),
      ('CollectWise', 'Forward Deployed Engineer', 'Anish', 'anish.bommireddy@gmail.com', '2026-04-03', 'pending', null, 1),
      ('TriFetch', 'Founding Sales', 'Kishan', 'kishan.s.jay@gmail.com', '2026-04-03', 'interview_scheduled', '2026-04-07', 1),
      ('TriFetch', 'Founding Sales', 'Sannah', 'Sannah.khan87@gmail.com', '2026-04-03', 'interview_scheduled', '2026-04-07', 1),
      ('TriFetch', 'Founding Sales', 'Hesham', 'hesham@alum.mit.edu', '2026-04-03', 'interview_scheduled', '2026-04-07', 1),
      ('Optifye', 'Sales Development Representative', 'Utkarsh', 'utkarshyadav3694@gmail.com', '2026-04-03', 'interview_scheduled', '2026-04-07', 1),
      -- 4-02
      ('TriFetch', 'Founding Sales', 'Brian', 'brian@kellyvalley.com', '2026-04-02', 'interview_scheduled', '2026-04-03', 0),
      ('TriFetch', 'Founding Sales', 'Nate', 'natehughes73@gmail.com', '2026-04-02', 'interview_scheduled', '2026-04-02', 0),
      ('TriFetch', 'Founding Sales', 'Samuel', 'samschaber@gmail.com', '2026-04-02', 'pending', null, 1),
      ('Judgment Labs', 'Forward Deployed AI Engineer', 'Arya', 'aryashahvar14@gmail.com', '2026-04-02', 'interview_scheduled', '2026-04-03', 0),
      ('Porter', 'Design Engineer', 'Sandra', 'sandrasychang@gmail.com', '2026-04-02', 'interview_scheduled', '2026-04-02', 0),
      ('Besty AI', 'Founding Engineer', 'Addison', 'klineaddison@gmail.com', '2026-04-02', 'pending', null, 1),
      ('Kobalt Labs', 'Account Executive', 'Paul', 'andrew.siana.life@gmail.com', '2026-04-02', 'interview_scheduled', '2026-04-02', 0),
      ('Amari AI', 'Senior Frontend Engineer', 'Sagar', 'sagarsaija@yahoo.com', '2026-04-02', 'pending', null, 1),
      ('Contrario', 'Member of Technical Staff', 'Kennon', 'kennon.l.young@gmail.com', '2026-04-02', 'no_response', null, 0),
      ('Cardinal AI', 'Founding Sales', 'Julia', 'MCKENZIEBAYLIS@gmail.com', '2026-04-02', 'interview_scheduled', '2026-04-02', 0),
      ('Cardinal AI', 'Founding Sales', 'Maxwell', 'mjsherwood3@gmail.com', '2026-04-02', 'interview_scheduled', '2026-04-02', 0),
      -- 4-01
      ('Bluejay', 'Founding GTM', 'Jacob', 'jacobbratton288@gmail.com', '2026-04-01', 'interview_scheduled', '2026-04-02', 0),
      ('Amari AI', 'Senior Frontend Engineer', 'Sairam', 'jdsairam47@gmail.com', '2026-04-01', 'interview_scheduled', '2026-04-03', 0),
      ('Amari AI', 'Senior Backend Engineer', 'Simran', 'smrnmakhija@gmail.com', '2026-04-01', 'interview_scheduled', '2026-04-07', 1),
      ('Alinea Invest', 'LATAM iOS Product Engineer', 'Ramon', 'oramonhonorio@gmail.com', '2026-04-01', 'interview_scheduled', '2026-04-01', 0),
      ('Alinea Invest', 'LATAM iOS Product Engineer', 'Cesar', 'cesar.giupponi@gmail.com', '2026-04-01', 'interview_scheduled', '2026-04-02', 0),
      ('CollectWise', 'Forward Deployed Engineer', 'Chinguun', 'cgchinguun@gmail.com', '2026-04-01', 'pending', null, 1),
      ('Kobalt Labs', 'Account Executive', 'Katie', 'katie.molano@gmail.com', '2026-04-01', 'pending', null, 1),
      ('AnswerThis', 'Founding Engineer', 'Joseph', 'joenealmoore@gmail.com', '2026-04-01', 'pending', null, 1),
      ('Sphinx Labs', 'Founding Sales', 'Brian', 'brian@kellyvalley.com', '2026-04-01', 'interview_scheduled', '2026-04-01', 0),
      ('Sphinx Labs', 'Founding Sales', 'Jacob', 'jacobbratton288@gmail.com', '2026-04-01', 'interview_scheduled', '2026-04-01', 0),
      ('Soff AI', 'Founding AI PM', 'Alex', 'anything@atandy.com', '2026-04-01', 'no_response', null, 0),
      ('Bluejay', 'Founding GTM', 'Ryen', 'ryen.flint@gmail.com', '2026-04-01', 'interview_scheduled', '2026-04-01', 0),
      ('MangoDesk', 'Founding Engineer', 'Chloe', 'cac499@cornell.edu', '2026-04-01', 'no_response', null, 0),
      ('MangoDesk', 'Founding Engineer', 'Arun', 'arunap37@gmail.com', '2026-04-01', 'no_response', null, 0),
      -- 3-31
      ('Sphinx Labs', 'Backend MTS', 'Smati', 'stungkit@gmail.com', '2026-03-31', 'pending', null, 1),
      ('Besty AI', 'Founding Engineer', 'Arun', 'arunap37@gmail.com', '2026-03-31', 'no_response', null, 0),
      ('Besty AI', 'Founding Engineer', 'Rishikesh', 'ryadav@caldwell.edu', '2026-03-31', 'no_response', null, 0),
      ('Dots', 'Founding Growth Lead', 'Lexie', 'aokier@gmail.com', '2026-03-31', 'interview_scheduled', '2026-04-09', 1),
      ('Dots', 'Founding Growth Lead', 'Aaron', 'aarontian2@gmail.com', '2026-03-31', 'interview_scheduled', '2026-04-03', 0),
      ('Dots', 'Enterprise Account Executive', 'Jacob', 'jacobbratton288@gmail.com', '2026-03-31', 'interview_scheduled', '2026-04-01', 0),
      ('Dots', 'Enterprise Account Executive', 'Randi', 'randi.levine@gmail.com', '2026-03-31', 'pending', null, 1),
      ('Sphinx Labs', 'GTM', 'Mckenzie', 'MCKENZIEBAYLIS@gmail.com', '2026-03-31', 'interview_scheduled', '2026-04-08', 1),
      ('Bluejay', 'Founding GTM', 'Jacob', 'jacobemccormick@gmail.com', '2026-03-31', 'interview_scheduled', '2026-04-08', 1),
      ('TriFetch', 'Founding Sales', 'Wyatt', 'wyatthsmith@icloud.com', '2026-03-31', 'interview_scheduled', '2026-04-08', 1),
      ('Innate Inc.', 'Robotics Research Engineer', 'Shangheethan', 'shangheethan@gmail.com', '2026-03-31', 'replied', '2026-04-08', 1),
      ('Alinea Invest', 'Founding AI engineer', 'Arun', 'arunap37@gmail.com', '2026-03-31', 'no_response', null, 0),
      ('TriFetch', 'Founding Sales', 'Trent', 'lowe.trent@gmail.com', '2026-03-31', 'replied', '2026-04-02', 0),
      ('Gigi', 'Founding Product Designer', 'Sandra', 'sandrasychang@gmail.com', '2026-03-31', 'interview_scheduled', '2026-03-31', 0),
      ('Cardinal AI', 'Founding Sales', 'Jacob', 'jacobbratton288@gmail.com', '2026-03-31', 'no_response', null, 0),
      ('Cardinal AI', 'Founding Engineer', 'Jonathan', 'jonathan.wang5600@gmail.com', '2026-03-31', 'interview_scheduled', '2026-04-01', 0),
      ('Trellis AI', 'Customer Success Manager', 'Varun', 'varunsrinivasan2@gmail.com', '2026-03-31', 'pending', null, 1),
      ('Optifye', 'Founding Backend Engineer', 'Vaibhav', 'vabs.m.here@gmail.com', '2026-03-31', 'replied', '2026-03-31', 0),
      ('Uncountable', 'Full-Stack Engineer', 'Sophia', 'sophialing7b@gmail.com', '2026-03-31', 'no_response', null, 0),
      ('ClarityCare', 'Backend Engineer', 'Reet', 'reetnandy@gmail.com', '2026-03-31', 'no_response', null, 0),
      ('Soff AI', 'Founding AI PM', 'Daniel', 'danielfergy@gmail.com', '2026-03-31', 'replied', '2026-04-01', 0),
      ('Alinea Invest', 'Software Engineer, Reliability & Platform', 'Aamani', 'nadendlaamanichowdary06@gmail.com', '2026-03-31', 'no_response', null, 0),
      ('Sphinx Labs', 'GTM', 'Maxwell', 'mjsherwood3@gmail.com', '2026-03-31', 'replied', '2026-03-31', 0),
      ('Cardinal AI', 'Founding Engineer', 'Chloe', 'cac499@cornell.edu', '2026-03-31', 'replied', '2026-04-06', 0),
      -- 3-30
      ('Dynamo AI', 'Federal Account Executive', 'Timothy', 'TIMBUDZIK@hotmail.com', '2026-03-30', 'no_response', null, 0),
      ('Auctor', 'Software Engineer', 'Alison', 'alisonqiu4@gmail.com', '2026-03-30', 'replied', '2026-03-31', 0),
      ('Auctor', 'Software Engineer', 'James', 'jameshagerty980@gmail.com', '2026-03-30', 'no_response', null, 0),
      ('Auctor', 'Software Engineer', 'Ryan', 'ryan.tran7312@gmail.com', '2026-03-30', 'replied', '2026-03-30', 0),
      ('Auctor', 'Founding Account Executive', 'Daniel', 'dkramerdan@gmail.com', '2026-03-30', 'replied', '2026-04-14', 0),
      ('Auctor', 'Software Engineer', 'Aditya', 'amalladi125@gmail.com', '2026-03-30', 'replied', '2026-03-31', 0),
      ('TriFetch', 'Founding Sales', 'Tyler', 'tyler.allie2@gmail.com', '2026-03-30', 'no_response', null, 0),
      -- 3-29
      ('Cardinal AI', 'Founding Sales', 'Jordan', 'jordanlim@gmail.com', '2026-03-29', 'no_response', null, 0),
      ('Cardinal AI', 'Founding Sales', 'Chantal', 'naugle.chantal@gmail.com', '2026-03-29', 'no_response', null, 0),
      ('Wispr AI', 'LATAM iOS Engineer', 'David', 'david.edg.munoz@gmail.com', '2026-03-29', 'no_response', null, 0),
      ('Wispr AI', 'LATAM iOS Engineer', 'Bruno', 'bruno.a.delgado@gmail.com', '2026-03-29', 'replied', '2026-04-01', 0),
      ('Wispr AI', 'LATAM iOS Engineer', 'Cesar', 'cesar.giupponi@gmail.com', '2026-03-29', 'no_response', null, 0),
      ('Wispr AI', 'LATAM iOS Engineer', 'Ramon', 'oramonhonorio@gmail.com', '2026-03-29', 'replied', '2026-04-01', 0)
    ) as t(client_name, role_title, candidate_name, candidate_email, intro_date, status, reply_date, fu_round)
  loop
    -- 1) find or create client
    select id into v_client_id from clients where name = v_record.client_name;
    if v_client_id is null then
      insert into clients (name, status, ats) values (v_record.client_name, 'active', 'Contrario') returning id into v_client_id;
    end if;

    -- 2) find or create role (matching by client + title, ignoring archived)
    select id into v_role_id from roles where client_id = v_client_id and title = v_record.role_title and archived = false limit 1;
    if v_role_id is null then
      v_role_type := _infer_role_type(v_record.role_title);
      insert into roles (client_id, title, type, status) values (v_client_id, v_record.role_title, v_role_type, 'live') returning id into v_role_id;
    end if;

    -- 3) compute timestamps
    v_intro_at := (v_record.intro_date::text || ' 12:00:00')::timestamptz;
    v_reply_at := case when v_record.reply_date is not null then (v_record.reply_date::text || ' 12:00:00')::timestamptz else null end;
    v_last_fu_at := case when v_record.fu_round > 0 then v_intro_at + interval '4 days' else null end;
    v_next_fu_at := case
      when v_record.status = 'pending' and v_record.fu_round = 0 then v_intro_at + interval '3 days'
      when v_record.status = 'pending' and v_record.fu_round = 1 then v_intro_at + interval '6 days'
      when v_record.status = 'pending' and v_record.fu_round = 2 then v_intro_at + interval '9 days'
      else null
    end;

    -- 4) insert candidate
    insert into candidates (
      role_id, name, email, intro_sent_at, intro_sent_by,
      response_status, response_date, followup_round, last_followup_at, next_followup_due
    ) values (
      v_role_id, v_record.candidate_name, v_record.candidate_email, v_intro_at, 'team@contrario.ai',
      v_record.status, v_reply_at, v_record.fu_round, v_last_fu_at, v_next_fu_at
    );
  end loop;
end $$;

drop function if exists _infer_role_type(text);

commit;

-- ── Verify ──────────────────────────────────────────
-- Run this after to confirm:
-- select count(*) as candidates,
--        count(*) filter (where response_status = 'pending') as pending,
--        count(*) filter (where response_status = 'replied') as replied,
--        count(*) filter (where response_status = 'interview_scheduled') as interviews,
--        count(*) filter (where response_status = 'no_response') as no_response,
--        count(*) filter (where followup_round > 0) as fu_sent
-- from candidates;

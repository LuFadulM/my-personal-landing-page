-- Slack Tags Tracker — shared ops task tracker between Lucía and Will
-- Run this in the Supabase SQL editor ONCE, then run seed-slack-tags.sql for initial data.

create table if not exists slack_tags (
  id serial primary key,
  day date not null,
  from_person text not null,
  channel text not null,
  description text not null,
  done boolean default false,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Touch updated_at on any update
create or replace function _slack_tags_touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_slack_tags_updated_at on slack_tags;
create trigger trg_slack_tags_updated_at before update on slack_tags
  for each row execute function _slack_tags_touch_updated_at();

-- Helpful indexes
create index if not exists idx_slack_tags_day on slack_tags(day desc);
create index if not exists idx_slack_tags_done on slack_tags(done);
create index if not exists idx_slack_tags_from on slack_tags(from_person);

-- RLS (permissive anon — personal tool, tighten later with auth)
alter table slack_tags enable row level security;
drop policy if exists "allow_anon_all" on slack_tags;
create policy "allow_anon_all" on slack_tags for all to anon using (true) with check (true);

-- Enable realtime for this table (so Will + Lucía see each other's updates live)
-- NOTE: you may also need to enable "Realtime" toggle for this table in the Supabase dashboard
-- (Project > Database > Replication > supabase_realtime > slack_tags)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'slack_tags'
  ) then
    alter publication supabase_realtime add table slack_tags;
  end if;
end $$;

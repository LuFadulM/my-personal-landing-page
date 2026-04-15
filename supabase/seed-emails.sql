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

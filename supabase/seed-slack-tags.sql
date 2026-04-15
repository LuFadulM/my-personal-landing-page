-- Seed data for slack_tags (43 tasks from Apr 10-15, 2026)
-- Run AFTER schema-slack-tags.sql. Idempotent: truncates first.

begin;

truncate slack_tags restart identity;

insert into slack_tags (day, from_person, channel, description, done) values
-- Friday Apr 10, 2026
('2026-04-10', 'Arya', '#crustdata-contrario', 'Archive Crustdata Founding Growth role (hire made). Don''t reject pipeline candidates.', true),
('2026-04-10', 'Will', '#operations', 'Reach out to Scott Lai for Jam Pack Founding Engineer, set up intro emails.', true),
('2026-04-10', 'Will', '#operations', 'Archive Sieve Operations Assistant role.', true),
('2026-04-10', 'Will', '#trellis-contrario', 'Remove candidate from Trellis pipeline.', true),
('2026-04-10', 'Tae', '#jordanparker-recruiter', 'Send Diego the Porter cal.com booking link for first chat.', true),
('2026-04-10', 'Arya', '#galenai-contrario', 'Close out Galen AI account (M&A, joining larger company).', true),
('2026-04-10', 'Will', '#operations', 'Pause Head of Finance Ops at Betsy AI (team needs to review backlog).', true),
('2026-04-10', 'Will', '#operations', 'Set up Eragon Member of Technical Staff — 17.5% bounty, $250-450K base + equity, SF, Ashby import, high priority. Ideal companies: DeepMind, OpenAI, Anthropic.', true),
('2026-04-10', 'Will', '#wildcard-contrario', 'Fix Wildcard Founding Engineer JD to match LATAM quality + remove flagged background line.', true),
('2026-04-10', 'Will', '#operations', 'Set up 2 CollectWise roles: AI Agent Engineer (15.5%) + Founding AE (15%). Archive paused role, add new seat.', true),
('2026-04-10', 'Will', 'DM', 'Pause AI Engineer role (unnamed client).', true),
('2026-04-10', 'Will', 'DM', 'Send intro emails for recent Gigi CTO candidates (email integration was temporarily off).', true),
-- Saturday Apr 11, 2026
('2026-04-11', 'Rezi', '#jampack-contrario', 'Received Jam Pack booking link from Rezi — confirmed OK.', true),
('2026-04-11', 'Will', '#strala-contrario', 'Add Strala talent memo to internal JDs for recruiter calibration.', true),
-- Sunday Apr 13, 2026
('2026-04-13', 'Will', '#operations', 'Add detail to Kobalt Labs Founding Full-Stack Engineer JD — 2 products (vendor risk + marketing compliance), bump headcount to 3. Fathom video linked.', true),
('2026-04-13', 'Will', '#ericxiang-recruiter', 'Check in on cancelled Eric Xiang recruiter interview — resolved, founder wants to rebook.', true),
('2026-04-13', 'Will', '#bespokelabs-contrario', 'Add info from Neema to Bespoke Labs DevOps JD (higher talent bar suggestions).', true),
('2026-04-13', 'Will', '#operations', 'Adjust Aravalli role: YoE to 2-6, add finance/credit analyst background as requirement/green flag. Fathom video linked.', true),
('2026-04-13', 'Michael', '#operations', 'Add outreach templates to Conversion AI GTM Engineer, double-check setup. Ashby integrated.', true),
('2026-04-13', 'Tae', '#operations', 'Split Mason Founding Engineer into Infrastructure + Product (2x headcount each, 16.5% bounty). JD PDFs provided.', true),
('2026-04-13', 'Will', '#operations', 'Set up 2 Vera Health roles: Partnerships Lead ($120-170K, 16.5%) + Product Engineer ($145-225K, 17.5%). Ashby-integrated.', true),
('2026-04-13', 'Will', '#operations', 'Fix Slash SDR interview stage labels — Will noticed some still missing.', false),
-- Tuesday Apr 14, 2026
('2026-04-14', 'Michael', '#operations', 'Fix stage labeling on roles missing onsites/first rounds — Google Sheet provided with checklist.', true),
('2026-04-14', 'Michael', '#operations', 'Archive Dots Enterprise AE role — all hires made (Matt + Jared).', true),
('2026-04-14', 'Will', '#operations', 'Set up 2 Judgment Labs roles: Senior Backend Engineer (2x HC, 15.1%, cross-submit Cloud Infra + Data Infra) + Research Engineer (2x HC, 15.1%, cross-submit Product Eng). Paraform links provided.', false),
('2026-04-14', 'Will', 'DM', '3 new AQ roles from HM (TOP PRIORITY): Update existing Research Scientist to Frontier Data + create Research Scientist Evals/RL (1-2 HC each) + RL Environment Engineer (5 HC). Google Doc JDs linked.', false),
('2026-04-14', 'Will', 'DM', 'New daily ops process: when reviewing tagged emails, also update candidate pipeline stages in Ashby.', false),
('2026-04-14', 'Will', 'DM', 'Update bounties: SWE roles to 16.5%, Research roles to 15.5%. Fix any roles incorrectly marked as ''exclusive''.', false),
('2026-04-14', 'Will', '#ergo-contrario', 'Double-check Ergo role has ''no sponsorship'' noted correctly.', false),
('2026-04-14', 'Will', '#listenlabs-contrario', 'Add client changes to Listen Labs JDs — expanded profile universe for Growth Lead (open to B2C backgrounds, younger candidates, good school/company).', false),
('2026-04-14', 'Will', '#sphinx-contrario', 'Check if intro email was sent for reapproved candidate at Sphinx.', false),
('2026-04-14', 'Audrey', '#amari-contrario', 'Schedule first-round interviews for 3 Amari candidates (3 separate thread requests from Audrey).', false),
('2026-04-14', 'Will', 'DM', 'Ask Steve Ganesh what happened with candidate submitted for multiple roles.', false),
('2026-04-14', 'Dan S.', 'DM (danrivercity)', 'Follow up on second-round interview status for Augustin Wolff at Listen Labs.', false),
-- Wednesday Apr 15, 2026
('2026-04-15', 'Arya', '#alineainvest-contrario', 'Fix Alinea intro email + attachment on full stack role — ASAP.', true),
('2026-04-15', 'Will', 'DM', 'Approved: reject old Closure candidates from last year/early this year.', true),
('2026-04-15', 'Will', 'DM', 'Confirmed: still sharing JDs with Caroline for review.', true),
('2026-04-15', 'Michael', '#masonai-contrario', 'Update Mason JDs with new calibration info from Alexander Wu.', false),
('2026-04-15', 'Will', '#shenlim-recruiter', 'Check Swathi for Closure. Context: Liquid paused Product Designer, parted ways with Delve (company practices), going all-in on Known Product Engineer Mobile.', false),
('2026-04-15', 'Will', '#tompughjones-recruiter', 'Ping Tom Pugh-Jones. Will checking in with Kartikeye Friday.', false),
('2026-04-15', 'Will', '#afterquery-contrario', 'Add ideal companies to AQ RL Environment Engineer: Thinking Machines (OK per HM, just don''t poach researchers), Hud, Metis, Bespoke Labs.', false),
('2026-04-15', 'Tae', '#conversion-contrario', 'Add calibration profiles (LinkedIn refs from Vasav) to Conversion Founding GTM Engineer. Note: Contrario-approved candidates skip screening and go straight to behavioral interview.', false),
('2026-04-15', 'Will', '#operations', 'Add default stage for Judgment Labs — Aditya flagged it''s missing.', false);

commit;

-- Verify:
-- select count(*) from slack_tags;  -- expect 43
-- select day, count(*) filter (where done) as done, count(*) filter (where not done) as open, count(*) as total from slack_tags group by day order by day desc;

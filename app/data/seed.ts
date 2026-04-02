import { Client, Candidate, CandidateStage, FollowUp, HealthStatus } from './types';

// ── Helper ──────────────────────────────────────────────
let _id = 0;
const uid = () => `id-${++_id}`;
const daysAgo = (d: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  return dt.toISOString().split('T')[0];
};

type RoleSeed = {
  title: string;
  health: HealthStatus;
  pending: number;
  total: number;
  recruiters: string[];
  lastDays: number;
  notes?: string;
};

function buildClient(
  name: string,
  channel: string,
  roles: RoleSeed[]
): Client {
  const clientId = uid();
  return {
    id: clientId,
    name,
    channel,
    roles: roles.map((r) => ({
      id: uid(),
      clientId,
      title: r.title,
      health: r.health,
      pendingReview: r.pending,
      totalCandidates: r.total,
      activeRecruiters: r.recruiters,
      lastResponseDate: daysAgo(r.lastDays),
      lastResponseDaysAgo: r.lastDays,
      notes: r.notes || '',
    })),
  };
}

// ── 60 Clients · 113 Roles ──────────────────────────────
// Health targets: 53 Healthy, 17 Needs Attention, 31 At Risk, 12 New Role = 113
export const clients: Client[] = [
  buildClient('AfterQuery', '#afterquery-contrario', [
    { title: 'LATAM Software Engineer', health: 'Healthy', pending: 1, total: 12, recruiters: ['Sarah Von Hapsburg'], lastDays: 2 },
    { title: 'Research Scientist', health: 'Healthy', pending: 0, total: 8, recruiters: ['Neeraj Joshi'], lastDays: 1 },
    { title: 'Member of Talent Staff', health: 'Needs Attention', pending: 3, total: 6, recruiters: ['Jenny L'], lastDays: 7 },
    { title: 'Senior Software Engineer', health: 'Healthy', pending: 0, total: 14, recruiters: ['Eric Xiang'], lastDays: 1 },
    { title: 'Technical Strategic Projects Lead', health: 'Healthy', pending: 1, total: 5, recruiters: ['Sunil Shintre'], lastDays: 0 },
    { title: 'Strategic Projects Lead', health: 'Healthy', pending: 1, total: 4, recruiters: ['Dimitar Angelov'], lastDays: 0 },
  ]),
  buildClient('Amari AI', '#amari-contrario', [
    { title: 'Backend AI Engineer', health: 'Healthy', pending: 0, total: 9, recruiters: ['Steve Ganesh'], lastDays: 3 },
  ]),
  buildClient('hud', '#hud-contrario', [
    { title: 'Founding Engineer (Full Stack)', health: 'Needs Attention', pending: 7, total: 18, recruiters: ['Oliver Wheeler', 'Eric Xiang'], lastDays: 10, notes: '7 pending reviews — needs immediate attention' },
    { title: 'Product Designer', health: 'Healthy', pending: 0, total: 5, recruiters: ['Jenny L'], lastDays: 2 },
  ]),
  buildClient('Dodo Inc.', '#dodo-contrario', [
    { title: 'Senior Backend Engineer', health: 'At Risk', pending: 2, total: 7, recruiters: ['Neeraj Joshi'], lastDays: 14 },
    { title: 'iOS Engineer', health: 'At Risk', pending: 1, total: 4, recruiters: ['Jigar'], lastDays: 18 },
  ]),
  buildClient('Weave (YC)', '#weave-contrario', [
    { title: 'Full-Stack Engineer', health: 'Healthy', pending: 0, total: 11, recruiters: ['Sarah Von Hapsburg'], lastDays: 1 },
    { title: 'ML Engineer', health: 'New Role', pending: 2, total: 2, recruiters: ['Eric Xiang'], lastDays: 0 },
  ]),
  buildClient('Besty AI', '#bestyai-contrario', [
    { title: 'Head of Finance & Operations', health: 'Needs Attention', pending: 2, total: 6, recruiters: ['Wil Sinclair', 'Neema Jamshidian'], lastDays: 5 },
  ]),
  buildClient('Sphinx Labs', '#sphinx-contrario', [
    { title: 'Member of Technical Staff', health: 'Healthy', pending: 0, total: 10, recruiters: ['Steve Ganesh'], lastDays: 1 },
    { title: 'Research Engineer', health: 'At Risk', pending: 3, total: 5, recruiters: ['Neeraj Joshi'], lastDays: 21 },
  ]),
  buildClient('Soff (YC)', '#soff-contrario', [
    { title: 'Founding AI Product Manager', health: 'At Risk', pending: 6, total: 14, recruiters: ['Dimitar Angelov', 'Jenny L'], lastDays: 12, notes: 'Backlogged — 6 pending' },
    { title: 'Backend Engineer', health: 'At Risk', pending: 2, total: 8, recruiters: ['Oliver Wheeler'], lastDays: 15 },
  ]),
  buildClient('Bluejay', '#bluejay-contrario', [
    { title: 'Software Engineer (US Citizen/PR preferred)', health: 'Healthy', pending: 0, total: 7, recruiters: ['Jigar'], lastDays: 2 },
    { title: 'Founding GTM', health: 'At Risk', pending: 2, total: 3, recruiters: ['Mike Germano'], lastDays: 20 },
    { title: 'Senior Founding Engineer', health: 'Healthy', pending: 1, total: 9, recruiters: ['Eric Xiang'], lastDays: 1 },
  ]),
  buildClient('Crustdata (YC)', '#crustdata-contrario', [
    { title: 'Full-Stack Engineer', health: 'New Role', pending: 3, total: 3, recruiters: ['Sunil Shintre'], lastDays: 0 },
    { title: 'Data Engineer', health: 'New Role', pending: 1, total: 1, recruiters: ['Neeraj Joshi'], lastDays: 0 },
  ]),
  buildClient('Gigi', '#gigi-contrario', [
    { title: 'Founding CTO', health: 'Healthy', pending: 0, total: 6, recruiters: ['Steve Ganesh'], lastDays: 3 },
    { title: 'Founding Product Designer', health: 'Healthy', pending: 0, total: 4, recruiters: ['Jenny L'], lastDays: 4 },
  ]),
  buildClient('Alinea Invest', '#alinea-contrario', [
    { title: 'Founding AI Engineer', health: 'At Risk', pending: 1, total: 5, recruiters: ['Eric Xiang'], lastDays: 25 },
  ]),
  buildClient('foam', '#foam-contrario', [
    { title: 'Founding Engineer', health: 'Healthy', pending: 1, total: 8, recruiters: ['Sunil Shintre'], lastDays: 1 },
  ]),
  buildClient('Dots', '#dots-contrario', [
    { title: 'Enterprise Account Executive', health: 'Healthy', pending: 1, total: 7, recruiters: ['Mike Germano'], lastDays: 2 },
  ]),
  buildClient('Mem0', '#mem0-contrario', [
    { title: 'Senior Backend Engineer', health: 'Healthy', pending: 0, total: 11, recruiters: ['Oliver Wheeler'], lastDays: 1 },
    { title: 'DevRel', health: 'Needs Attention', pending: 2, total: 4, recruiters: ['Dimitar Angelov'], lastDays: 9 },
  ]),
  buildClient('Liquid', '#liquid-contrario', [
    { title: 'Founding Engineer', health: 'At Risk', pending: 1, total: 3, recruiters: ['Jigar'], lastDays: 30 },
  ]),
  buildClient('Bond Studio AI', '#bondstudio-contrario', [
    { title: 'Full-Stack Engineer', health: 'Healthy', pending: 0, total: 6, recruiters: ['Sarah Von Hapsburg'], lastDays: 2 },
  ]),
  buildClient('Sieve', '#sieve-contrario', [
    { title: 'Product & Ops', health: 'Healthy', pending: 0, total: 5, recruiters: ['Jenny L'], lastDays: 3 },
  ]),
  buildClient('Cardinal', '#cardinal-contrario', [
    { title: 'Founding Engineer', health: 'At Risk', pending: 6, total: 15, recruiters: ['Eric Xiang', 'Neeraj Joshi'], lastDays: 11, notes: 'Backlogged — 6 pending' },
    { title: 'Founding Sales', health: 'At Risk', pending: 2, total: 6, recruiters: ['Mike Germano'], lastDays: 14 },
    { title: 'Engineering Manager', health: 'Healthy', pending: 0, total: 4, recruiters: ['Steve Ganesh'], lastDays: 5 },
  ]),
  buildClient('AthenaHQ', '#athenahq-contrario', [
    { title: 'Senior ML Engineer', health: 'Healthy', pending: 0, total: 8, recruiters: ['Oliver Wheeler'], lastDays: 1 },
  ]),
  buildClient('VRChat', '#vrchat-contrario', [
    { title: 'Engineer II - Recommendations', health: 'Needs Attention', pending: 1, total: 6, recruiters: ['Jigar'], lastDays: 8 },
  ]),
  buildClient('TriFetch', '#trifetch-contrario', [
    { title: 'Founding Sales', health: 'New Role', pending: 6, total: 8, recruiters: ['Dimitar Angelov', 'Mike Germano'], lastDays: 1, notes: 'New role — 6 pending reviews' },
  ]),
  buildClient('Quander', '#quander-contrario', [
    { title: 'Senior Full-Stack Engineer', health: 'Healthy', pending: 0, total: 7, recruiters: ['Sunil Shintre'], lastDays: 2 },
  ]),
  buildClient('Strala', '#strala-contrario', [
    { title: 'Growth Role', health: 'At Risk', pending: 1, total: 3, recruiters: ['Dimitar Angelov'], lastDays: 22 },
  ]),
  buildClient('Listen Labs', '#listenlabs-contrario', [
    { title: 'Growth Lead', health: 'Healthy', pending: 1, total: 5, recruiters: ['Mike Germano'], lastDays: 0 },
  ]),
  buildClient('Auctor (YC X25)', '#auctor-contrario', [
    { title: 'Founding Backend Engineer', health: 'New Role', pending: 2, total: 2, recruiters: ['Eric Xiang'], lastDays: 0 },
    { title: 'Founding Frontend Engineer', health: 'New Role', pending: 1, total: 1, recruiters: ['Sarah Von Hapsburg'], lastDays: 0 },
  ]),
  buildClient('Invention Counsel', '#inventioncounsel-contrario', [
    { title: 'LATAM Full-Stack Engineer', health: 'Healthy', pending: 1, total: 9, recruiters: ['Sarah Von Hapsburg'], lastDays: 1 },
  ]),
  buildClient('Wispr AI', '#wispr-contrario', [
    { title: 'iOS Engineer', health: 'Healthy', pending: 0, total: 10, recruiters: ['Jigar'], lastDays: 1 },
    { title: 'ML Research Scientist', health: 'Healthy', pending: 0, total: 7, recruiters: ['Oliver Wheeler'], lastDays: 2 },
  ]),
  buildClient('Optifye', '#optifye-contrario', [
    { title: 'Senior Backend Engineer', health: 'At Risk', pending: 2, total: 4, recruiters: ['Neeraj Joshi'], lastDays: 19 },
  ]),
  buildClient('Verita AI', '#veritaai-contrario', [
    { title: 'SPL Role', health: 'Healthy', pending: 0, total: 5, recruiters: ['Steve Ganesh'], lastDays: 3 },
    { title: 'Growth Associate', health: 'Needs Attention', pending: 2, total: 4, recruiters: ['Dimitar Angelov'], lastDays: 8 },
  ]),
  buildClient('Slash (YC)', '#slash-contrario', [
    { title: 'SDR', health: 'At Risk', pending: 5, total: 10, recruiters: ['Mike Germano', 'Dimitar Angelov'], lastDays: 13, notes: 'Backlogged — 5 pending' },
    { title: 'Full-Stack Engineer', health: 'Healthy', pending: 0, total: 6, recruiters: ['Eric Xiang'], lastDays: 2 },
  ]),
  buildClient('Uncountable', '#uncountable-contrario', [
    { title: 'Backend Engineer', health: 'Healthy', pending: 0, total: 8, recruiters: ['Oliver Wheeler'], lastDays: 1 },
  ]),
  buildClient('Known', '#known-contrario', [
    { title: 'Senior Product Designer', health: 'At Risk', pending: 1, total: 3, recruiters: ['Jenny L'], lastDays: 28 },
  ]),
  buildClient('Trellis AI', '#trellis-contrario', [
    { title: 'Open Role', health: 'Healthy', pending: 0, total: 4, recruiters: ['Sunil Shintre'], lastDays: 3 },
  ]),
  buildClient('CollectWise', '#collectwise-contrario', [
    { title: 'Founding Engineer', health: 'At Risk', pending: 1, total: 2, recruiters: ['Eric Xiang'], lastDays: 35 },
  ]),
  buildClient('e3 group', '#e3group-contrario', [
    { title: 'Data Analyst', health: 'Needs Attention', pending: 3, total: 7, recruiters: ['Neeraj Joshi'], lastDays: 7 },
  ]),
  buildClient('Bespoke Labs', '#bespokelabs-contrario', [
    { title: 'Senior DevOps Engineer', health: 'Healthy', pending: 3, total: 12, recruiters: ['Neeraj Joshi', 'Jenny L'], lastDays: 1 },
    { title: 'ML Platform Engineer', health: 'Healthy', pending: 0, total: 6, recruiters: ['Oliver Wheeler'], lastDays: 2 },
    { title: 'Frontend Engineer', health: 'At Risk', pending: 1, total: 3, recruiters: ['Sarah Von Hapsburg'], lastDays: 16 },
  ]),
  buildClient('Colonist', '#colonist-contrario', [
    { title: 'Full-Stack Product Developer', health: 'Healthy', pending: 4, total: 15, recruiters: ['Sarah Von Hapsburg', 'Sunil Shintre'], lastDays: 0 },
    { title: 'Game Designer', health: 'At Risk', pending: 0, total: 2, recruiters: ['Jenny L'], lastDays: 30 },
  ]),
  buildClient('Composio', '#composio-contrario', [
    { title: 'Enterprise Platform Engineer', health: 'Healthy', pending: 1, total: 9, recruiters: ['Eric Xiang'], lastDays: 0 },
    { title: 'Open Role (5-day work week)', health: 'Needs Attention', pending: 2, total: 5, recruiters: ['Neeraj Joshi'], lastDays: 6 },
  ]),
  buildClient('ClarityCare AI', '#claritycare-contrario', [
    { title: 'Backend Engineer', health: 'Healthy', pending: 1, total: 7, recruiters: ['Oliver Wheeler'], lastDays: 1 },
  ]),
  buildClient('Kobalt Labs', '#kobaltlabs-contrario', [
    { title: 'Account Executive', health: 'Healthy', pending: 1, total: 5, recruiters: ['Mike Germano'], lastDays: 2 },
    { title: 'Full Stack Software Engineer', health: 'At Risk', pending: 0, total: 2, recruiters: ['Eric Xiang'], lastDays: 25 },
  ]),
  buildClient('Warp', '#warp-contrario', [
    { title: 'Senior Frontend Engineer', health: 'Healthy', pending: 0, total: 13, recruiters: ['Sarah Von Hapsburg', 'Jigar'], lastDays: 1 },
  ]),
  buildClient('Avoca', '#avoca-contrario', [
    { title: 'Full-Stack Engineer', health: 'Needs Attention', pending: 3, total: 8, recruiters: ['Sunil Shintre'], lastDays: 7 },
  ]),
  buildClient('Unsiloed AI', '#unsiloed-contrario', [
    { title: 'Founding Backend Engineer', health: 'Healthy', pending: 1, total: 6, recruiters: ['Eric Xiang'], lastDays: 1 },
  ]),
  buildClient('Maximor AI', '#maximor-contrario', [
    { title: 'ML Engineer', health: 'New Role', pending: 2, total: 2, recruiters: ['Oliver Wheeler'], lastDays: 0 },
  ]),
  buildClient('Mixed Nuts Inc', '#mixednuts-contrario', [
    { title: 'Buyer - Inventory & Import Specialist', health: 'At Risk', pending: 0, total: 3, recruiters: ['Dimitar Angelov'], lastDays: 20 },
  ]),
  buildClient('Closure', '#closure-contrario', [
    { title: 'Senior Backend Engineer', health: 'Healthy', pending: 0, total: 7, recruiters: ['Neeraj Joshi'], lastDays: 2 },
  ]),
  buildClient('Porter', '#porter-contrario', [
    { title: 'Open Role 1', health: 'Needs Attention', pending: 2, total: 5, recruiters: ['Steve Ganesh'], lastDays: 9 },
    { title: 'Open Role 2', health: 'At Risk', pending: 1, total: 2, recruiters: ['Jenny L'], lastDays: 22 },
  ]),
  buildClient('Uniqus Consultech', '#uniqus-contrario', [
    { title: 'Associate Director - Finance Transformation', health: 'At Risk', pending: 9, total: 18, recruiters: ['Wil Sinclair', 'Neema Jamshidian'], lastDays: 30, notes: '9 pending — last response 1 month ago' },
  ]),
  buildClient('Truvo', '#truvo-contrario', [
    { title: 'Founders Associate', health: 'At Risk', pending: 1, total: 3, recruiters: ['Dimitar Angelov'], lastDays: 18 },
  ]),
  buildClient('Dynamo AI', '#dynamoai-contrario', [
    { title: 'Applied ML Engineer', health: 'Healthy', pending: 0, total: 9, recruiters: ['Oliver Wheeler'], lastDays: 1 },
  ]),
  buildClient('Antes', '#antes-contrario', [
    { title: 'Founding Engineer - Applied AI', health: 'Healthy', pending: 1, total: 6, recruiters: ['Steve Ganesh'], lastDays: 2 },
  ]),
  buildClient('Judgment Labs', '#judgmentlabs-contrario', [
    { title: 'Forward Deploy AI Engineer', health: 'Healthy', pending: 0, total: 5, recruiters: ['Eric Xiang'], lastDays: 0 },
  ]),
  buildClient('Chief AI', '#chiefai-contrario', [
    { title: 'Founding Engineer', health: 'At Risk', pending: 0, total: 2, recruiters: ['Sunil Shintre'], lastDays: 40 },
  ]),
  buildClient('Innate Inc.', '#innate-contrario', [
    { title: 'Research Scientist', health: 'Needs Attention', pending: 2, total: 4, recruiters: ['Neeraj Joshi'], lastDays: 10 },
  ]),
  buildClient('Ergo', '#ergo-contrario', [
    { title: 'Founding Full-Stack Engineer', health: 'New Role', pending: 1, total: 1, recruiters: ['Eric Xiang'], lastDays: 0 },
  ]),
  buildClient('Usul', '#usul-contrario', [
    { title: 'Product Engineer', health: 'Needs Attention', pending: 2, total: 5, recruiters: ['Oliver Wheeler'], lastDays: 8 },
  ]),
  buildClient('Qualified Health', '#qualifiedhealth-contrario', [
    { title: 'Senior Full-Stack Engineer', health: 'New Role', pending: 2, total: 2, recruiters: ['Sarah Von Hapsburg'], lastDays: 0 },
  ]),
  buildClient('Simula', '#simula-contrario', [
    { title: 'Open Role 1', health: 'At Risk', pending: 1, total: 3, recruiters: ['Jigar'], lastDays: 15 },
    { title: 'Open Role 2', health: 'Healthy', pending: 0, total: 4, recruiters: ['Steve Ganesh'], lastDays: 4 },
  ]),
  buildClient('Aravalli Capital Management', '#aravalli-contrario', [
    { title: 'Quantitative Analyst', health: 'New Role', pending: 1, total: 1, recruiters: ['Neeraj Joshi'], lastDays: 0 },
    { title: 'Data Engineer', health: 'Needs Attention', pending: 3, total: 5, recruiters: ['Oliver Wheeler'], lastDays: 6 },
  ]),
  // AnswerThis (referenced in candidates)
  buildClient('AnswerThis', '#answerthis-contrario', [
    { title: 'Founding Engineer', health: 'New Role', pending: 1, total: 1, recruiters: ['Steve Ganesh'], lastDays: 0 },
  ]),
];

// ── For-Review Candidates (16) ───────────────────────────
function findRole(clientName: string, roleTitle: string) {
  const c = clients.find((cl) => cl.name === clientName);
  const r = c?.roles.find((ro) => ro.title === roleTitle);
  return { clientId: c?.id || '', roleId: r?.id || '' };
}

type CandSeed = { name: string; clientName: string; roleTitle: string; recruiter: string; stage: CandidateStage; submittedDate: string };

const forReviewRaw: CandSeed[] = [
  { name: 'Margaret Hom', clientName: 'Besty AI', roleTitle: 'Head of Finance & Operations', recruiter: 'Wil Sinclair', stage: 'Pending Approval', submittedDate: daysAgo(3) },
  { name: 'Jaime Andres Aricapa Perez', clientName: 'Invention Counsel', roleTitle: 'LATAM Full-Stack Engineer', recruiter: 'Sarah Von Hapsburg', stage: 'Pending Approval', submittedDate: daysAgo(2) },
  { name: 'Gabriel Barros', clientName: 'Colonist', roleTitle: 'Full-Stack Product Developer', recruiter: 'Sarah Von Hapsburg', stage: 'Pending Approval', submittedDate: daysAgo(1) },
  { name: 'Makrant Iyengar', clientName: 'VRChat', roleTitle: 'Engineer II - Recommendations', recruiter: 'Jigar', stage: 'Pending Approval', submittedDate: daysAgo(4) },
  { name: 'Muhammad Shahrukh Naveed', clientName: 'Bespoke Labs', roleTitle: 'Senior DevOps Engineer', recruiter: 'Jenny L', stage: 'Pending Approval', submittedDate: daysAgo(2) },
  { name: 'Sebastian Cuellar', clientName: 'Dots', roleTitle: 'Enterprise Account Executive', recruiter: 'Mike Germano', stage: 'Pending Approval', submittedDate: daysAgo(1) },
  { name: 'Sebastian Cuellar', clientName: 'Kobalt Labs', roleTitle: 'Account Executive', recruiter: 'Mike Germano', stage: 'Pending Approval', submittedDate: daysAgo(1) },
  { name: 'Daniel Shaby', clientName: 'foam', roleTitle: 'Founding Engineer', recruiter: 'Sunil Shintre', stage: 'Pending Approval', submittedDate: daysAgo(3) },
  { name: 'Suraj Paudel', clientName: 'Bespoke Labs', roleTitle: 'Senior DevOps Engineer', recruiter: 'Neeraj Joshi', stage: 'Pending Approval', submittedDate: daysAgo(5) },
  { name: 'Lacina Kone', clientName: 'Bespoke Labs', roleTitle: 'Senior DevOps Engineer', recruiter: 'Neeraj Joshi', stage: 'Pending Approval', submittedDate: daysAgo(4) },
  { name: 'Lee Moore', clientName: 'TriFetch', roleTitle: 'Founding Sales', recruiter: 'Dimitar Angelov', stage: 'Pending Approval', submittedDate: daysAgo(2) },
  { name: 'Tun Hein', clientName: 'Antes', roleTitle: 'Founding Engineer - Applied AI', recruiter: 'Steve Ganesh', stage: 'Pending Approval', submittedDate: daysAgo(1) },
  { name: 'Tianlin Zhao', clientName: 'Unsiloed AI', roleTitle: 'Founding Backend Engineer', recruiter: 'Eric Xiang', stage: 'Pending Approval', submittedDate: daysAgo(3) },
  { name: 'Rohan Parekh', clientName: 'ClarityCare AI', roleTitle: 'Backend Engineer', recruiter: 'Oliver Wheeler', stage: 'Pending Approval', submittedDate: daysAgo(2) },
  { name: 'James Wei', clientName: 'Besty AI', roleTitle: 'Head of Finance & Operations', recruiter: 'Neema Jamshidian', stage: 'Pending Approval', submittedDate: daysAgo(4) },
  { name: 'Tun Hein', clientName: 'AnswerThis', roleTitle: 'Founding Engineer', recruiter: 'Steve Ganesh', stage: 'Pending Approval', submittedDate: daysAgo(1) },
];

export const forReviewCandidates: Candidate[] = forReviewRaw.map((c) => {
  const ref = findRole(c.clientName, c.roleTitle);
  return {
    id: uid(),
    ...c,
    clientId: ref.clientId,
    roleId: ref.roleId,
    reviewStatus: 'pending' as const,
    lastActivity: c.submittedDate,
    notes: '',
  };
});

// ── Recent Stage Changes (pipeline activity) ─────────────
const pipelineRaw: CandSeed[] = [
  { name: 'Juan Manuel Carpio Báez', clientName: 'Colonist', roleTitle: 'Full-Stack Product Developer', stage: 'Application Review', recruiter: 'Sarah Von Hapsburg', submittedDate: daysAgo(0) },
  { name: 'Kristijan Kelic', clientName: 'Colonist', roleTitle: 'Full-Stack Product Developer', stage: 'Application Review', recruiter: 'Sunil Shintre', submittedDate: daysAgo(0) },
  { name: 'Florencio Varela', clientName: 'Colonist', roleTitle: 'Full-Stack Product Developer', stage: 'Pending Approval', recruiter: 'Sarah Von Hapsburg', submittedDate: daysAgo(1) },
  { name: 'Daniel Lalasa', clientName: 'Colonist', roleTitle: 'Full-Stack Product Developer', stage: 'Application Review', recruiter: 'Sunil Shintre', submittedDate: daysAgo(0) },
  { name: 'Nikoloz Otiashvili', clientName: 'Colonist', roleTitle: 'Full-Stack Product Developer', stage: 'Application Review', recruiter: 'Sarah Von Hapsburg', submittedDate: daysAgo(0) },
  { name: 'Aayush Sharda', clientName: 'Composio', roleTitle: 'Enterprise Platform Engineer', stage: 'Round 2', recruiter: 'Eric Xiang', submittedDate: daysAgo(7) },
  { name: 'Peter T. Walker', clientName: 'Judgment Labs', roleTitle: 'Forward Deploy AI Engineer', stage: 'Founder vibe check', recruiter: 'Eric Xiang', submittedDate: daysAgo(10) },
  { name: 'Sam Swire', clientName: 'AfterQuery', roleTitle: 'Technical Strategic Projects Lead', stage: 'Initial Screen', recruiter: 'Sunil Shintre', submittedDate: daysAgo(2) },
  { name: 'Anthony Vong', clientName: 'AfterQuery', roleTitle: 'Strategic Projects Lead', stage: 'Pending Approval', recruiter: 'Dimitar Angelov', submittedDate: daysAgo(1) },
  { name: 'Nadav S. Soltes', clientName: 'Listen Labs', roleTitle: 'Growth Lead', stage: 'Pending Approval', recruiter: 'Mike Germano', submittedDate: daysAgo(0) },
];

export const pipelineCandidates: Candidate[] = pipelineRaw.map((c) => {
  const ref = findRole(c.clientName, c.roleTitle);
  return {
    id: uid(),
    ...c,
    clientId: ref.clientId,
    roleId: ref.roleId,
    reviewStatus: 'approved' as const,
    lastActivity: c.submittedDate,
    notes: '',
  };
});

// ── All candidates combined ──────────────────────────────
export const allCandidates: Candidate[] = [
  ...forReviewCandidates,
  ...pipelineCandidates,
];

// ── Follow-up items (At Risk + Needs Attention roles) ────
export const followUps: FollowUp[] = clients
  .flatMap((c) =>
    c.roles
      .filter((r) => r.health === 'At Risk' || r.health === 'Needs Attention')
      .map((r) => ({
        id: uid(),
        roleId: r.id,
        clientName: c.name,
        roleTitle: r.title,
        health: r.health,
        pendingCount: r.pendingReview,
        daysSinceResponse: r.lastResponseDaysAgo,
        note: r.notes,
        resolved: false,
      }))
  )
  .sort((a, b) => b.daysSinceResponse - a.daysSinceResponse);

// ── Health summary ───────────────────────────────────────
export function getHealthSummary() {
  const all = clients.flatMap((c) => c.roles);
  return {
    healthy: all.filter((r) => r.health === 'Healthy').length,
    needsAttention: all.filter((r) => r.health === 'Needs Attention').length,
    atRisk: all.filter((r) => r.health === 'At Risk').length,
    newRole: all.filter((r) => r.health === 'New Role').length,
    total: all.length,
  };
}

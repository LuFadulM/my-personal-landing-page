export interface SeedClient {
  id: string;
  name: string;
  channel: string;
}

export interface SeedRole {
  id: string;
  clientId: string;
  title: string;
}

export interface SeedRoleHealth {
  id: string;
  clientName: string;
  roleTitle: string;
  calendarLink: string;
  calendarStatus: 'Active' | 'Broken';
  introEmailStatus: 'Set up' | 'Error' | 'Not set up';
  recruiters: string;
  lastActivity: string;
  notes: string;
}

const rawData = [
  { id: "afterquery", name: "AfterQuery", channel: "#afterquery-contrario", roles: [
    { id: "aq-latam-swe", title: "LATAM Software Engineer", calendarLink: "", introEmailStatus: "active" },
    { id: "aq-research-scientist", title: "Research Scientist", calendarLink: "", introEmailStatus: "active" },
    { id: "aq-member-talent-staff", title: "Member of Talent Staff", calendarLink: "", introEmailStatus: "active" },
    { id: "aq-senior-swe", title: "Senior Software Engineer", calendarLink: "", introEmailStatus: "active" },
    { id: "aq-gtm-lead", title: "GTM Lead", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "gigi", name: "Gigi", channel: "#gigi-contrario-2", roles: [
    { id: "gigi-cto", title: "Founding CTO", calendarLink: "", introEmailStatus: "active" },
    { id: "gigi-product-designer", title: "Founding Product Designer", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "mangodesk", name: "MangoDesk", channel: "#mangodesk-contrario", roles: [
    { id: "mangodesk-role1", title: "Open Role", calendarLink: "https://calendly.com/mangodesk/interview", introEmailStatus: "active" },
  ]},
  { id: "amari", name: "Amari", channel: "#amari-contrario", roles: [
    { id: "amari-backend-ai", title: "Backend AI Engineer", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "judgmentlabs", name: "Judgment Labs", channel: "#judgmentlabs-contrario", roles: [
    { id: "jl-open", title: "Open Role", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "cardinal", name: "Cardinal", channel: "#cardinal-contrario", roles: [
    { id: "cardinal-founding-sales", title: "Founding Sales", calendarLink: "", introEmailStatus: "active" },
    { id: "cardinal-engineering", title: "Engineering", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "trellisai", name: "Trellis AI", channel: "#trellis-contrario", roles: [
    { id: "trellis-open", title: "Open Role", calendarLink: "https://cal.com/jackylin/15-min-meeting-first-chat", introEmailStatus: "active" },
  ]},
  { id: "alineainvest", name: "Alinea Invest", channel: "#alineainvest-contrario", roles: [
    { id: "alinea-founding-ai-eng", title: "Founding AI Engineer", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "simula", name: "Simula", channel: "#simula-contrario", roles: [
    { id: "simula-role1", title: "Open Role 1", calendarLink: "", introEmailStatus: "active" },
    { id: "simula-role2", title: "Open Role 2", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "sphinx", name: "Sphinx", channel: "#sphinx-contrario", roles: [
    { id: "sphinx-member-technical-staff", title: "Member of Technical Staff", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "veritaai", name: "Verita AI", channel: "#veritaai-contrario", roles: [
    { id: "verita-spl", title: "SPL Role", calendarLink: "", introEmailStatus: "active" },
    { id: "verita-growth-associate", title: "Growth Associate", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "bestyai", name: "BestyAI", channel: "#bestyai-contrario", roles: [
    { id: "besty-head-finance-ops", title: "Head of Finance and Operations", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "bespokelabs", name: "Bespoke Labs", channel: "#bespokelabs-contrario", roles: [
    { id: "bespoke-role1", title: "Open Role 1", calendarLink: "", introEmailStatus: "active" },
    { id: "bespoke-role2", title: "Open Role 2", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "mixednuts", name: "MixedNuts", channel: "#mixednuts-contrario", roles: [
    { id: "mixednuts-buyer", title: "Buyer - Inventory and Import Specialist", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "kobaltlabs", name: "Kobalt Labs", channel: "#kobaltlabs-contrario", roles: [
    { id: "kobalt-fullstack", title: "Full Stack Software Engineer", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "bluejay", name: "Bluejay", channel: "#bluejay-contrario", roles: [
    { id: "bluejay-swe", title: "Software Engineer (US Citizen/PR preferred)", calendarLink: "", introEmailStatus: "active" },
    { id: "bluejay-founding-gtm", title: "Founding GTM", calendarLink: "", introEmailStatus: "active" },
    { id: "bluejay-senior-founding-eng", title: "Senior Founding Engineer", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "porter", name: "Porter", channel: "#porter-contrario", roles: [
    { id: "porter-role1", title: "Open Role 1", calendarLink: "", introEmailStatus: "active" },
    { id: "porter-role2", title: "Open Role 2", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "strala", name: "Strala", channel: "#strala-contrario", roles: [
    { id: "strala-growth", title: "Growth Role", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "truvo", name: "Truvo", channel: "#truvo-contrario", roles: [
    { id: "truvo-founders-associate", title: "Founders Associate", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "trifetch", name: "TriFetch", channel: "#trifetch-contrario", roles: [
    { id: "trifetch-founding-sales", title: "Founding Sales", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "composio", name: "Composio", channel: "#composio-contrario", roles: [
    { id: "composio-role1", title: "Open Role 1 (5-day work week required)", calendarLink: "", introEmailStatus: "active" },
    { id: "composio-role2", title: "Open Role 2 (5-day work week required)", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "dots", name: "DOTS", channel: "#dots-contrario", roles: [
    { id: "dots-enterprise-ae", title: "Enterprise Account Executive", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "foam", name: "Foam", channel: "#foam-contrario", roles: [
    { id: "foam-open", title: "Open Role", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "sieve", name: "Sieve", channel: "#sieve-contrario", roles: [
    { id: "sieve-product-ops", title: "Product & Ops", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "clipverse", name: "ClipVerse", channel: "#clipverse-contrario", roles: [
    { id: "clipverse-open", title: "Open Role", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "loyd", name: "Loyd", channel: "#loyd-contrario", roles: [
    { id: "loyd-latam", title: "LATAM Role", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "delve", name: "Delve", channel: "#delve-contrario", roles: [
    { id: "delve-product-marketer", title: "Product Marketer", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "listenlabs", name: "Listen Labs", channel: "#listenlabs-contrario", roles: [
    { id: "listen-growth-ops-lead", title: "Growth Ops Lead", calendarLink: "", introEmailStatus: "active" },
  ]},
  { id: "vrchat", name: "VR Chat", channel: "#vrchat-contrario", roles: [
    { id: "vrchat-recommendations-eng", title: "Recommendations Engineer", calendarLink: "", introEmailStatus: "active" },
  ]},
];

export function seedDataIfNeeded() {
  if (typeof window === 'undefined') return;

  const alreadySeeded = localStorage.getItem('contrario_seeded');
  if (alreadySeeded) return;

  const clients: SeedClient[] = rawData.map((c) => ({
    id: c.id,
    name: c.name,
    channel: c.channel,
  }));

  const roles: SeedRole[] = rawData.flatMap((c) =>
    c.roles.map((r) => ({
      id: r.id,
      clientId: c.id,
      title: r.title,
    }))
  );

  const rolesHealth: SeedRoleHealth[] = rawData.flatMap((c) =>
    c.roles.map((r) => ({
      id: `health-${r.id}`,
      clientName: c.name,
      roleTitle: r.title,
      calendarLink: r.calendarLink,
      calendarStatus: 'Active' as const,
      introEmailStatus: 'Set up' as const,
      recruiters: '',
      lastActivity: '',
      notes: c.channel,
    }))
  );

  localStorage.setItem('contrario_clients', JSON.stringify(clients));
  localStorage.setItem('contrario_roles', JSON.stringify(roles));
  localStorage.setItem('contrario_candidates', JSON.stringify([]));
  localStorage.setItem('contrario_tasks', JSON.stringify([]));
  localStorage.setItem('contrario_roles_health', JSON.stringify(rolesHealth));
  localStorage.setItem('contrario_seeded', 'true');
}

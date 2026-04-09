/**
 * Seed data for the Follow-Up Tracker module.
 *
 * Loaded once on first visit into localStorage under `opsos_followups`.
 * After that, all CRUD happens client-side.
 */

export type FUPCategory =
  | 'urgent'      // URGENT NUDGE - needs action today
  | 'nudge'       // NUDGE - needs action soon
  | 'active'      // active thread (4+ messages)
  | 'fup_sent'    // follow-up has been sent
  | 'in_thread'   // in an ongoing thread
  | 'no_fup'      // no follow-up sent yet
  | 'flagged';    // flagged for pipeline removal

export interface FollowUp {
  id: string;
  name: string;
  role: string;
  company: string;
  dateSent: string;       // ISO date
  threadCount: number;
  hasFollowUp: string;    // Yes / No / NUDGE / URGENT NUDGE
  notes: string;          // raw FUP notes
  category: FUPCategory;  // derived bucket for filtering
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

function categorize(hasFup: string, notes: string, threadCount: number): FUPCategory {
  const h = hasFup.toLowerCase();
  const n = notes.toLowerCase();
  if (h.includes('urgent')) return 'urgent';
  if (h.includes('nudge')) return 'nudge';
  if (n.includes('flagged')) return 'flagged';
  if (n.includes('active') || threadCount >= 4) return 'active';
  if (n.includes('fup sent') || n.includes('apology')) return 'fup_sent';
  if (n.includes('fup in thread')) return 'in_thread';
  if (n.includes('no fup')) return 'no_fup';
  return 'in_thread';
}

function iso(dateStr: string): string {
  return new Date(dateStr).toISOString();
}

interface Raw {
  name: string;
  role: string;
  company: string;
  dateSent: string;
  threadCount: number;
  hasFollowUp: string;
  notes: string;
}

const rows: Raw[] = [
  { name: 'Noah', role: 'Founding Engineer', company: 'Besty AI', dateSent: 'Apr 9, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Gonzalo', role: 'Founding AI/ML Engineer', company: 'Closure (YC)', dateSent: 'Apr 9, 2026', threadCount: 7, hasFollowUp: 'Yes', notes: 'Active thread - 7 messages' },
  { name: 'Christopher', role: 'Founding Engineer', company: 'Chief AI', dateSent: 'Apr 9, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Abraham', role: 'LATAM iOS Product Engineer', company: 'Alinea Invest (YC)', dateSent: 'Apr 9, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'LEXIE', role: 'Founding Growth Lead', company: 'Dots (YC S21)', dateSent: 'Apr 9, 2026', threadCount: 4, hasFollowUp: 'Yes', notes: 'Apr 9 - Checking in FUP sent' },
  { name: 'Alessandro', role: 'LATAM Full Stack Engineer', company: 'Wildcard', dateSent: 'Apr 8, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Xiaodan', role: 'Founding ML Researcher', company: 'Unsiloed AI', dateSent: 'Apr 8, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'YASH', role: 'Full Stack Engineer India', company: 'Maximor AI', dateSent: 'Apr 8, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Audi', role: 'Founding AI PM', company: 'Soff (YC)', dateSent: 'Apr 8, 2026', threadCount: 4, hasFollowUp: 'Yes', notes: 'Active thread - 4 messages' },
  { name: 'MARIANA', role: 'Founders Associate', company: 'Truvo', dateSent: 'Apr 8, 2026', threadCount: 3, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Dhruv', role: 'Software Engineer', company: 'Auctor (YC X25)', dateSent: 'Apr 8, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Yash', role: 'Full-Stack Engineer', company: 'Uncountable', dateSent: 'Apr 8, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Vi', role: 'Full-Stack Engineer', company: 'Uncountable', dateSent: 'Apr 8, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'CHARAN', role: 'Full Stack Engineer India', company: 'Maximor AI', dateSent: 'Apr 8, 2026', threadCount: 5, hasFollowUp: 'Yes', notes: 'Active - Draft pending' },
  { name: 'Pratik', role: 'E3 Technical Interview', company: 'Contrario (YC W25)', dateSent: 'Apr 8, 2026', threadCount: 5, hasFollowUp: 'Yes', notes: 'Active thread - 5 messages' },
  { name: 'Victor', role: 'E3 Technical Interview', company: 'Contrario (YC W25)', dateSent: 'Apr 8, 2026', threadCount: 7, hasFollowUp: 'Yes', notes: 'Active thread - 7 messages' },
  { name: 'Pedro', role: 'E3 Technical Interview', company: 'Contrario (YC W25)', dateSent: 'Apr 8, 2026', threadCount: 7, hasFollowUp: 'Yes', notes: 'Active thread - 7 messages' },
  { name: 'Davi', role: 'LATAM Founding Engineer', company: 'AnswerThis', dateSent: 'Apr 8, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Albert', role: 'Founding Engineer', company: 'AnswerThis', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'NUDGE - No reply', notes: 'Sent 3 days ago - FOLLOW UP NEEDED' },
  { name: 'Sagar', role: 'Senior Frontend Engineer', company: 'Amari AI', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'NUDGE - No reply', notes: 'Sent 3 days ago - FOLLOW UP NEEDED' },
  { name: 'Jacob', role: 'Founding GTM', company: 'Bluejay', dateSent: 'Apr 7, 2026', threadCount: 3, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'WYATT', role: 'Founding Sales', company: 'TriFetch', dateSent: 'Apr 7, 2026', threadCount: 4, hasFollowUp: 'Yes', notes: 'Apr 7 - Correction/apology email sent' },
  { name: 'Brian', role: 'Member of Technical Staff', company: 'Contrario', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Shangheethan', role: 'Robotics Research Engineer', company: 'Innate', dateSent: 'Apr 7, 2026', threadCount: 4, hasFollowUp: 'Yes', notes: 'Active thread - 4 messages' },
  { name: 'Kevin', role: 'Founding ML Researcher', company: 'Unsiloed AI', dateSent: 'Apr 7, 2026', threadCount: 4, hasFollowUp: 'Yes', notes: 'Active - flagged for pipeline removal' },
  { name: 'Randi', role: 'Enterprise Account Executive', company: 'Dots (YC S21)', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'Smati', role: 'Backend MTS', company: 'Sphinx (YC F24)', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'Katie', role: 'Account Executive', company: 'Kobalt Labs', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'McKenzie', role: 'GTM', company: 'Sphinx (YC F24)', dateSent: 'Apr 7, 2026', threadCount: 3, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'SIDDHARTHA', role: 'Sales Development Rep', company: 'Optifye (YC W25)', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'Jose', role: 'REMOTE Founding Engineer', company: 'Contrario', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'TUN', role: 'Backend MTS', company: 'Sphinx (YC F24)', dateSent: 'Apr 7, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Danilo', role: 'LATAM Senior Fullstack Engineer', company: 'Remy AI', dateSent: 'Apr 7, 2026', threadCount: 3, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Arshaan', role: 'Forward Deployed Engineer', company: 'CollectWise (YC F24)', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Hesham', role: 'Founding Sales', company: 'TriFetch', dateSent: 'Apr 7, 2026', threadCount: 3, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'Uyen', role: 'Backend Engineer', company: 'ClarityCare', dateSent: 'Apr 7, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Jose', role: 'REMOTE Frontend Engineer', company: 'Contrario', dateSent: 'Apr 7, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Zaharie', role: 'LATAM Backend Engineer', company: 'Invention Counsel', dateSent: 'Apr 7, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Benjamin', role: 'Forward Deployed Engineer', company: 'Dodo (YC S24)', dateSent: 'Apr 7, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Christopher', role: 'Forward Deployed Engineer', company: 'CollectWise (YC F24)', dateSent: 'Apr 7, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Ava', role: 'Robotics Research Engineer', company: 'Innate', dateSent: 'Apr 7, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Ishtiyak', role: 'Growth Lead', company: 'Ergo', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'TUN', role: 'Backend Engineer', company: 'ClarityCare', dateSent: 'Apr 7, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Richard', role: 'REMOTE Founding Engineer', company: 'Contrario', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'SIMRAN', role: 'Senior Backend Engineer', company: 'Amari AI', dateSent: 'Apr 7, 2026', threadCount: 3, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'Samuel', role: 'Founding Sales', company: 'TriFetch', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'Addison', role: 'Founding Engineer', company: 'Besty AI', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'Chinguun', role: 'Forward Deployed Engineer', company: 'CollectWise (YC F24)', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'Gonzalo', role: 'Senior Founding Engineer', company: 'Bluejay', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Gonzalo', role: 'Founders Associate', company: 'Truvo', dateSent: 'Apr 7, 2026', threadCount: 3, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Felipe', role: 'LATAM Senior Mobile SDK Engineer', company: 'Simula', dateSent: 'Apr 7, 2026', threadCount: 3, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'Kishan', role: 'Founding Sales', company: 'TriFetch', dateSent: 'Apr 7, 2026', threadCount: 3, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'Sannah', role: 'Founding Sales', company: 'TriFetch', dateSent: 'Apr 7, 2026', threadCount: 3, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'Utkarsh', role: 'Sales Development Rep', company: 'Optifye (YC W25)', dateSent: 'Apr 7, 2026', threadCount: 3, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'Anish', role: 'Forward Deployed Engineer', company: 'CollectWise (YC F24)', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'Satish', role: 'Founding ML Researcher', company: 'Unsiloed AI', dateSent: 'Apr 7, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'Apr 7 - Checking in FUP sent' },
  { name: 'AJIT', role: 'Sales Development Rep', company: 'Optifye (YC W25)', dateSent: 'Apr 7, 2026', threadCount: 3, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Daniel', role: 'Founding Account Executive', company: 'Auctor', dateSent: 'Apr 6, 2026', threadCount: 3, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Joseph', role: 'Founding Engineer', company: 'AnswerThis', dateSent: 'Apr 6, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Scott', role: 'Forward Deployed Engineer', company: 'CollectWise (YC F24)', dateSent: 'Apr 6, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Luiz', role: 'LATAM iOS Product Engineer', company: 'Alinea Invest (YC)', dateSent: 'Apr 6, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Jeff', role: 'Founding Sales', company: 'TriFetch', dateSent: 'Apr 6, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Scott', role: 'Founding Engineer', company: 'MangoDesk', dateSent: 'Apr 6, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Leilanaz', role: 'Founding Engineer', company: 'MangoDesk', dateSent: 'Apr 6, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Syed', role: 'Software Engineer', company: 'Auctor (YC X25)', dateSent: 'Apr 6, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Faizan', role: 'Software Engineer', company: 'Auctor (YC X25)', dateSent: 'Apr 6, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Scott', role: 'Software Engineer Reliability', company: 'Alinea Invest (YC)', dateSent: 'Apr 6, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Siddhant', role: 'Founding AI Engineer', company: 'Alinea Invest (YC)', dateSent: 'Apr 6, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Davi', role: 'LATAM Senior Fullstack Engineer', company: 'Remy AI', dateSent: 'Apr 6, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Chloe', role: 'Founding Engineer', company: 'Cardinal', dateSent: 'Apr 6, 2026', threadCount: 3, hasFollowUp: 'Yes', notes: 'Apr 6 - Checking in FUP sent' },
  { name: 'GAURANSHI', role: 'Sales Development Rep', company: 'Optifye (YC W25)', dateSent: 'Apr 6, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Rajeev', role: 'Sales Development Rep', company: 'Optifye (YC W25)', dateSent: 'Apr 6, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Anushka', role: 'Sales Development Rep', company: 'Optifye (YC W25)', dateSent: 'Apr 6, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Scott', role: 'Founding Engineer', company: 'Mason', dateSent: 'Apr 6, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Scott', role: 'Forward Deploy AI Engineer', company: 'Judgment Labs', dateSent: 'Apr 4, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Grace', role: 'Growth Lead', company: 'Ergo', dateSent: 'Apr 4, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Kristine', role: 'Founding Growth Lead', company: 'Dots (YC S21)', dateSent: 'Apr 3, 2026', threadCount: 7, hasFollowUp: 'Yes', notes: 'Active thread - 7 messages' },
  { name: 'Scott', role: 'Member of Technical Staff', company: 'Contrario', dateSent: 'Apr 3, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Vishwa', role: 'LATAM Backend Engineer', company: 'Invention Counsel', dateSent: 'Apr 3, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Theodoros', role: 'Founding Engineer Applied AI', company: 'Antes', dateSent: 'Apr 3, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'Apr 3 - FUP sent by William Zhong' },
  { name: 'Jay', role: 'Account Executive', company: 'Kobalt Labs', dateSent: 'Apr 3, 2026', threadCount: 3, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Brian', role: 'Founding Sales', company: 'TriFetch', dateSent: 'Apr 3, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Arya', role: 'Forward Deploy AI Engineer', company: 'Judgment Labs', dateSent: 'Apr 3, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Hans', role: 'Founders Associate', company: 'Truvo', dateSent: 'Apr 2, 2026', threadCount: 1, hasFollowUp: 'URGENT NUDGE - No reply', notes: 'Sent 7 days ago - URGENT FOLLOW UP' },
  { name: 'Nate', role: 'Founding Sales', company: 'TriFetch', dateSent: 'Apr 2, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Sandra', role: 'Design Engineer', company: 'Porter', dateSent: 'Apr 2, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'FUP in thread' },
  { name: 'Thalia', role: 'Founders Associate', company: 'Truvo', dateSent: 'Apr 2, 2026', threadCount: 1, hasFollowUp: 'No', notes: 'No FUP yet' },
  { name: 'Shreyash', role: 'Founding Backend Engineer', company: 'Optifye (YC W25)', dateSent: 'Apr 2, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'Apr 2 - Checking in FUP sent' },
  { name: 'Srajan', role: 'Founding Backend Engineer', company: 'Optifye (YC W25)', dateSent: 'Apr 2, 2026', threadCount: 2, hasFollowUp: 'Yes', notes: 'Apr 2 - Checking in FUP sent' },
  { name: 'Nicollas', role: 'E3 Technical Interview LATAM', company: 'Contrario (YC W25)', dateSent: 'Apr 2, 2026', threadCount: 15, hasFollowUp: 'Yes', notes: 'Very active - 15 messages' },
  { name: 'Gustavo', role: 'E3 Technical Interview LATAM', company: 'Contrario (YC W25)', dateSent: 'Apr 2, 2026', threadCount: 3, hasFollowUp: 'Yes', notes: 'FUP in thread' },
];

export const followUpSeed: FollowUp[] = rows.map((r, i) => ({
  id: `fup-${i + 1}`,
  name: r.name,
  role: r.role,
  company: r.company,
  dateSent: iso(r.dateSent),
  threadCount: r.threadCount,
  hasFollowUp: r.hasFollowUp,
  notes: r.notes,
  category: categorize(r.hasFollowUp, r.notes, r.threadCount),
  resolved: false,
  createdAt: iso(r.dateSent),
  updatedAt: iso(r.dateSent),
}));

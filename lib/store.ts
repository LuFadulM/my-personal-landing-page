'use client';

// ── Types ─────────────────────────────────────────────
export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type EmailType = 'candidate' | 'client' | 'recruiter';
export type EmailStatus = 'draft' | 'sent' | 'follow_up' | 'replied';
export type DocType = 'sop' | 'knowledge';

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  seniority: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  jdId?: string;
  emailId?: string;
  qaId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Email {
  id: string;
  recipient: string;
  type: EmailType;
  status: EmailStatus;
  subject: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doc {
  id: string;
  title: string;
  content: string;
  type: DocType;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QAReview {
  id: string;
  callLink: string;
  score: number;
  notes: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

// ── localStorage keys ─────────────────────────────────
const KEYS = {
  jds: 'opsos_jds',
  tasks: 'opsos_tasks',
  emails: 'opsos_emails',
  docs: 'opsos_docs',
  qa: 'opsos_qa',
} as const;

// ── Helpers ───────────────────────────────────────────
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function now(): string {
  return new Date().toISOString();
}

function safeGet<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function safeSet<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Generic CRUD factory ──────────────────────────────
function createStore<T extends { id: string; createdAt: string; updatedAt: string }>(
  key: string
) {
  return {
    list(): T[] {
      return safeGet<T>(key).sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt)
      );
    },
    get(id: string): T | undefined {
      return safeGet<T>(key).find((x) => x.id === id);
    },
    create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
      const item = {
        ...data,
        id: uid(),
        createdAt: now(),
        updatedAt: now(),
      } as T;
      const all = safeGet<T>(key);
      all.push(item);
      safeSet(key, all);
      return item;
    },
    update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): T | undefined {
      const all = safeGet<T>(key);
      const idx = all.findIndex((x) => x.id === id);
      if (idx === -1) return undefined;
      all[idx] = { ...all[idx], ...data, updatedAt: now() } as T;
      safeSet(key, all);
      return all[idx];
    },
    delete(id: string): void {
      safeSet(
        key,
        safeGet<T>(key).filter((x) => x.id !== id)
      );
    },
  };
}

// ── Entity stores ─────────────────────────────────────
export const jdStore = createStore<JobDescription>(KEYS.jds);
export const taskStore = createStore<Task>(KEYS.tasks);
export const emailStore = createStore<Email>(KEYS.emails);
export const docStore = createStore<Doc>(KEYS.docs);
export const qaStore = createStore<QAReview>(KEYS.qa);

// ── Automations ───────────────────────────────────────

/** When a JD is created, also create a "Review JD" task. */
export function createJDWithAutomation(
  data: Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt'>
): JobDescription {
  const jd = jdStore.create(data);
  taskStore.create({
    title: `Review JD: ${jd.title} (${jd.company})`,
    status: 'todo',
    priority: 'medium',
    dueDate: null,
    jdId: jd.id,
  });
  return jd;
}

/** When an email is set to "sent", create a follow-up task. */
export function createEmailWithAutomation(
  data: Omit<Email, 'id' | 'createdAt' | 'updatedAt'>
): Email {
  const email = emailStore.create(data);
  if (email.status === 'sent') {
    const due = new Date();
    due.setDate(due.getDate() + 3);
    taskStore.create({
      title: `Follow up with ${email.recipient}`,
      status: 'todo',
      priority: 'medium',
      dueDate: due.toISOString().split('T')[0],
      emailId: email.id,
    });
  }
  return email;
}

export function updateEmailWithAutomation(
  id: string,
  data: Partial<Omit<Email, 'id' | 'createdAt'>>
): Email | undefined {
  const existing = emailStore.get(id);
  if (!existing) return undefined;
  const updated = emailStore.update(id, data);
  if (updated && data.status === 'sent' && existing.status !== 'sent') {
    const due = new Date();
    due.setDate(due.getDate() + 3);
    taskStore.create({
      title: `Follow up with ${updated.recipient}`,
      status: 'todo',
      priority: 'medium',
      dueDate: due.toISOString().split('T')[0],
      emailId: updated.id,
    });
  }
  return updated;
}

// ── Dashboard aggregations ────────────────────────────
export function getDashboardStats() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const tasks = taskStore.list();
  const emails = emailStore.list();
  const jds = jdStore.list();
  const qas = qaStore.list();

  return {
    tasksDueToday: tasks.filter((t) => {
      if (t.status === 'done' || !t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= start && d <= end;
    }).length,
    emailsFollowUp: emails.filter(
      (e) => e.status === 'sent' || e.status === 'follow_up'
    ).length,
    jdCount: jds.length,
    qaPending: qas.filter((q) => !q.summary).length,
    recentTasks: tasks.filter((t) => t.status !== 'done').slice(0, 5),
    recentEmails: emails.slice(0, 5),
  };
}

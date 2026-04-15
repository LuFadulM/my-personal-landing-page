export type ClientStatus = 'active' | 'paused' | 'churned';
export type RoleType = 'Engineering' | 'GTM' | 'Ops' | 'Design' | 'Data / ML' | 'Sales' | 'Other';
export type RoleStatus = 'draft' | 'jd_in_progress' | 'jd_complete' | 'outreach_ready' | 'live' | 'paused' | 'filled' | 'cancelled';
export type ResponseStatus = 'pending' | 'replied' | 'declined' | 'no_response' | 'auto_reply' | 'interview_scheduled' | 'ghosted';
export type TaskCategory = 'jd_production' | 'outreach' | 'follow_up' | 'client_comms' | 'pipeline' | 'automation' | 'admin' | 'other';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type KBCategory = 'process' | 'template' | 'faq' | 'client_intel' | 'tool_guide' | 'sop' | 'reference';

export interface Client {
  id: string;
  name: string;
  status: ClientStatus;
  slack_channel: string | null;
  ats: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  client_id: string | null;
  title: string;
  type: RoleType | null;
  location: string | null;
  remote_policy: string | null;
  compensation: string | null;
  equity: string | null;
  bounty: string | null;
  yoe: string | null;
  headcount: number;
  status: RoleStatus;
  jd_link: string | null;
  ashby_link: string | null;
  key_requirements: string[] | null;
  nice_to_haves: string[] | null;
  green_flags: string[] | null;
  red_flags: string[] | null;
  interview_process: string[] | null;
  internal_notes: string | null;
  seq1_draft: string | null;
  seq2_draft: string | null;
  seq3_draft: string | null;
  connection_request: string | null;
  intro_email_template: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface Candidate {
  id: string;
  role_id: string | null;
  name: string;
  email: string | null;
  linkedin: string | null;
  intro_sent_at: string | null;
  intro_sent_by: string | null;
  response_status: ResponseStatus;
  response_date: string | null;
  response_snippet: string | null;
  followup_round: number;
  last_followup_at: string | null;
  next_followup_due: string | null;
  notes: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
  role?: Role;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  category: TaskCategory | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  client_id: string | null;
  role_id: string | null;
  assigned_to: string | null;
  completed_at: string | null;
  created_at: string;
  client?: Client;
  role?: Role;
}

export interface KPIEntry {
  id: string;
  date: string;
  period: 'daily' | 'weekly' | 'monthly';
  intros_sent: number;
  responses_received: number;
  interviews_scheduled: number;
  offers_extended: number;
  placements: number;
  jds_drafted: number;
  jds_completed: number;
  outreach_sequences_created: number;
  followups_sent: number;
  followups_pending: number;
  active_clients: number;
  active_roles: number;
  notes: string | null;
  created_at: string;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  category: KBCategory;
  content: string;
  tags: string[];
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyReview {
  id: string;
  date: string;
  tasks_planned: number | null;
  tasks_completed: number | null;
  went_well: string | null;
  didnt_go_well: string | null;
  priority_1: string | null;
  priority_2: string | null;
  priority_3: string | null;
  blockers: string | null;
  energy_level: number | null;
  created_at: string;
}

export interface SheetSync {
  id: string;
  target_table: string;
  sheet_url: string;
  last_synced_at: string | null;
  last_status: string | null;
  created_at: string;
}

export interface SlackTag {
  id: number;
  day: string;
  from_person: string;
  channel: string;
  description: string;
  done: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

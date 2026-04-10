export type KPICategory = 'Data' | 'Pipeline' | 'Outreach' | 'Tasks' | 'Growth';

export interface KPI {
  id: string;
  name: string;
  category: KPICategory;
  target: string;
}

export const kpis: KPI[] = [
  { id: 'jd-accuracy', name: 'JD completion accuracy', category: 'Data', target: '>95%' },
  { id: 'fu-completion', name: 'Follow-up completion rate', category: 'Pipeline', target: '>95%' },
  { id: 'outreach-completion', name: 'Outreach completion rate', category: 'Outreach', target: '>95%' },
  { id: 'task-accuracy', name: 'Task accuracy', category: 'Tasks', target: '>98%' },
  { id: 'outreach-accuracy', name: 'Outreach accuracy', category: 'Outreach', target: '>99%' },
  { id: 'pipeline-hygiene', name: 'Pipeline hygiene score', category: 'Pipeline', target: '>98%' },
  { id: 'task-sla', name: 'Task SLA compliance', category: 'Tasks', target: '>95%' },
  { id: 'fu-timeliness', name: 'Follow-up timeliness', category: 'Pipeline', target: '>95%' },
  { id: 'weekly-report', name: 'Weekly ops report delivery', category: 'Growth', target: '100%' },
  { id: 'company-fu', name: 'Company follow-up timeliness', category: 'Growth', target: '>95%' },
  { id: 'linkedin-outreach', name: 'LinkedIn Outreach', category: 'Growth', target: '>95%' },
  { id: 'recruiter-support', name: 'Recruiter Support', category: 'Tasks', target: '>95%' },
  { id: 'client-support', name: 'Client Support', category: 'Tasks', target: '>95%' },
];

export const categoryColors: Record<KPICategory, string> = {
  Data: 'text-risk bg-risk/10',
  Pipeline: 'text-newrole bg-newrole/10',
  Outreach: 'text-healthy bg-healthy/10',
  Tasks: 'text-muted bg-muted/10',
  Growth: 'text-attention bg-attention/10',
};

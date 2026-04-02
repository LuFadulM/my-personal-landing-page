export type HealthStatus = 'Healthy' | 'Needs Attention' | 'At Risk' | 'New Role';

export type CandidateStage =
  | 'Application Review'
  | 'Pending Approval'
  | 'Initial Screen'
  | 'Round 2'
  | 'Founder vibe check'
  | 'Final Review'
  | 'Offer Stage';

export type ReviewAction = 'pending' | 'approved' | 'rejected';

export interface Client {
  id: string;
  name: string;
  channel: string;
  roles: Role[];
}

export interface Role {
  id: string;
  clientId: string;
  title: string;
  health: HealthStatus;
  pendingReview: number;
  totalCandidates: number;
  activeRecruiters: string[];
  lastResponseDate: string;
  lastResponseDaysAgo: number;
  notes: string;
}

export interface Candidate {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  roleId: string;
  roleTitle: string;
  stage: CandidateStage;
  recruiter: string;
  reviewStatus: ReviewAction;
  submittedDate: string;
  lastActivity: string;
  notes: string;
}

export interface FollowUp {
  id: string;
  roleId: string;
  clientName: string;
  roleTitle: string;
  health: HealthStatus;
  pendingCount: number;
  daysSinceResponse: number;
  note: string;
  resolved: boolean;
}

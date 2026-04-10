export type Flag = 'PA' | 'SR' | 'BL';
export type HealthStatus = 'Needs Attention' | 'At Risk';

export interface Role {
  role: string;
  co: string;
  rec: number;
  pend: number;
  resp: string;
  flags: Flag[];
  health: HealthStatus;
}

export const needsAttentionRoles: Role[] = [
  { role: 'Product Engineer, Mobile', co: 'Known', rec: 4, pend: 0, resp: '3d ago', flags: [], health: 'Needs Attention' },
  { role: 'Sr SWE Infra & Platform (FS)', co: 'AfterQuery', rec: 9, pend: 0, resp: '1d ago', flags: ['PA'], health: 'Needs Attention' },
  { role: 'Recruiting', co: 'Sieve', rec: 10, pend: 3, resp: '3d ago', flags: ['PA', 'SR'], health: 'Needs Attention' },
  { role: 'LLM Applications Engineer', co: 'Uncountable', rec: 11, pend: 0, resp: '1hr ago', flags: [], health: 'Needs Attention' },
  { role: 'PM (New Grad)', co: 'Uncountable', rec: 16, pend: 0, resp: '1wk ago', flags: ['SR'], health: 'Needs Attention' },
  { role: 'LATAM Founding Eng', co: 'Quander', rec: 3, pend: 1, resp: '2wk ago', flags: [], health: 'Needs Attention' },
  { role: 'LATAM Game Dev Eng', co: 'Simula', rec: 3, pend: 0, resp: '4d ago', flags: ['SR'], health: 'Needs Attention' },
  { role: 'Founding GTM Eng', co: 'hud', rec: 7, pend: 5, resp: '3d ago', flags: ['PA', 'BL', 'SR'], health: 'Needs Attention' },
  { role: 'Product Engineer', co: 'Sphinx Labs', rec: 6, pend: 0, resp: '1wk ago', flags: ['SR'], health: 'Needs Attention' },
  { role: 'Staff AI Engineer', co: 'Bond Studio AI', rec: 4, pend: 1, resp: '3d ago', flags: ['PA', 'SR'], health: 'Needs Attention' },
  { role: 'Sr Fullstack Eng', co: 'Bond Studio AI', rec: 8, pend: 3, resp: '15hr ago', flags: ['PA', 'SR'], health: 'Needs Attention' },
  { role: 'Founding Deploy Strat', co: 'Auctor (YC)', rec: 17, pend: 0, resp: '1mo ago', flags: ['SR'], health: 'Needs Attention' },
  { role: 'LATAM Product Designer', co: 'Crustdata (YC)', rec: 5, pend: 4, resp: '2wk ago', flags: ['BL', 'SR'], health: 'Needs Attention' },
  { role: 'Product Engineer', co: 'AthenaHQ', rec: 5, pend: 1, resp: '1wk ago', flags: ['PA'], health: 'Needs Attention' },
  { role: 'AD Finance Transform', co: 'Uniqus Consultech', rec: 3, pend: 9, resp: '1mo ago', flags: ['BL', 'SR'], health: 'Needs Attention' },
  { role: 'Growth Associate', co: 'AfterQuery', rec: 2, pend: 0, resp: '1wk ago', flags: [], health: 'Needs Attention' },
  { role: 'Customer Support Rep', co: 'Dodo, Inc.', rec: 1, pend: 1, resp: '2wk ago', flags: ['SR'], health: 'Needs Attention' },
];

export const atRiskRoles: Role[] = [
  { role: 'Founding Growth', co: 'Crustdata (YC)', rec: 18, pend: 3, resp: '17hr ago', flags: ['PA', 'SR'], health: 'At Risk' },
  { role: 'Lead GTM Eng', co: 'Listen Labs', rec: 3, pend: 0, resp: '1d ago', flags: ['SR'], health: 'At Risk' },
  { role: 'Founding GTM Lead', co: 'AfterQuery', rec: 1, pend: 1, resp: '8hr ago', flags: ['SR'], health: 'At Risk' },
  { role: 'Strat Projects Lead - Coding', co: 'AfterQuery', rec: 9, pend: 0, resp: '10hr ago', flags: ['SR'], health: 'At Risk' },
  { role: 'Product & Ops Lead', co: 'Sieve', rec: 28, pend: 0, resp: '12hr ago', flags: [], health: 'At Risk' },
  { role: 'SDR', co: 'Slash (YC)', rec: 13, pend: 5, resp: '3d ago', flags: ['BL', 'SR'], health: 'At Risk' },
  { role: 'SWE - Product', co: 'Avoca', rec: 31, pend: 4, resp: '33m ago', flags: ['BL', 'SR'], health: 'At Risk' },
  { role: 'Founders Associate', co: 'Truvo', rec: 4, pend: 0, resp: '1hr ago', flags: ['SR'], health: 'At Risk' },
  { role: 'GTM', co: 'Sphinx Labs', rec: 2, pend: 0, resp: '2d ago', flags: ['SR'], health: 'At Risk' },
  { role: 'Founding Sales', co: 'Sphinx Labs', rec: 7, pend: 1, resp: '8hr ago', flags: ['PA', 'SR'], health: 'At Risk' },
  { role: 'MTS', co: 'Sphinx Labs', rec: 11, pend: 3, resp: '8hr ago', flags: ['SR'], health: 'At Risk' },
  { role: 'Founding Eng', co: 'Chief AI', rec: 39, pend: 3, resp: '1d ago', flags: ['PA', 'SR'], health: 'At Risk' },
  { role: 'FS Engineer', co: 'Uncountable', rec: 49, pend: 1, resp: '2d ago', flags: ['PA'], health: 'At Risk' },
  { role: 'FS SWE', co: 'Liquid', rec: 22, pend: 2, resp: '1d ago', flags: ['SR'], health: 'At Risk' },
  { role: 'Strat Projects Lead', co: 'AfterQuery', rec: 6, pend: 1, resp: '19hr ago', flags: ['SR'], health: 'At Risk' },
  { role: 'Strat Projects Lead', co: 'Bespoke Labs', rec: 2, pend: 1, resp: '2d ago', flags: [], health: 'At Risk' },
  { role: 'Backend Eng', co: 'Mem0', rec: 12, pend: 1, resp: '12hr ago', flags: [], health: 'At Risk' },
  { role: 'Fwd Deploy AI Eng', co: 'Judgment Labs', rec: 17, pend: 0, resp: '21hr ago', flags: ['SR'], health: 'At Risk' },
  { role: 'Founding Growth Lead', co: 'Dots', rec: 5, pend: 1, resp: '34m ago', flags: ['SR'], health: 'At Risk' },
  { role: 'Growth Ops Lead (NY)', co: 'Listen Labs', rec: 1, pend: 1, resp: '20m ago', flags: ['SR'], health: 'At Risk' },
  { role: 'LATAM iOS Eng', co: 'Wispr AI', rec: 1, pend: 1, resp: '1d ago', flags: [], health: 'At Risk' },
  { role: 'Growth', co: 'Strala', rec: 5, pend: 1, resp: '7d ago', flags: [], health: 'At Risk' },
  { role: 'Tech Deploy Strat', co: 'Trellis AI', rec: 4, pend: 0, resp: '3d ago', flags: ['SR'], health: 'At Risk' },
  { role: 'Research Scientist', co: 'AfterQuery', rec: 5, pend: 0, resp: '13hr ago', flags: [], health: 'At Risk' },
  { role: 'Rev Ops Specialist', co: 'Warp', rec: 3, pend: 2, resp: '4d ago', flags: ['SR'], health: 'At Risk' },
  { role: 'Founding Backend Eng', co: 'Optifye', rec: 7, pend: 0, resp: '1wk ago', flags: [], health: 'At Risk' },
  { role: 'Growth Lead', co: 'Listen Labs', rec: 5, pend: 1, resp: '2d ago', flags: ['SR'], health: 'At Risk' },
  { role: 'Growth Lead', co: 'Ergo', rec: 3, pend: 1, resp: '5d ago', flags: ['PA'], health: 'At Risk' },
  { role: 'Talent Operator', co: 'Contrario', rec: 3, pend: 0, resp: '1wk ago', flags: ['PA'], health: 'At Risk' },
  { role: 'Federal AE', co: 'Dynamo AI', rec: 5, pend: 1, resp: '1wk ago', flags: [], health: 'At Risk' },
];

export const allUnhealthyRoles: Role[] = [...needsAttentionRoles, ...atRiskRoles];

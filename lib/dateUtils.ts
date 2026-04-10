/**
 * Calculate a date that is N business days after startDate.
 * Skips Saturday (6) and Sunday (0).
 */
export function addBusinessDays(startDate: string, days: number): Date {
  const d = new Date(startDate + 'T00:00:00');
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function daysBetween(a: string, b: string): number {
  const d1 = new Date(a + 'T00:00:00');
  const d2 = new Date(b + 'T00:00:00');
  return Math.floor((d2.getTime() - d1.getTime()) / 86400000);
}

/** Reference: April 10, 2026 */
export const REF_DATE = '2026-04-10';

export function isOverdue(dueDate: Date): boolean {
  const ref = new Date(REF_DATE + 'T00:00:00');
  return dueDate <= ref;
}

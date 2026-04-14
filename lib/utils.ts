import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined, fmt = 'MMM d'): string {
  if (!date) return '—';
  return format(new Date(date), fmt);
}

export function relativeTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function daysSince(date: string | Date | null | undefined): number {
  if (!date) return 0;
  return differenceInDays(new Date(), new Date(date));
}

/** Calculate next follow-up due date based on round. */
export function nextFollowupDue(introSentAt: string | null, round: number): Date | null {
  if (!introSentAt) return null;
  const sent = new Date(introSentAt);
  const offsets = [3, 6, 9]; // business days approximated as calendar days
  const idx = Math.min(round, 2);
  const d = new Date(sent);
  d.setDate(d.getDate() + offsets[idx]);
  return d;
}

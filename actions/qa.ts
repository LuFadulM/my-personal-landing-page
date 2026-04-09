'use server';

import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import { summarizeQA } from '@/lib/ai';
import { revalidatePath } from 'next/cache';

export async function listQAReviews() {
  const userId = await getCurrentUserId();
  return prisma.qAReview.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createQAReview(formData: FormData) {
  const userId = await getCurrentUserId();
  const callLink = String(formData.get('callLink') || '').trim();
  const scoreRaw = Number(formData.get('score') || 5);
  const notes = String(formData.get('notes') || '').trim();
  const summary = String(formData.get('summary') || '').trim() || null;
  const score = Math.max(1, Math.min(10, scoreRaw));

  if (!callLink) throw new Error('Call link is required');

  await prisma.qAReview.create({
    data: { callLink, score, notes, summary, userId },
  });
  revalidatePath('/qa');
  revalidatePath('/dashboard');
}

export async function updateQASummary(id: string, summary: string) {
  const userId = await getCurrentUserId();
  await prisma.qAReview.updateMany({ where: { id, userId }, data: { summary } });
  revalidatePath('/qa');
}

export async function deleteQAReview(id: string) {
  const userId = await getCurrentUserId();
  await prisma.qAReview.deleteMany({ where: { id, userId } });
  revalidatePath('/qa');
}

export async function aiSummarizeQA(notes: string) {
  return summarizeQA(notes);
}

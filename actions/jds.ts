'use server';

import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import { generateJD } from '@/lib/ai';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function listJDs() {
  const userId = await getCurrentUserId();
  return prisma.jobDescription.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getJD(id: string) {
  const userId = await getCurrentUserId();
  return prisma.jobDescription.findFirst({ where: { id, userId } });
}

export async function createJD(formData: FormData) {
  const userId = await getCurrentUserId();
  const title = String(formData.get('title') || '').trim();
  const company = String(formData.get('company') || '').trim();
  const seniority = String(formData.get('seniority') || 'Mid').trim();
  const description = String(formData.get('description') || '').trim();
  if (!title || !company) throw new Error('Title and company are required');

  const jd = await prisma.jobDescription.create({
    data: { title, company, seniority, description, userId },
  });

  // Automation: create "Review JD" task
  await prisma.task.create({
    data: {
      title: `Review JD: ${title} (${company})`,
      userId,
      jdId: jd.id,
      priority: 'medium',
    },
  });

  revalidatePath('/jds');
  revalidatePath('/dashboard');
  redirect('/jds');
}

export async function updateJD(id: string, formData: FormData) {
  const userId = await getCurrentUserId();
  const title = String(formData.get('title') || '').trim();
  const company = String(formData.get('company') || '').trim();
  const seniority = String(formData.get('seniority') || '').trim();
  const description = String(formData.get('description') || '').trim();

  await prisma.jobDescription.updateMany({
    where: { id, userId },
    data: { title, company, seniority, description },
  });
  revalidatePath('/jds');
  revalidatePath(`/jds/${id}`);
}

export async function deleteJD(id: string) {
  const userId = await getCurrentUserId();
  await prisma.jobDescription.deleteMany({ where: { id, userId } });
  revalidatePath('/jds');
}

export async function aiGenerateJD(input: {
  title: string;
  company: string;
  seniority: string;
  notes?: string;
}) {
  return generateJD(input);
}

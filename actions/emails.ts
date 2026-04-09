'use server';

import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import { generateEmail } from '@/lib/ai';
import { revalidatePath } from 'next/cache';
import type { EmailType, EmailStatus } from '@prisma/client';

export async function listEmails() {
  const userId = await getCurrentUserId();
  return prisma.email.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createEmail(formData: FormData) {
  const userId = await getCurrentUserId();
  const recipient = String(formData.get('recipient') || '').trim();
  const type = String(formData.get('type') || 'candidate') as EmailType;
  const subject = String(formData.get('subject') || '').trim();
  const content = String(formData.get('content') || '').trim();
  const status = String(formData.get('status') || 'draft') as EmailStatus;
  if (!recipient) throw new Error('Recipient is required');

  const email = await prisma.email.create({
    data: { recipient, type, subject, content, status, userId },
  });

  // Automation: sent emails auto-create a follow-up task
  if (status === 'sent') {
    const due = new Date();
    due.setDate(due.getDate() + 3);
    await prisma.task.create({
      data: {
        title: `Follow up with ${recipient}`,
        userId,
        emailId: email.id,
        priority: 'medium',
        dueDate: due,
      },
    });
  }

  revalidatePath('/emails');
  revalidatePath('/dashboard');
}

export async function updateEmailStatus(id: string, status: EmailStatus) {
  const userId = await getCurrentUserId();
  const existing = await prisma.email.findFirst({ where: { id, userId } });
  if (!existing) return;

  await prisma.email.update({ where: { id }, data: { status } });

  // Automation: transitioning to sent creates a follow-up task
  if (status === 'sent' && existing.status !== 'sent') {
    const due = new Date();
    due.setDate(due.getDate() + 3);
    await prisma.task.create({
      data: {
        title: `Follow up with ${existing.recipient}`,
        userId,
        emailId: id,
        priority: 'medium',
        dueDate: due,
      },
    });
  }

  revalidatePath('/emails');
  revalidatePath('/dashboard');
}

export async function deleteEmail(id: string) {
  const userId = await getCurrentUserId();
  await prisma.email.deleteMany({ where: { id, userId } });
  revalidatePath('/emails');
}

export async function aiGenerateEmail(input: {
  recipient: string;
  type: EmailType;
  purpose?: string;
  context?: string;
}) {
  return generateEmail(input);
}

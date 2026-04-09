'use server';

import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { TaskStatus, TaskPriority } from '@prisma/client';

export async function listTasks() {
  const userId = await getCurrentUserId();
  return prisma.task.findMany({
    where: { userId },
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function createTask(formData: FormData) {
  const userId = await getCurrentUserId();
  const title = String(formData.get('title') || '').trim();
  const priority = (String(formData.get('priority') || 'medium') as TaskPriority);
  const dueStr = String(formData.get('dueDate') || '');
  if (!title) throw new Error('Title is required');

  await prisma.task.create({
    data: {
      title,
      priority,
      userId,
      dueDate: dueStr ? new Date(dueStr) : null,
    },
  });
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  const userId = await getCurrentUserId();
  await prisma.task.updateMany({ where: { id, userId }, data: { status } });
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
}

export async function deleteTask(id: string) {
  const userId = await getCurrentUserId();
  await prisma.task.deleteMany({ where: { id, userId } });
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
}

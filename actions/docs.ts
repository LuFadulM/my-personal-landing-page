'use server';

import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { DocType } from '@prisma/client';

export async function listDocs(search?: string) {
  const userId = await getCurrentUserId();
  if (search) {
    return prisma.doc.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
  return prisma.doc.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
}

export async function createDoc(formData: FormData) {
  const userId = await getCurrentUserId();
  const title = String(formData.get('title') || '').trim();
  const content = String(formData.get('content') || '').trim();
  const type = String(formData.get('type') || 'knowledge') as DocType;
  const tagsRaw = String(formData.get('tags') || '');
  const tags = tagsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  if (!title) throw new Error('Title is required');

  await prisma.doc.create({ data: { title, content, type, tags, userId } });
  revalidatePath('/docs');
}

export async function updateDoc(id: string, formData: FormData) {
  const userId = await getCurrentUserId();
  const title = String(formData.get('title') || '').trim();
  const content = String(formData.get('content') || '').trim();
  const type = String(formData.get('type') || 'knowledge') as DocType;
  const tagsRaw = String(formData.get('tags') || '');
  const tags = tagsRaw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  await prisma.doc.updateMany({
    where: { id, userId },
    data: { title, content, type, tags },
  });
  revalidatePath('/docs');
}

export async function deleteDoc(id: string) {
  const userId = await getCurrentUserId();
  await prisma.doc.deleteMany({ where: { id, userId } });
  revalidatePath('/docs');
}

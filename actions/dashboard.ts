'use server';

import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';

export async function getDashboardStats() {
  const userId = await getCurrentUserId();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [tasksDueToday, emailsFollowUp, jdCount, qaPending, recentTasks, recentEmails] =
    await Promise.all([
      prisma.task.count({
        where: {
          userId,
          status: { in: ['todo', 'doing'] },
          dueDate: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.email.count({
        where: { userId, status: { in: ['sent', 'follow_up'] } },
      }),
      prisma.jobDescription.count({ where: { userId } }),
      prisma.qAReview.count({ where: { userId, summary: null } }),
      prisma.task.findMany({
        where: { userId, status: { in: ['todo', 'doing'] } },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        take: 5,
      }),
      prisma.email.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

  return {
    tasksDueToday,
    emailsFollowUp,
    jdCount,
    qaPending,
    recentTasks,
    recentEmails,
  };
}

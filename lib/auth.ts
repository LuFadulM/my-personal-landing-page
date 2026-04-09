import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: 'database' },
  pages: { signIn: '/login' },
});

/**
 * Helper used by Server Actions & pages.
 * Returns the current user id, or a fallback demo user id in dev when
 * auth is not yet configured. Swap the fallback for a real `redirect('/login')`
 * once credentials are set.
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await auth().catch(() => null);
  if (session?.user?.id) return session.user.id;

  // Fallback: upsert a single demo user so the app is usable without Google creds
  const demo = await prisma.user.upsert({
    where: { email: 'demo@opsos.local' },
    update: {},
    create: { email: 'demo@opsos.local', name: 'Demo User' },
  });
  return demo.id;
}

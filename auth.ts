import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { env } from './env';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          max_age: 300,
          scope: 'openid email profile',
        },
      },
    }),
  ],
  secret: env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  callbacks: {
    jwt: async ({ token, account, profile }) => {
      const now = Date.now();
      const GOOGLE_ID_TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

      if (account?.provider === 'google') {
        if (profile?.sub) token.sub = profile.sub;
        if (typeof profile?.picture === 'string') token.picture = profile.picture;
        // Surface Google tokens only if you need them later
        (token as any).googleAccessToken = (account as any)?.access_token;
        (token as any).googleIdToken = (account as any)?.id_token;
        // Track when the Google ID token was issued so we can expire it quickly
        (token as any).googleIdTokenAt = now;
      } else {
        // Expire googleIdToken after a short TTL to avoid caching for long
        const issuedAt = (token as any).googleIdTokenAt as number | undefined;
        if (issuedAt && now - issuedAt > GOOGLE_ID_TOKEN_TTL_MS) {
          delete (token as any).googleIdToken;
          delete (token as any).googleIdTokenAt;
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      const now = Date.now();
      const GOOGLE_ID_TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

      (session.user as any).id = token.sub;
      if (token.picture) session.user.image = token.picture as string;
      // Optional: expose Google tokens to client if needed
      (session as any).googleAccessToken = (token as any).googleAccessToken;

      // Only expose a fresh Google ID token; do not let it linger in the session
      const idToken = (token as any).googleIdToken as string | undefined;
      const issuedAt = (token as any).googleIdTokenAt as number | undefined;
      if (idToken && issuedAt && now - issuedAt <= GOOGLE_ID_TOKEN_TTL_MS) {
        (session as any).googleIdToken = idToken;
      } else {
        (session as any).googleIdToken = undefined;
      }
      return session;
    },
  },
});

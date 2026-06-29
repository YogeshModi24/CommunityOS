import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL environment variable is required');

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!AUTH_SECRET)
  throw new Error('AUTH_SECRET or NEXTAUTH_SECRET environment variable is required');

const nextAuthResult = NextAuth({
  secret: AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-transport': 'json',
            },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });

          const json = await res.json();
          if (!json.success) return null;

          const { accessToken, refreshToken, user } = json.data;
          return { ...user, token: accessToken, refreshToken };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.token = (user as any).token;
        token.refreshToken = (user as any).refreshToken;
        token.name = user.name;
        token.email = user.email;
        token.role = (user as any).role;
        token.ward = (user as any).ward;
        token.points = (user as any).points;
        token.expiresAt = Date.now() + 14 * 60 * 1000; // 14m access token expiration (1m grace window)
      }

      // If token is not expired, return it
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      // Try rotating token on server-side NextAuth flow
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-transport': 'json',
          },
          body: JSON.stringify({
            refreshToken: token.refreshToken,
          }),
        });

        const json = await response.json();
        if (!json.success) {
          throw new Error('Refresh request returned failure');
        }

        const { accessToken, refreshToken: newRefreshToken } = json.data;

        return {
          ...token,
          token: accessToken,
          refreshToken: newRefreshToken ?? token.refreshToken,
          expiresAt: Date.now() + 14 * 60 * 1000, // Reset to 14m on successful rotation
        };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[NextAuth] Token rotation failed', error);
        return {
          ...token,
          error: 'RefreshAccessTokenError',
        };
      }
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session as any).token = token.token;
        (session as any).user.role = token.role;
        (session as any).user.ward = token.ward;
        (session as any).user.points = token.points;
        (session as any).error = token.error;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
});

export const handlers = nextAuthResult.handlers;
export const signIn = nextAuthResult.signIn;
export const signOut = nextAuthResult.signOut;
export const auth: any = nextAuthResult.auth;

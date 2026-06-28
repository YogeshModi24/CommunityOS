import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    token: string;
    user: DefaultSession['user'] & {
      id: string;
      role: string;
      ward?: string;
      points: number;
    };
  }
}

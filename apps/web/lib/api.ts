import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL environment variable is required');

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from NextAuth session on every request
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session) {
    // If the session returned a token rotation error, clear it and redirect to login
    if ((session as any).error === 'RefreshAccessTokenError') {
      if (typeof window !== 'undefined') {
        await signOut({ callbackUrl: '/login' });
      }
      return config;
    }
    if ((session as any).token) {
      config.headers.Authorization = `Bearer ${(session as any).token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // eslint-disable-next-line no-console
    console.error('[API Error]', error.response?.data ?? error.message);
    // Automatically redirect/clear session on 401 Unauthorized errors
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        await signOut({ callbackUrl: '/login' });
      }
    }
    return Promise.reject(error);
  }
);

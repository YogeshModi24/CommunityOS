import { NextRequest } from 'next/server';

import { handlers } from '@/lib/auth';

const { GET: authGET, POST: authPOST } = handlers;

function clearCookies(response: Response) {
  const deletionDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
  // NextAuth v5 (Auth.js beta.31+) uses authjs.* prefix, not next-auth.*
  const cookiesToClear = [
    'authjs.session-token; Path=/; Max-Age=0; Expires=' + deletionDate + '; HttpOnly; SameSite=Lax',
    '__Secure-authjs.session-token; Path=/; Max-Age=0; Expires=' +
      deletionDate +
      '; HttpOnly; Secure; SameSite=Lax',
    '__Secure.authjs.session-token.0; Path=/; Max-Age=0; Expires=' +
      deletionDate +
      '; HttpOnly; Secure; SameSite=Lax',
    'authjs.csrf-token; Path=/; Max-Age=0; Expires=' + deletionDate + '; HttpOnly; SameSite=Lax',
    '__Secure-authjs.csrf-token; Path=/; Max-Age=0; Expires=' +
      deletionDate +
      '; HttpOnly; Secure; SameSite=Lax',
    // Legacy v4 names just in case
    'next-auth.session-token; Path=/; Max-Age=0; Expires=' +
      deletionDate +
      '; HttpOnly; SameSite=Lax',
    '__Secure-next-auth.session-token; Path=/; Max-Age=0; Expires=' +
      deletionDate +
      '; HttpOnly; Secure; SameSite=Lax',
  ];
  for (const cookie of cookiesToClear) {
    response.headers.append('Set-Cookie', cookie);
  }
  return response;
}

export async function GET(req: NextRequest) {
  const res = await authGET(req);
  if (req.nextUrl.pathname.endsWith('/signout')) {
    return clearCookies(res);
  }
  return res;
}

export async function POST(req: NextRequest) {
  const res = await authPOST(req);
  if (req.nextUrl.pathname.endsWith('/signout')) {
    return clearCookies(res);
  }
  return res;
}

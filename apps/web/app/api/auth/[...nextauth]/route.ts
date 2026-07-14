import { NextRequest } from 'next/server';

import { handlers } from '@/lib/auth';

const { GET: authGET, POST: authPOST } = handlers;

function clearCookies(response: Response) {
  response.headers.append(
    'Set-Cookie',
    'next-auth.session-token=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
  );
  response.headers.append(
    'Set-Cookie',
    '__Secure-next-auth.session-token=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
  );
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

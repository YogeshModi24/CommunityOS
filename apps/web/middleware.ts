import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const nextUrl = req.nextUrl;
  const pathname = nextUrl.pathname;

  // NextAuth v5 (Auth.js) uses `authjs.*` cookie prefix (not `next-auth.*`)
  const hasSession =
    req.cookies.has('authjs.session-token') ||
    req.cookies.has('__Secure-authjs.session-token') ||
    req.cookies.has('__Secure.authjs.session-token.0');

  const protectedRoutes = ['/dashboard', '/feed', '/issue', '/leaderboard', '/map', '/report'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, nextUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

import { auth } from './lib/auth';

export default auth((req: any) => {
  const isLoggedIn = !!req.auth;
  const nextUrl = (req as any).nextUrl;
  const pathname = nextUrl.pathname;

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/feed')) {
    // eslint-disable-next-line no-console
    console.log('[Middleware Debug]', {
      pathname,
      isLoggedIn,
      auth: req.auth,
    });
  }

  const protectedRoutes = ['/dashboard', '/feed', '/issue', '/leaderboard', '/map', '/report'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthPage = pathname.startsWith('/login');

  if (isAuthPage && isLoggedIn) {
    const hasType = nextUrl.searchParams.has('type');
    if (!hasType) {
      const role = (req.auth as any)?.user?.role;
      if (role === 'MUNICIPALITY' || role === 'municipality') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return Response.redirect(new URL('/feed', nextUrl));
    }
  }

  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, nextUrl)
    );
  }

  return undefined;
}) as any;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

import { auth } from './lib/auth';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const protectedRoutes = ['/dashboard', '/feed', '/issue', '/leaderboard', '/map', '/report'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthPage = pathname.startsWith('/login');

  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL('/feed', req.nextUrl));
  }

  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.nextUrl)
    );
  }

  return undefined;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

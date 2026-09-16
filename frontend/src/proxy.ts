import { NextResponse, type NextRequest } from 'next/server';

const ACCESS_COOKIE = 'freethedesk_access';
const REFRESH_COOKIE = 'freethedesk_refresh';

// One entry per portal shell (PortalShell, DashboardShell, SeoPortalShell).
// Role/wrong-portal routing stays client-side -- it needs the JWT decoded,
// which this only checks for presence of.
const PROTECTED_PREFIXES = ['/dashboard', '/portal', '/seo-portal'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const hasAuthCookie = request.cookies.has(ACCESS_COOKIE) || request.cookies.has(REFRESH_COOKIE);
  if (hasAuthCookie) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/dashboard/:path*', '/portal/:path*', '/seo-portal/:path*'],
};

import { createProxy } from '@freetheplatform/web-security/proxy';

import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/sessionCookies';

// One entry per portal shell (PortalShell, DashboardShell, SeoPortalShell, AffiliatePortalShell).
// Role/wrong-portal routing stays client-side -- it needs the JWT decoded,
// which this only checks for presence of.
const PROTECTED_PREFIXES = ['/dashboard', '/portal', '/seo-portal', '/affiliate-portal'];

export const proxy = createProxy({
  accessCookie: ACCESS_COOKIE,
  refreshCookie: REFRESH_COOKIE,
  protectedPrefixes: PROTECTED_PREFIXES,
});

export const config = {
  matcher: [
    '/dashboard/admin/:path*',
    '/portal/:path*',
    '/seo-portal/:path*',
    '/affiliate-portal/:path*',
  ],
};

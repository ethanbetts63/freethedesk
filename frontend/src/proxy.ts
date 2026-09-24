import { createProxy } from '@freetheplatform/web-security/proxy';

// One entry per portal shell (PortalShell, DashboardShell, SeoPortalShell).
// Role/wrong-portal routing stays client-side -- it needs the JWT decoded,
// which this only checks for presence of.
const PROTECTED_PREFIXES = ['/dashboard', '/portal', '/seo-portal'];

export const proxy = createProxy({
  accessCookie: 'freethedesk_access',
  refreshCookie: 'freethedesk_refresh',
  protectedPrefixes: PROTECTED_PREFIXES,
});

export const config = {
  matcher: ['/dashboard/admin/:path*', '/portal/:path*', '/seo-portal/:path*'],
};

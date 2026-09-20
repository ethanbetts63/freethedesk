import { matchesAnyRoute } from '@/lib/routePolicy';

/**
 * Which routes wear which chrome.
 *
 * A separate question from `lib/clarityRoutes`, and separate from it on
 * purpose: the two lists overlap heavily but for unrelated reasons, and one is
 * a security control while the other is layout. Merging them would mean a
 * layout change could quietly turn session recording on.
 */

/** Pages that carry no header or footer at all. */
const STANDALONE_CHROME_ROUTES = ['/login', '/licensing/payment'] as const;

const APPLICATION_ROUTES = [
  '/dashboard',
  // Chrome-wise it is an application screen, even though nobody signs in to it.
  '/sale',
  '/portal',
  '/seo-portal',
  '/seo/payment',
  '/dealership-website-builder',
] as const;

export function usesStandaloneChrome(pathname: string): boolean {
  return matchesAnyRoute(pathname, STANDALONE_CHROME_ROUTES);
}

export function isApplicationRoute(pathname: string): boolean {
  return matchesAnyRoute(pathname, APPLICATION_ROUTES);
}

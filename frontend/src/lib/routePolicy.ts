/* Component registry: freetheplatform/frontend/registry/src/lib/routePolicy.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { CLARITY_EXCLUDED_ROUTES } from '@/lib/clarityRoutes';

/**
 * Which routes session recording may run on. A security decision, not an analytics one
 * (security-standard.md section 7): a Clarity replay of a staff dashboard or customer order is a copy of
 * that screen with a third party, and input masking does not hide the screen around the fields.
 *
 * Matching is prefix-based and includes descendants, so a new page under an excluded tree is excluded at once.
 * The list is per-site in `lib/clarityRoutes`; `scripts/check-customer-routes.mjs` fails the build if a required entry is removed.
 */

export function isRouteOrDescendant(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function matchesAnyRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => isRouteOrDescendant(pathname, route));
}

export function shouldRunClarity(pathname: string): boolean {
  return !matchesAnyRoute(pathname, CLARITY_EXCLUDED_ROUTES);
}

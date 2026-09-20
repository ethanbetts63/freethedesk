/* Component registry: freetheplatform/frontend/registry/src/lib/routePolicy.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { CLARITY_EXCLUDED_ROUTES } from '@/lib/clarityRoutes';

/**
 * Which routes session recording is allowed to run on.
 *
 * Section 7 of freetheplatform/_docs/security-standard.md treats this as a
 * security decision rather than an analytics one: Clarity replays what the
 * visitor saw, so a recording taken on a staff dashboard or a customer's order
 * is a copy of that screen sitting with a third party. Input masking is not
 * the control — it hides field values, not the screen around them.
 *
 * The matching is prefix-based and includes descendants, so a new page under
 * an excluded tree is excluded the day it is added rather than the day
 * somebody remembers. The list itself is per-site and lives in
 * `lib/clarityRoutes`; `scripts/check-customer-routes.mjs` asserts the entries
 * that must never leave it, so removing one is a build failure rather than a
 * quiet change to what a third party receives.
 *
 * This reasoning is the reason the file is shared. The matcher is four lines
 * and nobody would have got it wrong; what was missing in two of the three
 * repos was any statement of why the list exists, so an editor there could
 * shorten it without ever meeting the argument against.
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

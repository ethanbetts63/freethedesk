/* Component registry: freetheplatform/frontend/registry/src/lib/session.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { cookies } from 'next/headers';

import { SESSION_COOKIES } from '@/lib/sessionCookies';

/**
 * Whether this request carries a session, read on the server from cookie
 * presence alone: the same rule the edge proxy applies in front of a portal
 * (security-standard.md section 16).
 *
 * This is how the public chrome learns somebody is signed in. The other way,
 * a client component asking the API who you are, was tried and taken out: it
 * hydrated on every marketing page, fired a profile request per view, and
 * showed Login for the round trip before flipping to Log out. Reading the jar
 * costs no request and renders the right word the first time.
 *
 * Presence, not validity. The token is not opened, let alone verified; a
 * cookie a revoked session left behind still reads as signed in here until it
 * expires or Log out clears it, and the portal behind it still asks Django.
 * Each site names its cookies in `lib/sessionCookies.ts`, which the proxy and
 * the Server Action fetch read too, so the three cannot disagree.
 *
 * Reading cookies makes every route under the layout that calls this render
 * per request. That is the price of the right word in the header, and it is
 * paid once for the whole site rather than once per visitor per page.
 *
 * Present with a value, not merely present. In the response that logs out,
 * the relayed deletions sit in this jar as empty cookies, and `has()` would
 * render that very page as still signed in.
 */
export async function hasSession(): Promise<boolean> {
  const jar = await cookies();
  return SESSION_COOKIES.some((name) => Boolean(jar.get(name)?.value));
}

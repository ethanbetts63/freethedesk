/* Component registry: freetheplatform/frontend/registry/src/lib/logout.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
'use server';

import { revalidatePath } from 'next/cache';

import { serverApiFetch } from '@/lib/serverApi';
import { relaySetCookies } from '@/lib/serverCookies';

/**
 * Log out from the public chrome, as a Server Action.
 *
 * The header is a Server Component and `SessionLink` renders this as a form,
 * so signing out needs no client bundle. Django blacklists the refresh token
 * and answers with the cookie deletions, which are relayed onto this response
 * the way sign-in relays the issue; the browser lands on the page it was on
 * with the cookies gone and the header re-rendered as signed out.
 *
 * Django's logout never fails: a missing, expired or already-revoked token
 * still answers 200 with the deletions. A network fault is the one case left,
 * and swallowing it would leave the page claiming a session it still has, so
 * it is allowed to surface.
 *
 * The revalidation is what makes the header change in front of them. Relaying
 * the deletions updates the browser's jar, but the router keeps the segments
 * it already has, header included, and would show Log out until the next
 * navigation. Every route reads the jar, so every route is stale: the whole
 * tree goes, and the response carries the page re-rendered as signed out.
 */
export async function logout(): Promise<void> {
  const response = await serverApiFetch('/api/token/logout/', { method: 'POST' });
  await relaySetCookies(response);
  revalidatePath('/', 'layout');
}

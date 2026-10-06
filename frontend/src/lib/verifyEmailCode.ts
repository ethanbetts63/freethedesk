/* Component registry: freetheplatform/frontend/registry/src/lib/verifyEmailCode.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import type { ReadableCookies } from '@freetheplatform/web-security';
import { cookies } from 'next/headers';

import { relaySetCookies } from '@/lib/serverCookies';

/** The site's Server Action fetch: base URL, session-cookie forwarding and CSRF, with an optional cookie store. */
export type ServerApiFetch = (
  path: string,
  init?: RequestInit,
  cookieStore?: ReadableCookies,
) => Promise<Response>;

export type VerifyEmailResult =
  | { ok: true }
  | { ok: false; reason: 'wrong_code' }
  | { ok: false; reason: 'failed'; detail?: string };

/** The request's cookies with `response`'s Set-Cookie values laid over them. */
async function withIssuedCookies(response: Response): Promise<ReadableCookies> {
  const jar = await cookies();
  const issued = new Map<string, string>();
  for (const header of response.headers.getSetCookie()) {
    const pair = header.split(';', 1)[0];
    const separator = pair.indexOf('=');
    if (separator > 0) issued.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
  return {
    toString: () => jar.toString(),
    get: (name) => (issued.has(name) ? { value: issued.get(name)! } : jar.get(name)),
  };
}

/**
 * Verify a paid signup's email with the code we sent it, and replace the code with the
 * customer's own password. See `_docs/apps/payments.md`, "Accounts a payment opens".
 *
 * The code is the account's first password, flagged `must_change_password`. Signing in with
 * it proves the address; the shared change-password endpoint then replaces it on the session
 * that sign-in issued. The browser receives cookies only once both calls succeed, so nobody
 * ever holds a session on the code alone. For a Server Action only.
 */
export async function verifyEmailWithCode(
  fetchApi: ServerApiFetch,
  { email, code, newPassword }: { email: string; code: string; newPassword: string },
): Promise<VerifyEmailResult> {
  let login: Response;
  try {
    login = await fetchApi('/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password: code }),
    });
  } catch {
    return { ok: false, reason: 'failed' };
  }
  if (!login.ok) return { ok: false, reason: 'wrong_code' };

  let change: Response;
  try {
    change = await fetchApi(
      '/api/password/change/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: code, new_password: newPassword }),
      },
      await withIssuedCookies(login),
    );
  } catch {
    return { ok: false, reason: 'failed' };
  }
  if (!change.ok) {
    const body = await change.json().catch(() => null);
    const detail = body?.detail ?? body?.current_password?.[0] ?? body?.new_password?.[0];
    return { ok: false, reason: 'failed', detail };
  }

  // Login's cookies first (it issued the CSRF token), then the change's fresh session pair over them.
  await relaySetCookies(login);
  await relaySetCookies(change);
  return { ok: true };
}

import { SERVER_API_BASE_URL } from '@/lib/serverApi';
import { relaySetCookies } from '@/lib/serverCookies';
import { firstError } from '@/lib/api';

export interface SignupState {
  status: 'idle' | 'success' | 'error';
  error?: string;
}

export interface SignupConfig {
  endpoint: string;
}

const GENERIC_FAILURE = 'Unable to create your account.';

/**
 * The half of signup that is the same for every product: create the account,
 * establish the session, relay Django's cookies onto this response.
 *
 * It takes values that a Zod schema has already parsed, never a `FormData`.
 * That is the whole point of the split — this used to read the form directly
 * and forward whatever it found, so the UI-only radio groups that drive the
 * plan chooser travelled to Django alongside the real fields, and a blank
 * email cost a round trip to discover. Each product's own action owns its
 * schema; see `SignupPlansPanel.actions.ts`. SEO signup makes no account at all
 * until payment, so it has its own action and does not come through here.
 *
 * Deliberately not a Server Action itself: its caller is, and an extra
 * exported action is an extra endpoint for no gain.
 */
export async function completeSignup(
  config: SignupConfig,
  values: Record<string, unknown>,
): Promise<SignupState> {
  let response: Response;
  try {
    response = await fetch(`${SERVER_API_BASE_URL}${config.endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return { status: 'error', error: GENERIC_FAILURE };
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { status: 'error', error: firstError(data, GENERIC_FAILURE) };
  }

  // Signing up on a marketing page must not drag the auth context onto it, so
  // the session is only established once the account is confirmed created.
  let loginResponse: Response;
  const credentials = { username: values.email, password: values.password };
  try {
    loginResponse = await fetch(`${SERVER_API_BASE_URL}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return { status: 'error', error: 'Account created, but signing you in failed. Please log in.' };
  }
  if (!loginResponse.ok) {
    return { status: 'error', error: 'Account created, but signing you in failed. Please log in.' };
  }
  await relaySetCookies(loginResponse);

  return { status: 'success' };
}

'use server';

import { cookies } from 'next/headers';

import { serverApiFetch } from '@/lib/serverApi';
import { relaySetCookies } from '@/lib/serverCookies';
import { PASSWORD_CLAIM_PATH, passwordClaimCookie } from '../../_lib/passwordClaim';
import { choosePasswordSchema } from './ChoosePassword.schema';

export interface ChoosePasswordState {
  status: 'idle' | 'success' | 'error' | 'unavailable';
  error?: string;
}

const FAILURE_MESSAGE = 'That password could not be saved. Please try again.';

/**
 * Sets a paid signup's first password with the claim cookie this browser was
 * given at signup, and signs it in. Django answers with the session cookies,
 * which a Server Action has to copy onto its own response.
 */
export async function submitChoosePassword(
  _prev: ChoosePasswordState,
  formData: FormData,
): Promise<ChoosePasswordState> {
  const parsed = choosePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }
  const { reference, new_password } = parsed.data;
  const cookieStore = await cookies();
  const claim = cookieStore.get(passwordClaimCookie(reference))?.value;
  if (!claim) return { status: 'unavailable' };

  let response: Response;
  try {
    response = await serverApiFetch(
      `/api/seo/checkout/${encodeURIComponent(reference)}/password/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim, password: new_password }),
      },
    );
  } catch {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  const body = await response.json().catch(() => null);

  if (response.status === 403) {
    // Spent or expired: drop it so the page stops offering the form.
    cookieStore.delete({ name: passwordClaimCookie(reference), path: PASSWORD_CLAIM_PATH });
    return { status: 'unavailable' };
  }
  if (!response.ok) {
    return { status: 'error', error: body?.password?.[0] ?? body?.detail ?? FAILURE_MESSAGE };
  }

  await relaySetCookies(response);
  cookieStore.delete({ name: passwordClaimCookie(reference), path: PASSWORD_CLAIM_PATH });
  return { status: 'success' };
}

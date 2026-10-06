'use server';

import { serverApiFetch } from '@/lib/serverApi';
import { relaySetCookies } from '@/lib/serverCookies';
import { changePasswordSchema } from './ChangePassword.schema';

export interface ChangePasswordState {
  status: 'idle' | 'success' | 'error';
  error?: string;
}

const FAILURE_MESSAGE = 'That password could not be saved.';

export async function submitChangePassword(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }
  const { current_password, new_password } = parsed.data;

  let response: Response;
  try {
    response = await serverApiFetch('/api/auth/password/change/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_password, new_password }),
    });
  } catch {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail ?? body?.current_password?.[0] ?? body?.new_password?.[0];
    return { status: 'error', error: detail ?? FAILURE_MESSAGE };
  }

  // The API ended every other session and re-issued this one's cookies. A
  // client fetch took them automatically; a Server Action has to copy them onto
  // its own response, or succeeding signs you out.
  await relaySetCookies(response);

  // Not a redirect: the must-change marker has just cleared and the page routes
  // on it, so the client re-reads the profile first. See AuthContext.refresh.
  return { status: 'success' };
}

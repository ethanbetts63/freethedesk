'use server';

import { redirect } from 'next/navigation';
import { SERVER_API_BASE_URL } from '@/lib/serverApi';
import { resetConfirmSchema } from './ResetPasswordConfirm.schema';

export interface ResetConfirmState {
  status: 'idle' | 'error';
  error?: string;
}

const FAILURE_MESSAGE = 'That link is no longer valid.';

export async function submitResetConfirm(
  _prev: ResetConfirmState,
  formData: FormData,
): Promise<ResetConfirmState> {
  const parsed = resetConfirmSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }
  const { uid, token, new_password } = parsed.data;

  let response: Response;
  try {
    response = await fetch(`${SERVER_API_BASE_URL}/api/auth/password/reset/confirm/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, token, new_password }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  if (!response.ok) {
    // The API's own message distinguishes an expired link from a password the
    // validators rejected, which are different things to the person reading it.
    const body = await response.json().catch(() => null);
    const detail = body?.detail ?? body?.new_password?.[0] ?? body?.token?.[0];
    return { status: 'error', error: detail ?? FAILURE_MESSAGE };
  }

  // No cookies come back from this. Whoever followed the link has proved they
  // can read the account's email, which is not the same as being signed in.
  redirect('/login?reset=1');
}

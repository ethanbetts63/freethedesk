'use server';

import { SERVER_API_BASE_URL } from '@/lib/serverApi';
import { resetRequestSchema } from './ResetPassword.schema';

export interface ResetRequestState {
  status: 'idle' | 'sent' | 'error';
  error?: string;
}

export async function submitResetRequest(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const parsed = resetRequestSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) {
    return {
      status: 'error',
      error: parsed.error.issues[0]?.message ?? 'Enter your email address.',
    };
  }

  // Everything below this line reports `sent`, including a network failure.
  // The API answers identically whether the address is known, and saying
  // anything more specific here would turn the page into a way of testing
  // whether somebody has an account.
  try {
    await fetch(`${SERVER_API_BASE_URL}/api/auth/password/reset/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    // Deliberately swallowed; see above.
  }

  return { status: 'sent' };
}

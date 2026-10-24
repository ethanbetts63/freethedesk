'use server';

import { SERVER_API_BASE_URL } from '@/lib/serverApi';
import { partnerSignupSchema } from './PartnerSignupForm.schema';

export interface PartnerSignupState {
  status: 'idle' | 'success' | 'error';
  error?: string;
}

const FAILURE_MESSAGE = 'We could not send that. Please try again.';

export async function submitPartnerSignup(
  _prev: PartnerSignupState,
  formData: FormData,
): Promise<PartnerSignupState> {
  const parsed = partnerSignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  try {
    const response = await fetch(`${SERVER_API_BASE_URL}/api/partner-signups/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      return { status: 'error', error: FAILURE_MESSAGE };
    }
  } catch {
    return { status: 'error', error: FAILURE_MESSAGE };
  }

  return { status: 'success' };
}

'use server';

import { headers } from 'next/headers';

import { firstError } from '@/lib/api';
import { serverApiFetch } from '@/lib/serverApi';
import { affiliateSignupSchema } from './AffiliateSignupForm.schema';

export interface AffiliateSignupState {
  status: 'idle' | 'success' | 'error';
  error?: string;
  /** Where the sign-in code went. */
  email?: string;
  /** The email already has an account, so the form offers sign-in instead. */
  accountExists?: boolean;
}

const GENERIC_FAILURE = 'We could not save your details. Please try again.';

export async function submitAffiliateSignup(
  _prev: AffiliateSignupState,
  formData: FormData,
): Promise<AffiliateSignupState> {
  const parsed = affiliateSignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? 'Check the form above.' };
  }

  let response: Response;
  try {
    response = await serverApiFetch('/api/affiliates/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // The terms are recorded at signup, and the evidence names the
        // affiliate's browser rather than this server.
        'User-Agent': (await headers()).get('user-agent') ?? '',
      },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { status: 'error', error: GENERIC_FAILURE };
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      status: 'error',
      error: firstError(data, GENERIC_FAILURE),
      accountExists: data?.code === 'account_exists',
    };
  }
  return { status: 'success', email: data.email };
}

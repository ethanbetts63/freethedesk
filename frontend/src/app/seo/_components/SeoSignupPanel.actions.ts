'use server';

import { headers } from 'next/headers';

import { firstError } from '@/lib/api';
import { serverApiFetch } from '@/lib/serverApi';
import { seoSignupSchema } from './SeoSignupPanel.schema';

export interface SeoSignupState {
  status: 'idle' | 'success' | 'error';
  error?: string;
  /** What the payment page knows this signup by: there is no login until payment. */
  reference?: string;
  /** The email already has an account, so the form offers sign-in instead. */
  accountExists?: boolean;
}

const GENERIC_FAILURE = 'We could not save your details. Please try again.';

export async function submitSeoSignup(
  _prev: SeoSignupState,
  formData: FormData,
): Promise<SeoSignupState> {
  const parsed = seoSignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? 'Check the form above.' };
  }

  let response: Response;
  try {
    response = await serverApiFetch('/api/seo/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // The terms are recorded at signup, and the evidence names the
        // customer's browser rather than this server.
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
  return { status: 'success', reference: data.reference };
}

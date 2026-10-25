'use server';

import type { AffiliateAccount } from '@/lib/affiliateApi';
import { serverApiFetch } from '@/lib/serverApi';
import { affiliateAccountSchema } from './AffiliateAccount.schema';

export interface AffiliateAccountState {
  status: 'idle' | 'success' | 'error';
  error?: string;
  account?: AffiliateAccount;
}

const FAILURE_MESSAGE = 'Your details could not be saved.';

export async function submitAffiliateAccount(
  _prev: AffiliateAccountState,
  formData: FormData,
): Promise<AffiliateAccountState> {
  const parsed = affiliateAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  const response = await serverApiFetch('/api/affiliates/me/', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });
  if (!response.ok) {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  const account = (await response.json()) as AffiliateAccount;
  return { status: 'success', account };
}

'use server';

import type { AffiliateAccount } from '@/lib/affiliateApi';
import { firstError } from '@/lib/api';
import { serverApiFetch } from '@/lib/serverApi';
import { affiliateCodeSchema } from './AffiliateCodes.schema';

export interface AffiliateCodeState {
  status: 'idle' | 'success' | 'error';
  error?: string;
  /** The account as it stands after the code was added. */
  account?: AffiliateAccount;
}

const FAILURE_MESSAGE = 'That code could not be added. Try again.';

export async function submitAffiliateCode(
  _prev: AffiliateCodeState,
  formData: FormData,
): Promise<AffiliateCodeState> {
  const parsed = affiliateCodeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  let response: Response;
  try {
    response = await serverApiFetch('/api/affiliates/codes/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { status: 'error', error: firstError(data, FAILURE_MESSAGE) };
  }
  return { status: 'success', account: data as AffiliateAccount };
}

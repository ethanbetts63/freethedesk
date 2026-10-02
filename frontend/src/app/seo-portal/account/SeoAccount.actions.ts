'use server';

import { serverApiFetch } from '@/lib/serverApi';
import type { SeoAccount } from '@/lib/seoApi';
import { seoAccountSchema } from './SeoAccount.schema';

export interface SeoAccountState {
  status: 'idle' | 'success' | 'error';
  error?: string;
  account?: SeoAccount;
}

const FAILURE_MESSAGE = 'Your details could not be saved.';

export async function submitSeoAccount(
  _prev: SeoAccountState,
  formData: FormData,
): Promise<SeoAccountState> {
  const parsed = seoAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  const response = await serverApiFetch('/api/seo/me/', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });
  if (!response.ok) {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  const account = (await response.json()) as SeoAccount;
  return { status: 'success', account };
}

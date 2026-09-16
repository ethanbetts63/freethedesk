'use server';

import { redirect } from 'next/navigation';
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

  const { password, business_name, contact_name, phone, website } = parsed.data;

  const response = await serverApiFetch('/api/seo/me/', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ business_name, contact_name, phone, website }),
  });
  if (!response.ok) {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  let account = (await response.json()) as SeoAccount;

  if (!account.has_usable_password && password) {
    const passwordResponse = await serverApiFetch('/api/seo/set-password/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!passwordResponse.ok) {
      return { status: 'error', error: FAILURE_MESSAGE };
    }
    account = { ...account, has_usable_password: true };
    redirect('/seo-portal/overview');
  }

  return { status: 'success', account };
}

'use server';

import { serverApiFetch } from '@/lib/serverApi';
import type { SeoOnboardingProfile } from '@/lib/seoApi';
import { seoConnectSchema } from './SeoConnect.schema';

export interface SeoConnectState {
  status: 'idle' | 'success' | 'error';
  intent?: 'draft' | 'submit';
  error?: string;
  profile?: SeoOnboardingProfile;
}

const FAILURE_MESSAGE = 'Your setup could not be saved.';

export async function submitSeoConnect(
  _prev: SeoConnectState,
  formData: FormData,
): Promise<SeoConnectState> {
  const parsed = seoConnectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  const { intent, ...changes } = parsed.data;

  const patchResponse = await serverApiFetch('/api/seo/onboarding/', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  });
  if (!patchResponse.ok) {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  let profile = (await patchResponse.json()) as SeoOnboardingProfile;

  if (intent === 'submit') {
    const submitResponse = await serverApiFetch('/api/seo/onboarding/submit/', { method: 'POST' });
    if (!submitResponse.ok) {
      return { status: 'error', error: FAILURE_MESSAGE };
    }
    profile = (await submitResponse.json()) as SeoOnboardingProfile;
  }

  return { status: 'success', profile, intent };
}

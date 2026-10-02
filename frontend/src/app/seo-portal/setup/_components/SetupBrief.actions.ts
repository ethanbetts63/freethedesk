'use server';

import { serverApiFetch } from '@/lib/serverApi';
import type { SeoOnboardingProfile } from '@/lib/seoApi';
import { setupBriefSchema } from './SetupBrief.schema';

export interface SetupBriefState {
  status: 'idle' | 'success' | 'error';
  error?: string;
  profile?: SeoOnboardingProfile;
}

const FAILURE_MESSAGE = 'Your brief could not be saved.';

export async function submitSetupBrief(
  _prev: SetupBriefState,
  formData: FormData,
): Promise<SetupBriefState> {
  const parsed = setupBriefSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  const response = await serverApiFetch('/api/seo/onboarding/', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });
  if (!response.ok) {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  return { status: 'success', profile: (await response.json()) as SeoOnboardingProfile };
}

'use server';

import { serverApiFetch } from '@/lib/serverApi';
import type { DealerOnboardingProfile } from '@/lib/dealerApi';
import { dealerSetupSchema } from './DealerSetup.schema';

export interface DealerSetupState {
  status: 'idle' | 'success' | 'error';
  notice?: string;
  error?: string;
  profile?: DealerOnboardingProfile;
}

const FAILURE_MESSAGE = 'Your setup could not be saved.';

export async function submitDealerSetup(
  _prev: DealerSetupState,
  formData: FormData,
): Promise<DealerSetupState> {
  const parsed = dealerSetupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  const { intent, ...fields } = parsed.data;
  const upstream = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) upstream.set(key, value);
  }

  const patchResponse = await serverApiFetch('/api/dealers/onboarding/', {
    method: 'PATCH',
    body: upstream,
  });
  if (!patchResponse.ok) {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  let profile = (await patchResponse.json()) as DealerOnboardingProfile;

  if (intent === 'submit') {
    const submitResponse = await serverApiFetch('/api/dealers/onboarding/submit/', {
      method: 'POST',
    });
    if (!submitResponse.ok) {
      return { status: 'error', error: FAILURE_MESSAGE };
    }
    profile = (await submitResponse.json()) as DealerOnboardingProfile;
  }

  return {
    status: 'success',
    profile,
    notice:
      intent === 'submit'
        ? 'Your dealership details have been submitted for verification.'
        : 'Draft saved.',
  };
}

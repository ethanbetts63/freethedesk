'use server';

import { firstError } from '@/lib/api';
import { serverApiFetch } from '@/lib/serverApi';
import { unsubscribeSchema } from './Unsubscribe.schema';

export interface UnsubscribeState {
  status: 'idle' | 'success' | 'error';
  error?: string;
}

const GENERIC_FAILURE = 'We could not do that just now. Please try again.';

export async function submitUnsubscribe(
  _prev: UnsubscribeState,
  formData: FormData,
): Promise<UnsubscribeState> {
  const parsed = unsubscribeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? GENERIC_FAILURE };
  }

  let response: Response;
  try {
    response = await serverApiFetch(
      `/api/outreach/unsubscribe/${encodeURIComponent(parsed.data.token)}/`,
      { method: 'POST' },
    );
  } catch {
    return { status: 'error', error: GENERIC_FAILURE };
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    return { status: 'error', error: firstError(data, GENERIC_FAILURE) };
  }
  return { status: 'success' };
}

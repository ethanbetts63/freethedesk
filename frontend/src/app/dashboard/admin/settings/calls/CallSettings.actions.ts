'use server';

import { firstError } from '@/lib/api';
import type { CallSettings } from '@/lib/callsApi';
import { serverApiFetch } from '@/lib/serverApi';
import { callSettingsSchema } from './CallSettings.schema';

export interface CallSettingsState {
  status: 'idle' | 'success' | 'error';
  error?: string;
  settings?: CallSettings;
}

const FAILURE_MESSAGE = 'Call settings could not be saved.';

export async function submitCallSettings(
  _prev: CallSettingsState,
  formData: FormData,
): Promise<CallSettingsState> {
  const parsed = callSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  const response = await serverApiFetch('/api/admin/seo/calls/settings/', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { status: 'error', error: firstError(data, FAILURE_MESSAGE) };
  }
  return { status: 'success', settings: data as CallSettings };
}

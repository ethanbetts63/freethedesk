'use server';

import { firstError } from '@/lib/api';
import { SERVER_API_BASE_URL } from '@/lib/serverApi';
import { callRequestSchema } from './CallRequestForm.schema';

export interface CallRequestState {
  status: 'idle' | 'success' | 'error';
  error?: string;
}

const FAILURE_MESSAGE = "We couldn't send that. Please try again, or ring us.";

export async function submitCallRequest(
  _prev: CallRequestState,
  formData: FormData,
): Promise<CallRequestState> {
  const parsed = callRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  let response: Response;
  try {
    response = await fetch(`${SERVER_API_BASE_URL}/api/seo/calls/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    return { status: 'error', error: firstError(data, FAILURE_MESSAGE) };
  }
  return { status: 'success' };
}

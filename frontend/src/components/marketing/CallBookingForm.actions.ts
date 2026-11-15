'use server';

import { firstError } from '@/lib/api';
import { SERVER_API_BASE_URL } from '@/lib/serverApi';
import { callBookingSchema } from './CallBookingForm.schema';

export interface CallBookingState {
  status: 'idle' | 'success' | 'error';
  error?: string;
  /** The booked time in words, e.g. "Thursday 20 November, 10:30am (Perth time)". */
  label?: string;
  /** The time was taken by someone else first: the form reloads the times. */
  slotTaken?: boolean;
}

const FAILURE_MESSAGE = 'We could not book the call. Please try again, or ring us.';

export async function submitCallBooking(
  _prev: CallBookingState,
  formData: FormData,
): Promise<CallBookingState> {
  const parsed = callBookingSchema.safeParse(Object.fromEntries(formData));
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
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      status: 'error',
      error: firstError(data, FAILURE_MESSAGE),
      slotTaken: Boolean(data?.starts_at),
    };
  }
  return { status: 'success', label: data.label };
}

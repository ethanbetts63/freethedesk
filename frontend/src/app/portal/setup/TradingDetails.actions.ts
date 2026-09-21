'use server';

import { serverApiFetch } from '@/lib/serverApi';
import { firstError } from '@/lib/api';
import type { DealerTradingDetails } from '@/lib/dealerApi';
import { tradingDetailsSchema } from './TradingDetails.schema';

export interface TradingDetailsState {
  status: 'idle' | 'success' | 'error';
  notice?: string;
  error?: string;
  details?: DealerTradingDetails;
}

const FAILURE_MESSAGE = 'Your trading details could not be saved.';

export async function submitTradingDetails(
  _prev: TradingDetailsState,
  formData: FormData,
): Promise<TradingDetailsState> {
  const parsed = tradingDetailsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  const upstream = new FormData();
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) upstream.set(key, value);
  }

  const response = await serverApiFetch('/api/dealers/trading/', {
    method: 'PATCH',
    body: upstream,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    // The API's own message, because the two rules worth reporting — a BSB that
    // is not six digits, an account number with a letter in it — are ones the
    // dealer can fix, and "could not be saved" does not tell them how.
    return { status: 'error', error: firstError(body, FAILURE_MESSAGE) };
  }

  return {
    status: 'success',
    details: body as DealerTradingDetails,
    notice: 'Trading details saved.',
  };
}

'use server';

import { headers } from 'next/headers';

import { firstError } from '@/lib/api';
import { serverApiFetch } from '@/lib/serverApi';
import { packageOrderSchema } from './PackageOrderPanel.schema';

export interface PackageOrderState {
  status: 'idle' | 'success' | 'error';
  error?: string;
  /** What the payment page knows this order by: nobody signs in to buy. */
  reference?: string;
}

const FAILURE_MESSAGE = 'We could not save your order. Please try again.';

/**
 * Records the order and the terms ticked with it, at the admin's current price, and hands back
 * the reference the payment page charges against.
 */
export async function submitPackageOrder(
  _prev: PackageOrderState,
  formData: FormData,
): Promise<PackageOrderState> {
  const parsed = packageOrderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  let response: Response;
  try {
    response = await serverApiFetch('/api/package-orders/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // The terms are recorded with the order, and the evidence names the
        // customer's browser rather than this server.
        'User-Agent': (await headers()).get('user-agent') ?? '',
      },
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { status: 'error', error: FAILURE_MESSAGE };
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { status: 'error', error: firstError(data, FAILURE_MESSAGE) };
  }
  return { status: 'success', reference: data.reference };
}

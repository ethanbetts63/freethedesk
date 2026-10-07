'use server';

import { SERVER_API_BASE_URL } from '@/lib/serverApi';
import { packageOrderSchema } from './PackageOrderPanel.schema';

export interface PackageOrderState {
  status: 'idle' | 'success' | 'error';
  error?: string;
}

const FAILURE_MESSAGE = 'We could not send that. Please try again.';

/**
 * Records the order. Checkout is not built yet, so the backend saves it as an
 * enquiry at the admin's current price and staff send the invoice.
 */
export async function submitPackageOrder(
  _prev: PackageOrderState,
  formData: FormData,
): Promise<PackageOrderState> {
  const parsed = packageOrderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: 'error', error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  try {
    const response = await fetch(`${SERVER_API_BASE_URL}/api/package-orders/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      return { status: 'error', error: FAILURE_MESSAGE };
    }
  } catch {
    return { status: 'error', error: FAILURE_MESSAGE };
  }

  return { status: 'success' };
}

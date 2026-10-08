import { apiFetch, handleResponse } from '@freetheplatform/web-security';

import { postJson } from './api';
import type { PackageCode } from './servicePricing';

/** What the payment pages may know about an order from its reference: nothing about the buyer. */
export interface PackageOrderStatus {
  package: PackageCode;
  package_name: string;
  price: string;
  due_now: string;
  paid: boolean;
}

export interface PackageCheckout {
  client_secret: string;
  price: string;
  due_now: string;
  currency: string;
}

export async function getPackageOrderStatus(reference: string): Promise<PackageOrderStatus> {
  return handleResponse(await apiFetch(`/api/package-orders/${encodeURIComponent(reference)}/`));
}

/**
 * Opens checkout for what is due now, against the terms accepted with the order. Throws an
 * `ApiError` whose payload `code` is `offer_changed` when the price or terms moved since then,
 * or `active` when the order is already paid.
 */
export async function createPackageCheckout(reference: string): Promise<PackageCheckout> {
  return postJson('/api/payments/package-order/', { reference });
}

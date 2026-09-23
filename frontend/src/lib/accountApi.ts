import { handleResponse } from '@freetheplatform/web-security';

import { authedFetch } from './api';
import type { SaleStatus } from './dealerApi';

/**
 * The customer's account: their sales across every dealer.
 *
 * `authedFetch`, unlike `saleApi.ts`: this side authenticates with a real
 * session — the account is exactly the thing a sale's path-scoped cookie is
 * not — so it rides the shared refresh machinery like any portal call.
 */

export interface AccountSaleCard {
  reference: string;
  vehicle: string;
  colour: string;
  dealer_name: string;
  status: SaleStatus;
  status_label: string;
  created_at: string;
  /** Only cancellation closes access; a completed sale still opens. */
  is_closed: boolean;
}

export async function getAccountSales(): Promise<{ sales: AccountSaleCard[] }> {
  return handleResponse(await authedFetch('/api/account/sales/'));
}

/**
 * Trade the account session for this sale's own access cookie, so the sale
 * page opens exactly as it does from the emailed link.
 */
export async function openAccountSale(reference: string): Promise<void> {
  await handleResponse(
    await authedFetch(`/api/account/sales/${encodeURIComponent(reference)}/open/`, {
      method: 'POST',
    }),
  );
}

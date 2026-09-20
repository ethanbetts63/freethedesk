import { apiFetch } from '@freetheplatform/web-security';

import { downloadThrough } from './api';
import type {
  IdentitySide,
  SaleCondition,
  SaleDocumentRow,
  SaleIdentity,
  SaleStatus,
  SaleWarranty,
} from './dealerApi';
import { handleResponse } from '@freetheplatform/web-security';

/**
 * The customer's own side of a sale.
 *
 * Deliberately not `authedFetch`: there is no account and no JWT to refresh
 * here. What authenticates the caller is an httpOnly cookie scoped to this
 * sale's own API path, which the browser attaches on its own because every
 * request below is same-origin. Routing these through the authenticated client
 * would have it trying to refresh a session that does not exist and bouncing the
 * customer somewhere they cannot sign in to.
 */

export interface SaleRequirements {
  details_complete: boolean;
  identity_verified: boolean;
  warranty_acknowledged: boolean;
  documents_signed: boolean;
  customer_marked_paid: boolean;
  payment_confirmed: boolean;
  can_sign: boolean;
  can_open_payment: boolean;
  next_action: 'details' | 'verify' | 'sign' | 'payment' | 'done';
}

export interface CustomerSale {
  reference: string;
  status: SaleStatus;
  status_label: string;

  dealer_name: string;
  dealer_email: string;
  dealer_phone: string;

  condition: SaleCondition;
  make: string;
  model_name: string;
  year: number | null;
  colour: string;
  vin: string;
  engine_number: string;
  engine_capacity_cc: number | null;
  is_electric: boolean;
  odometer_km: number | null;
  registration: string;

  vehicle_price: string | null;
  delivery_fee: string;
  deposit_amount: string;
  balance_amount: string | null;
  total_amount: string | null;

  fulfilment_method: 'pickup' | 'delivery';
  delivery_address_line1: string;
  delivery_suburb: string;
  delivery_state: string;
  delivery_postcode: string;

  customer_name: string;
  customer_email: string;
  customer_phone: string;

  purchaser_is_licence_holder: boolean;
  purchaser_family_name: string;
  purchaser_given_names: string;
  purchaser_address_line1: string;
  purchaser_suburb: string;
  purchaser_postcode: string;

  licence_family_name: string;
  licence_given_names: string;
  licence_number: string;
  licence_date_of_birth: string | null;
  licensee_address_line1: string;
  licensee_suburb: string;
  licensee_postcode: string;
  kept_primarily_in_wa: boolean;

  licensed_to_company: boolean;
  company_name: string;
  company_acn: string;
  company_organisation_code: string;

  signed_at: string | null;
  accepted_at: string | null;
  customer_marked_paid_at: string | null;
  payment_confirmed_at: string | null;
  completed_at: string | null;

  requirements: SaleRequirements;
  documents: SaleDocumentRow[];
  warranty: SaleWarranty;
  identity: SaleIdentity;
  /** False once their checklist is empty — from then on a change is a
   * conversation with the dealer, who can still make it. */
  details_editable: boolean;
}

const base = (reference: string) => `/api/sales/${encodeURIComponent(reference)}`;

/** Spend the token in the emailed link for the long-lived access cookie. */
export async function redeemSale(reference: string, token: string): Promise<CustomerSale> {
  return handleResponse(
    await apiFetch(`${base(reference)}/redeem/`, {
      method: 'POST',
      body: JSON.stringify({ access_token: token }),
    }),
  );
}

/** Recovery on another device: the reference plus the emailed password. */
export async function loginToSale(reference: string, password: string): Promise<CustomerSale> {
  return handleResponse(
    await apiFetch(`${base(reference)}/login/`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
  );
}

export async function getCustomerSale(reference: string): Promise<CustomerSale> {
  return handleResponse(await apiFetch(`${base(reference)}/customer/`));
}

export async function saveSaleDetails(
  reference: string,
  values: Record<string, unknown>,
): Promise<CustomerSale> {
  return handleResponse(
    await apiFetch(`${base(reference)}/customer/details/`, {
      method: 'PATCH',
      body: JSON.stringify(values),
    }),
  );
}

export async function acknowledgeWarranty(
  reference: string,
  acknowledgementKey: string,
): Promise<CustomerSale> {
  return handleResponse(
    await apiFetch(`${base(reference)}/customer/warranty/`, {
      method: 'POST',
      body: JSON.stringify({ acknowledgement_key: acknowledgementKey }),
    }),
  );
}

export function customerDocumentUrl(reference: string, kind: string): string {
  return `${base(reference)}/customer/documents/${kind}/`;
}

export function customerWarrantyNoticeUrl(reference: string): string {
  return `${base(reference)}/customer/warranty-notice/`;
}

/** Fetch a document and hand it to the browser as a download. */
export async function downloadCustomerDocument(url: string, fallbackName: string): Promise<void> {
  return downloadThrough(apiFetch, url, fallbackName, 'That document is not ready yet.');
}

/* ---------------------------------------------------------------------------
 * Identity
 * ------------------------------------------------------------------------- */

export async function uploadIdentityImage(
  reference: string,
  side: IdentitySide,
  file: File,
): Promise<SaleIdentity> {
  const body = new FormData();
  body.set('image', file);
  // `apiFetch` leaves a FormData body's Content-Type alone, so the browser sets
  // the multipart boundary itself. Supplying one by hand produces a body the
  // server cannot parse.
  return handleResponse(
    await apiFetch(`${base(reference)}/customer/identity/${side}/`, { method: 'POST', body }),
  );
}

export async function submitIdentity(reference: string): Promise<CustomerSale> {
  return handleResponse(
    await apiFetch(`${base(reference)}/customer/identity/submit/`, { method: 'POST' }),
  );
}

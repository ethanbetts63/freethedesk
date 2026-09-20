import {
  authedFetch,
  downloadThrough,
  queryString,
  type AccountBase,
  type OnboardingStatus,
  type Paginated,
} from './api';

import type { DealerState } from './dealerStates';
import { handleResponse } from '@freetheplatform/web-security';

export type DealerPlanCode = 'licensing' | 'contracts' | 'complete';
export type DealerPaymentStatus = 'payment_pending' | 'active' | 'past_due' | 'cancelled';

export interface DealerAccount extends AccountBase {
  state: DealerState;
  state_label: string;
  plan: DealerPlanCode;
  payment_status: DealerPaymentStatus;
}

export interface SubscriptionCheckout {
  client_secret: string;
  monthly_price: string;
  currency: string;
}

export interface DealerOnboardingProfile {
  onboarding_status: OnboardingStatus;
  onboarding_status_label: string;
  legal_name: string;
  trading_name: string;
  dealer_licence_number: string;
  repairer_licence_number: string;
  organisation_code: string;
  abn: string;
  acn: string;
  address_line1: string;
  suburb: string;
  state: string;
  postcode: string;
  phone: string;
  email: string;
  authorised_officer_name: string;
  authorised_officer_licence_number: string;
  authorised_officer_date_of_birth: string | null;
  declared_at: string;
  dealer_licence_document_uploaded: boolean;
  authorised_officer_identity_document_uploaded: boolean;
  business_evidence_document_uploaded: boolean;
  submitted_at: string | null;
  updated_at: string;
}

export async function getDealerAccount(): Promise<DealerAccount> {
  return handleResponse(await authedFetch('/api/dealers/me/'));
}

export async function createSubscriptionCheckout(): Promise<SubscriptionCheckout> {
  return handleResponse(
    await authedFetch('/api/payments/subscription/', {
      method: 'POST',
      body: JSON.stringify({ accepted_terms: true }),
    }),
  );
}

export async function getDealerOnboarding(): Promise<DealerOnboardingProfile> {
  return handleResponse(await authedFetch('/api/dealers/onboarding/'));
}

/* ---------------------------------------------------------------------------
 * Sales
 *
 * The queue row and the sale page are two shapes on purpose: a table of forty
 * rows has no reason to hold forty licence numbers, and the API does not send
 * them. See `_docs/licensing/plan/04-dealer-portal.md`.
 * ------------------------------------------------------------------------- */

export type SaleStatus =
  | 'draft'
  | 'awaiting_customer'
  | 'awaiting_identity_review'
  | 'ready_to_sign'
  | 'signed'
  | 'accepted'
  | 'awaiting_payment'
  | 'payment_confirmed'
  | 'completed'
  | 'cancelled';

export type SaleCondition = 'new' | 'used' | 'demo';
export type SaleFulfilment = 'pickup' | 'delivery';
export type SaleVehicleClass = 'motorcycle' | 'moped';

/** Who the sale is waiting on. The only sort order the queue cares about. */
export type SaleWaitingOn = 'dealer' | 'customer' | 'nobody';

export interface SaleRow {
  reference: string;
  customer_name: string;
  vehicle: string;
  status: SaleStatus;
  status_label: string;
  waiting_on: SaleWaitingOn;
  waiting_for: string;
  vehicle_price: string | null;
  created_at: string;
  updated_at: string;
  signed_at: string | null;
}

export interface Sale extends SaleRow {
  documents: SaleDocumentRow[];
  warranty: SaleWarranty;
  identity: SaleIdentity;
  produces: DealerPlanCode;
  produces_label: string;
  source: string;
  total_amount: string | null;
  balance_amount: string | null;

  vehicle_class: SaleVehicleClass;
  condition: SaleCondition;
  make: string;
  model_name: string;
  year: number | null;
  body_type: string;
  colour: string;
  vin: string;
  engine_number: string;
  engine_capacity_cc: number | null;
  is_electric: boolean;
  odometer_km: number | null;
  registration: string;
  registration_expiry: string | null;
  registration_months_included: number | null;
  stock_number: string;
  rrp: string | null;

  delivery_fee: string;
  deposit_amount: string;

  customer_email: string;
  customer_phone: string;
  fulfilment_method: SaleFulfilment;
  delivery_address_line1: string;
  delivery_suburb: string;
  delivery_state: string;
  delivery_postcode: string;

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

  link_sent_at: string | null;
  details_updated_at: string | null;
  accepted_at: string | null;
  acceptance_notified_at: string | null;
  customer_marked_paid_at: string | null;
  payment_confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string;
}

export async function getSales(
  params: Record<string, string | number | undefined>,
): Promise<Paginated<SaleRow>> {
  return handleResponse(await authedFetch(`/api/sales/${queryString(params)}`));
}

export async function getSale(reference: string): Promise<Sale> {
  return handleResponse(await authedFetch(`/api/sales/${encodeURIComponent(reference)}/`));
}

export async function createSale(values: Record<string, unknown>): Promise<Sale> {
  return handleResponse(
    await authedFetch('/api/sales/', { method: 'POST', body: JSON.stringify(values) }),
  );
}

export async function updateSale(
  reference: string,
  values: Record<string, unknown>,
): Promise<Sale> {
  return handleResponse(
    await authedFetch(`/api/sales/${encodeURIComponent(reference)}/`, {
      method: 'PATCH',
      body: JSON.stringify(values),
    }),
  );
}

/* ---------------------------------------------------------------------------
 * Trading details and Special Conditions
 * ------------------------------------------------------------------------- */

export interface DealerTradingDetails {
  bank_account_name: string;
  bank_bsb: string;
  bank_account_number: string;
  signature_name: string;
  signature_image_uploaded: boolean;
  trading_hours_note: string;
  updated_at: string;
}

export interface SpecialConditionAddition {
  heading: string;
  paragraphs: string[];
}

export interface SpecialConditionDefault {
  number: string;
  heading: string;
  applies: string;
  /** SC2 and SC6 are false. The API refuses to switch them off either way. */
  removable: boolean;
  kept: boolean;
  paragraphs: string[];
  /** Only SC2 has one: the wording used when the purchaser is not the licence holder. */
  alternative_heading: string;
  alternative_paragraphs: string[];
}

export interface SpecialConditions {
  version: string;
  statement: string;
  conditions: SpecialConditionDefault[];
  additions: SpecialConditionAddition[];
}

export async function getDealerTrading(): Promise<DealerTradingDetails> {
  return handleResponse(await authedFetch('/api/dealers/trading/'));
}

export async function getSpecialConditions(): Promise<SpecialConditions> {
  return handleResponse(await authedFetch('/api/dealers/special-conditions/'));
}

export async function saveSpecialConditions(choices: {
  defaults: Record<string, boolean>;
  additions: SpecialConditionAddition[];
}): Promise<SpecialConditions> {
  return handleResponse(
    await authedFetch('/api/dealers/special-conditions/', {
      method: 'PUT',
      body: JSON.stringify(choices),
    }),
  );
}

/* ---------------------------------------------------------------------------
 * Documents
 * ------------------------------------------------------------------------- */

export interface SaleDocumentRow {
  kind: 'sale_contract' | 'licensing_form' | 'authority_to_lodge';
  label: string;
  signed: boolean;
  signed_at: string | null;
  signed_by_role: 'customer' | 'dealer' | '';
  signer_name: string;
  /** Signed before a detail on the sale changed, so it no longer matches it. */
  is_stale: boolean;
  template_version: string;
}

export interface SaleWarranty {
  kind: 'form_5a_motorcycle' | 'form_6' | 'manufacturer';
  title: string;
  summary: string;
  acknowledgement_key: string;
  acknowledged: boolean;
  acknowledged_at: string | null;
  statement: string;
}

/**
 * Fetch a document and hand it to the browser as a download.
 *
 * Through `authedFetch` rather than as a plain `<a href>` so it rides the same
 * single-flight token refresh as every other call. A bare link with an expired
 * access token renders a JSON error where the dealer expected a PDF.
 */
export async function downloadDocument(url: string, fallbackName: string): Promise<void> {
  return downloadThrough(authedFetch, url, fallbackName, 'That document could not be produced.');
}

export function saleDocumentUrl(reference: string, kind: string, signed = false): string {
  const base = `/api/sales/${encodeURIComponent(reference)}/documents/${kind}/`;
  return signed ? `${base}?version=signed` : base;
}

export function saleWarrantyNoticeUrl(reference: string): string {
  return `/api/sales/${encodeURIComponent(reference)}/warranty-notice/`;
}

/* ---------------------------------------------------------------------------
 * Identity
 * ------------------------------------------------------------------------- */

export type IdentitySide = 'front' | 'back' | 'selfie';
export type IdentityImageStatus = 'missing' | 'submitted' | 'approved' | 'rejected';

export interface IdentityImage {
  side: IdentitySide;
  /** A sentence, not a field name — it is shown to the customer too. */
  label: string;
  status: IdentityImageStatus;
  uploaded: boolean;
  reason: string;
}

export interface SaleIdentity {
  status: 'pending' | 'submitted' | 'verified' | 'rejected';
  status_label: string;
  is_verified: boolean;
  rejection_reason: string;
  submitted_at: string | null;
  verified_at: string | null;
  images: IdentityImage[];
  /** What the customer still has to send, already written as sentences. */
  outstanding: string[];
}

export function identityImageUrl(reference: string, side: IdentitySide): string {
  return `/api/sales/${encodeURIComponent(reference)}/identity/${side}/`;
}

export async function reviewIdentityImage(
  reference: string,
  side: IdentitySide,
  verdict: { approved: boolean; reason?: string },
): Promise<Sale> {
  return handleResponse(
    await authedFetch(`/api/sales/${encodeURIComponent(reference)}/identity/${side}/review/`, {
      method: 'POST',
      body: JSON.stringify(verdict),
    }),
  );
}

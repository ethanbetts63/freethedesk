import { authedFetch, postJson, type AccountBase } from './api';
import { apiFetch, handleResponse } from '@freetheplatform/web-security';

/** The audit the customer buys: one report, at one of three tiers. */
export type SeoPlanCode = 'essentials' | 'plus' | 'complete';
/** Sold before 24 October 2026; an older account may still carry one. */
export type RetiredSeoPlanCode = 'monthly' | 'quarterly' | 'yearly' | 'oneoff';
export type SeoPaymentStatus =
  | 'payment_pending'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'paid'
  /** An affiliate's free audit: nothing to pay, counts as paid for access. */
  | 'complimentary';

export interface SeoAccount extends AccountBase {
  website: string;
  plan: SeoPlanCode | RetiredSeoPlanCode;
  payment_status: SeoPaymentStatus;
}

/** Where a signup's payment stands, read by its checkout reference before any login exists. */
export interface SeoCheckoutStatus {
  plan: SeoPlanCode | RetiredSeoPlanCode;
  payment_status: SeoPaymentStatus;
  paid: boolean;
}

export interface SeoCheckout {
  client_secret: string;
  price: string;
  currency: string;
  /** What checkout calls it: "Plus SEO audit". */
  product_name: string;
  /** The affiliate code the signup carries, or empty. */
  discount_code: string;
  /** What the code takes off `price`, and what Stripe charges after it. */
  discount_amount: string;
  total: string;
}

export type SeoSetupKey =
  | 'search_console'
  | 'google_analytics'
  | 'business_profile'
  | 'google_ads'
  | 'clarity'
  | 'enquiries';

export type SeoSetupState = 'not_started' | 'marked_done' | 'confirmed';

export interface SeoSetupStep {
  key: SeoSetupKey;
  label: string;
  state: SeoSetupState;
  state_label: string;
  required: boolean;
  detail: string;
  marked_done_at: string | null;
  confirmed_at: string | null;
}

export interface SeoSetup {
  steps: SeoSetupStep[];
  /** Every required step confirmed: reporting has started. */
  complete: boolean;
}

export async function getSeoAccount(): Promise<SeoAccount> {
  return handleResponse(await authedFetch('/api/seo/me/'));
}

export async function getSeoCheckoutStatus(reference: string): Promise<SeoCheckoutStatus> {
  return handleResponse(await apiFetch(`/api/seo/checkout/${encodeURIComponent(reference)}/`));
}

/**
 * Opens checkout against the terms accepted at signup. Throws an `ApiError`
 * whose payload `code` is `account_exists` for an email that already has an
 * account, or `offer_changed` when the price or terms moved since signup.
 */
export async function createSeoCheckout(reference: string): Promise<SeoCheckout> {
  return postJson('/api/payments/seo-checkout/', { reference });
}

export async function getSeoSetup(): Promise<SeoSetup> {
  return handleResponse(await authedFetch('/api/seo/setup/'));
}

export async function markSeoSetupStep(key: SeoSetupKey, done: boolean): Promise<SeoSetup> {
  return handleResponse(
    await authedFetch(`/api/seo/setup/${key}/mark/`, {
      method: 'POST',
      body: JSON.stringify({ done }),
    }),
  );
}

import { authedFetch, type AccountBase } from './api';
import { handleResponse } from '@freetheplatform/web-security';

/** Signup offers monthly or oneoff; the slower cadences are reached later. */
export type SeoPlanCode = 'monthly' | 'bimonthly' | 'quarterly' | 'biannual' | 'oneoff';
export type SeoPaymentStatus = 'payment_pending' | 'active' | 'past_due' | 'cancelled' | 'paid';

export interface SeoAccount extends AccountBase {
  website: string;
  plan: SeoPlanCode;
  payment_status: SeoPaymentStatus;
}

export interface SeoCheckout {
  client_secret: string;
  price: string;
  currency: string;
  cadence_label: string;
  mode: 'subscription' | 'payment';
}

export interface SeoOnboardingProfile {
  business_name: string;
  email: string;
  website_url: string;
  /** Written by the Search Console check, never by the customer. */
  search_console_property: string;
  primary_location: string;
  target_keywords: string;
  competitors: string;
  google_business_profile_url: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type SeoOnboardingChanges = Partial<
  Pick<
    SeoOnboardingProfile,
    | 'website_url'
    | 'primary_location'
    | 'target_keywords'
    | 'competitors'
    | 'google_business_profile_url'
    | 'notes'
  >
>;

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
  /** Our service account can verify this one itself. */
  checkable: boolean;
  detail: string;
  marked_done_at: string | null;
  confirmed_at: string | null;
}

export interface SeoSetup {
  steps: SeoSetupStep[];
  /** Every required step confirmed: reporting has started. */
  complete: boolean;
}

/** `unavailable`: the check couldn't run, which says nothing about the setup. */
export type SeoSetupCheckResult = 'confirmed' | 'not_found' | 'unavailable';

export async function getSeoAccount(): Promise<SeoAccount> {
  return handleResponse(await authedFetch('/api/seo/me/'));
}

export async function createSeoCheckout(): Promise<SeoCheckout> {
  return handleResponse(
    await authedFetch('/api/payments/seo-subscription/', {
      method: 'POST',
      body: JSON.stringify({ accepted_terms: true }),
    }),
  );
}

export async function getSeoOnboarding(): Promise<SeoOnboardingProfile> {
  return handleResponse(await authedFetch('/api/seo/onboarding/'));
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

export async function checkSeoSetupStep(
  key: SeoSetupKey,
): Promise<SeoSetup & { result: SeoSetupCheckResult }> {
  return handleResponse(await authedFetch(`/api/seo/setup/${key}/check/`, { method: 'POST' }));
}

import { authedFetch, jsonOrError, type AccountBase, type OnboardingStatus } from "./api";

import type { DealerState } from "./dealerStates";

export type DealerPlanCode = "licensing" | "contracts" | "complete";
export type DealerPaymentStatus = "payment_pending" | "active" | "past_due" | "cancelled";

/** A dealer's own account: the shared account fields plus what licensing adds. */
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
  terms_version: string;
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

export type DealerAccountChanges = Partial<Pick<DealerAccount, "business_name" | "contact_name" | "phone" | "state">>;

export async function getDealerAccount(): Promise<DealerAccount> {
  return jsonOrError(await authedFetch("/api/dealers/me/"));
}

export async function updateDealerAccount(changes: DealerAccountChanges): Promise<DealerAccount> {
  return jsonOrError(
    await authedFetch("/api/dealers/me/", {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),
  );
}

export async function createSubscriptionCheckout(): Promise<SubscriptionCheckout> {
  return jsonOrError(
    await authedFetch("/api/payments/subscription/", {
      method: "POST",
      body: JSON.stringify({ accepted_terms: true }),
    }),
  );
}

export async function getDealerOnboarding(): Promise<DealerOnboardingProfile> {
  return jsonOrError(await authedFetch("/api/dealers/onboarding/"));
}

export async function updateDealerOnboarding(form: FormData): Promise<DealerOnboardingProfile> {
  return jsonOrError(await authedFetch("/api/dealers/onboarding/", { method: "PATCH", body: form }));
}

export async function submitDealerOnboarding(): Promise<DealerOnboardingProfile> {
  return jsonOrError(await authedFetch("/api/dealers/onboarding/submit/", { method: "POST" }));
}

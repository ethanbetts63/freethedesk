import { authedFetch, jsonOrError, type AccountBase, type OnboardingStatus } from "./api";

export type SeoPlanCode = "monthly" | "quarterly" | "biannual" | "oneoff";
export type SeoPaymentStatus = "payment_pending" | "active" | "past_due" | "cancelled" | "paid";

/** An SEO customer's own account: the shared account fields plus what SEO adds. */
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
  mode: "subscription" | "payment";
  terms_version: string;
}

export interface SeoOnboardingProfile {
  onboarding_status: OnboardingStatus;
  onboarding_status_label: string;
  business_name: string;
  email: string;
  website_url: string;
  search_console_property: string;
  primary_location: string;
  target_keywords: string;
  competitors: string;
  google_business_profile_url: string;
  notes: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SeoAccountChanges = Partial<Pick<SeoAccount, "business_name" | "contact_name" | "phone" | "website">>;

export type SeoOnboardingChanges = Partial<
  Pick<
    SeoOnboardingProfile,
    | "website_url"
    | "search_console_property"
    | "primary_location"
    | "target_keywords"
    | "competitors"
    | "google_business_profile_url"
    | "notes"
  >
>;

export async function getSeoAccount(): Promise<SeoAccount> {
  return jsonOrError(await authedFetch("/api/seo/me/"));
}

export async function updateSeoAccount(changes: SeoAccountChanges): Promise<SeoAccount> {
  return jsonOrError(
    await authedFetch("/api/seo/me/", {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),
  );
}

export async function createSeoCheckout(): Promise<SeoCheckout> {
  return jsonOrError(
    await authedFetch("/api/payments/seo-subscription/", {
      method: "POST",
      body: JSON.stringify({ accepted_terms: true }),
    }),
  );
}

export async function getSeoOnboarding(): Promise<SeoOnboardingProfile> {
  return jsonOrError(await authedFetch("/api/seo/onboarding/"));
}

export async function updateSeoOnboarding(changes: SeoOnboardingChanges): Promise<SeoOnboardingProfile> {
  return jsonOrError(
    await authedFetch("/api/seo/onboarding/", {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),
  );
}

export async function submitSeoOnboarding(): Promise<SeoOnboardingProfile> {
  return jsonOrError(await authedFetch("/api/seo/onboarding/submit/", { method: "POST" }));
}

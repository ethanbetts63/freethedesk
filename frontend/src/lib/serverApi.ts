import type { PublicSiteSettings } from "./api";

const PRICE_FIELDS = [
  "licensing_price",
  "contracts_price",
  "complete_price",
  "seo_monthly_price",
  "seo_quarterly_price",
  "seo_biannual_price",
  "seo_oneoff_price",
  "gbp_audit_price",
] as const satisfies readonly (keyof PublicSiteSettings)[];

/**
 * Pricing is read fresh on every request rather than cached, so a change in the
 * admin is live immediately. The pages that call it therefore never prerender;
 * their route files set `dynamic = "force-dynamic"` to make that explicit rather
 * than leaving it implied by this fetch option.
 *
 * Throws rather than falling back. There used to be a table of "0.00" defaults
 * here so a hiccup could not take /seo and /licensing down, but rendering a
 * plausible-looking wrong price is worse than a 500: those prices reach the page
 * as advertised amounts and get published into Offer structured data, where
 * Google caches them. A failed render is visible and recoverable; a $0.00 price
 * quoted to a customer is neither.
 */
export async function getSiteSettingsServer(): Promise<PublicSiteSettings> {
  const base = process.env.DJANGO_API_URL ?? "http://127.0.0.1:8000";
  const response = await fetch(`${base}/api/site-settings/`, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    throw new Error(`Site settings request failed with ${response.status}.`);
  }

  const settings = (await response.json()) as PublicSiteSettings;
  // A partial payload would otherwise render as "undefined" - the same class of
  // silently-wrong price the fallback used to cause.
  const missing = PRICE_FIELDS.filter((field) => !settings[field]);
  if (missing.length) {
    throw new Error(`Site settings response is missing pricing: ${missing.join(", ")}.`);
  }
  return settings;
}

export { formatPrice } from "./api";

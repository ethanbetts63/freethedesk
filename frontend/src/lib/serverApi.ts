import type { PublicSiteSettings } from "./api";

/**
 * Pricing is read fresh on every request rather than cached, so a change in the
 * admin is live immediately. This also means the pages that call it never
 * prerender, which is deliberate: the production build no longer fails when the
 * Django API is unreachable. Their route files set `dynamic = "force-dynamic"`
 * to make that explicit rather than leaving it implied by this fetch option.
 */

/**
 * Shown when the API cannot be reached. A page rendering slightly stale prices
 * is a far better outcome than a 500: previously any hiccup fetching settings
 * took the whole of /seo and /licensing down. Keep these in step with the
 * admin defaults; they are a floor, not a source of truth.
 */
const FALLBACK_SETTINGS: PublicSiteSettings = {
  licensing_price: "0.00",
  contracts_price: "0.00",
  complete_price: "0.00",
  seo_monthly_price: "0.00",
  seo_quarterly_price: "0.00",
  seo_biannual_price: "0.00",
  seo_oneoff_price: "0.00",
  gbp_audit_price: "0.00",
  updated_at: "",
};

export async function getSiteSettingsServer(): Promise<PublicSiteSettings> {
  const base = process.env.DJANGO_API_URL ?? "http://127.0.0.1:8000";
  try {
    const response = await fetch(`${base}/api/site-settings/`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      throw new Error(`Site settings request failed with ${response.status}.`);
    }
    return { ...FALLBACK_SETTINGS, ...(await response.json()) };
  } catch (reason) {
    // Logged, not thrown: the page must still render.
    console.error("[serverApi] site settings unavailable, using fallback pricing:", reason);
    return FALLBACK_SETTINGS;
  }
}

export { formatPrice } from "./api";

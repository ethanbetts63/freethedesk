import type { PublicSiteSettings } from "./api";

/**
 * Server-side read of SiteSettings, so pages can render prices into static HTML
 * instead of fetching them in the browser. Revalidates every 5 minutes.
 *
 * Deliberately throws rather than falling back to hardcoded prices: showing a
 * stale or invented price is worse than the page failing loudly.
 *
 * Client components should use getSiteSettings from ./api instead.
 */
export async function getSiteSettingsServer(): Promise<PublicSiteSettings> {
  const base = process.env.DJANGO_API_URL ?? "http://127.0.0.1:8000";
  const response = await fetch(`${base}/api/site-settings/`, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error(`Site settings request failed with ${response.status}.`);
  return response.json();
}

export function formatPrice(value: string): string {
  return `$${Number(value).toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

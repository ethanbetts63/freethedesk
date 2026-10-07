import {
  clientIpFrom,
  serverApiFetch as sharedServerApiFetch,
} from '@freetheplatform/web-security';
import { cookies, headers } from 'next/headers';
import type { PublicSiteSettings } from './api';

export const SERVER_API_BASE_URL = process.env.DJANGO_API_URL ?? 'http://127.0.0.1:8000';

/**
 * The authenticated reader for a Server Action. The request policy is the
 * shared one; what is local is the base URL and reading Next's cookie store.
 */
/**
 * Django's session cookies, and nothing else.
 *
 * Without this the whole jar goes: analytics, consent flags, and anything else
 * the origin holds, none of which Django reads. `csrftoken` is always
 * forwarded by the shared helper.
 */
const SESSION_COOKIES = ['freethedesk_access', 'freethedesk_refresh'];

export async function serverApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const incoming = await headers();
  return sharedServerApiFetch(`${SERVER_API_BASE_URL}${path}`, await cookies(), init, {
    forwardCookies: SESSION_COOKIES,
    // Without it, Django's CSRF check refuses every HTTPS write (no Origin, no Referer).
    origin: incoming.get('origin'),
    // Otherwise Django sees Vercel's egress address; sent with FTP_PROXY_SECRET.
    clientIp: clientIpFrom(incoming),
  });
}

/** What /licensing and /seo sell online. */
const CHECKOUT_PRICE_FIELDS = [
  'licensing_price',
  'contracts_price',
  'complete_price',
  'seo_monthly_price',
  'seo_quarterly_price',
  'seo_yearly_price',
  'seo_oneoff_price',
] as const satisfies readonly (keyof PublicSiteSettings)[];

/**
 * What the pricing and website development pages quote. Separate from the checkout prices so a frontend
 * that reaches production before the backend migration fails only the pages
 * that need these, not the two that take payments.
 */
export const SERVICE_PRICE_FIELDS = [
  'hourly_rate',
  'discovery_hours',
  'website_small_pages',
  'website_small_page_price',
  'website_large_pages',
  'website_large_page_price',
  'automation_from_price',
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
export async function getSiteSettingsServer(
  required: readonly (keyof PublicSiteSettings)[] = CHECKOUT_PRICE_FIELDS,
): Promise<PublicSiteSettings> {
  const response = await fetch(`${SERVER_API_BASE_URL}/api/site-settings/`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    throw new Error(`Site settings request failed with ${response.status}.`);
  }

  const settings = (await response.json()) as PublicSiteSettings;
  // A partial payload would otherwise render as "undefined" - the same class of
  // silently-wrong price the fallback used to cause.
  const missing = required.filter((field) => !settings[field]);
  if (missing.length) {
    throw new Error(`Site settings response is missing pricing: ${missing.join(', ')}.`);
  }
  return settings;
}

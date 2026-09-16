import { cookies } from 'next/headers';
import type { PublicSiteSettings } from './api';

export const SERVER_API_BASE_URL = process.env.DJANGO_API_URL ?? 'http://127.0.0.1:8000';

const SAFE_METHODS = /^(GET|HEAD|OPTIONS|TRACE)$/i;

/**
 * The authenticated equivalent of api.ts's client-side fetch wrapper, for use
 * inside a Server Action. A Server Action runs on the Next server, not the
 * browser, so it can't ride the browser's automatic same-origin cookie/CSRF
 * forwarding - it has to read the incoming request's cookies itself and
 * attach them to a direct call to Django, the same way `getSiteSettingsServer`
 * below already calls Django directly rather than through a browser rewrite.
 *
 * Deliberately does not retry on 401 with a refreshed token - that would mean
 * writing a refreshed cookie back out from inside a Server Action, a
 * meaningfully bigger piece of plumbing. An expired access token here
 * surfaces as a failed submission, not a silent retry.
 */
export async function serverApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies();
  const method = init.method ?? 'GET';

  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  headers['Cookie'] = cookieStore.toString();

  if (!SAFE_METHODS.test(method)) {
    const csrfToken = cookieStore.get('csrftoken')?.value;
    if (csrfToken) headers['X-CSRFToken'] = csrfToken;
  }

  return fetch(`${SERVER_API_BASE_URL}${path}`, {
    ...init,
    headers,
    signal: init.signal ?? AbortSignal.timeout(15000),
  });
}

const PRICE_FIELDS = [
  'licensing_price',
  'contracts_price',
  'complete_price',
  'seo_monthly_price',
  'seo_quarterly_price',
  'seo_biannual_price',
  'seo_oneoff_price',
  'gbp_audit_price',
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
  const missing = PRICE_FIELDS.filter((field) => !settings[field]);
  if (missing.length) {
    throw new Error(`Site settings response is missing pricing: ${missing.join(', ')}.`);
  }
  return settings;
}

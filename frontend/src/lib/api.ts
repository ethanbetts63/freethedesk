import { createAuthedFetch, apiFetch } from '@freetheplatform/web-security';

export const AUTH_FAILURE_EVENT = 'auth-failure';

export type Role = 'staff' | 'dealer' | 'seo' | 'none';
export type DealerStatus = 'pending' | 'active' | 'suspended' | 'denied';

export interface PrincipalDealer {
  id: number;
  business_name: string;
  contact_name: string;
  status: DealerStatus;
  status_label: string;
}

export type PrincipalSeo = PrincipalDealer;

export interface Principal {
  id: number;
  username: string;
  email: string;
  role: Role;
  dealer: PrincipalDealer | null;
  seo: PrincipalSeo | null;
  /** Set when the password was chosen by somebody other than its owner. The API
   * computes it; every portal sends them here until they have changed it. */
  must_change_password: boolean;
}

/** Where somebody with `must_change_password` is held until they have. */
export const CHANGE_PASSWORD_PATH = '/change-password';

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AccountBase {
  id: number;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  plan_label: string;
  payment_status_label: string;
  subscription_current_period_end: string | null;
  cancel_at_period_end: boolean;
  status: DealerStatus;
  status_label: string;
  created_at: string;
  updated_at: string;
}

export type OnboardingStatus = 'not_started' | 'in_progress' | 'submitted';

export interface StaffAccountFields {
  staff_notes: string;
  status_changed_at: string | null;
}

/**
 * The site's request policy. The deadline, the CSRF header, the JSON
 * content-type and the single-flight refresh all live in the shared package;
 * what is local is where a refresh is POSTed and what the end of a session
 * means to this app.
 */
export const { authedFetch } = createAuthedFetch({
  onAuthFailure: () => window.dispatchEvent(new Event(AUTH_FAILURE_EVENT)),
});

export function firstError(data: unknown, fallback = 'Request failed'): string {
  if (typeof data !== 'object' || data === null) return fallback;
  const body = data as Record<string, unknown>;
  if (typeof body.detail === 'string') return body.detail;
  const value = Object.values(body).flat()[0];
  return typeof value === 'string' ? value : fallback;
}

export async function jsonOrError<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(firstError(data));
  return data as T;
}

export function queryString(values: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'all') query.set(key, String(value));
  });
  return query.size ? `?${query}` : '';
}

export async function login(identifier: string, password: string): Promise<Principal> {
  const response = await apiFetch('/api/token/', {
    method: 'POST',
    body: JSON.stringify({ username: identifier, password }),
  });
  return jsonOrError<Principal>(response);
}

export async function logout(): Promise<void> {
  await jsonOrError<void>(await apiFetch('/api/token/logout/', { method: 'POST' }));
}

export async function getProfile(): Promise<Principal> {
  return jsonOrError(await authedFetch('/api/auth/me/'));
}

/** Ask for a reset link. Always resolves: the API answers the same for an
 * address it knows and one it does not, and the UI must not undo that. */
export async function requestPasswordReset(email: string): Promise<void> {
  await apiFetch('/api/auth/password/reset/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/** Spend a reset link on a new password. Throws the API's message on a link that
 * has expired, been used, or was never real. */
export async function confirmPasswordReset(
  uid: string,
  token: string,
  newPassword: string,
): Promise<void> {
  await jsonOrError(
    await apiFetch('/api/auth/password/reset/confirm/', {
      method: 'POST',
      body: JSON.stringify({ uid, token, new_password: newPassword }),
    }),
  );
}

/** Change your own password. The current one is required: without it a stolen
 * session could take the account permanently. */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await jsonOrError(
    await authedFetch('/api/auth/password/change/', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),
  );
}

/** The portal home for a signed-in principal.
 *
 * A password somebody else chose is the one thing that comes before the portal.
 * Routing it here rather than in each shell means a new portal inherits the gate
 * instead of having to remember it.
 */
export function homeFor(user: Principal): string {
  if (user.must_change_password) return CHANGE_PASSWORD_PATH;
  if (user.role === 'staff') return '/dashboard/enquiries';
  if (user.role === 'seo') return '/seo-portal';
  return '/portal';
}

export interface PublicSiteSettings {
  licensing_price: string;
  contracts_price: string;
  complete_price: string;
  seo_monthly_price: string;
  seo_quarterly_price: string;
  seo_biannual_price: string;
  seo_oneoff_price: string;
  gbp_audit_price: string;
  updated_at: string;
}

/** Every SiteSettings key holding a price (all but the timestamp). */
export type PriceField = Exclude<keyof PublicSiteSettings, 'updated_at'>;

/** Unauthenticated; powers the public licensing and SEO pricing pages. */
export async function getSiteSettings(): Promise<PublicSiteSettings> {
  return jsonOrError(await apiFetch('/api/site-settings/'));
}

/** Unauthenticated JSON POST (signup, enquiry). Throws the API's own message. */
export async function postJson<T = unknown>(url: string, payload: object): Promise<T> {
  return jsonOrError<T>(
    await apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  );
}

const SCHEME = /^([a-z][a-z0-9+.-]*):\/\//i;

/**
 * People type "www.example.com.au" far more often than a full scheme, which the
 * url input and the backend's URLField both reject; prepend https:// so the
 * common case submits. Only http(s) pass through — anything else is dropped,
 * since the value ends up rendered as a link in the admin.
 */
export function normaliseWebsiteUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const match = SCHEME.exec(trimmed);
  if (!match) return `https://${trimmed.replace(/^\/+/, '')}`;
  const protocol = match[1].toLowerCase();
  if (protocol === 'http' || protocol === 'https') return trimmed;
  return `https://${trimmed.slice(match[0].length).replace(/^\/+/, '')}`;
}

/**
 * Server-stored values are untrusted by the time they reach an href. Returns the
 * value only if it parses as an http(s) URL, so a hostile scheme renders as text.
 */
export function safeWebsiteHref(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

export type ProjectType = 'website' | 'automation' | 'both';

/**
 * Fetch a file and hand it to the browser as a download.
 *
 * Parameterised by its fetch function rather than written once per portal: the
 * dealer's side goes through `authedFetch` (so it rides the single-flight token
 * refresh) and the customer's through `apiFetch` (there is no session to
 * refresh, only a path-scoped cookie). Everything after that — the error
 * sentence, the filename, the object URL — was identical in both copies, and
 * the copies had already drifted: only one of them read the filename the server
 * sent.
 */
export async function downloadThrough(
  fetcher: (url: string) => Promise<Response>,
  url: string,
  fallbackName: string,
  failureMessage: string,
): Promise<void> {
  const response = await fetcher(url);
  if (!response.ok) {
    throw new Error(firstError(await response.json().catch(() => ({})), failureMessage));
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filenameFrom(response.headers.get('Content-Disposition')) ?? fallbackName;
    link.click();
  } finally {
    // Revoked immediately: the click has already started the download, and an
    // object URL left behind pins the whole blob in memory for the life of the
    // page — which here is a PDF carrying a licence number.
    URL.revokeObjectURL(objectUrl);
  }
}

function filenameFrom(disposition: string | null): string | null {
  const match = disposition?.match(/filename="([^"]+)"/);
  return match ? match[1] : null;
}

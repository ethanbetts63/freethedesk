export const SESSION_FLAG = 'hasSession';
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
}

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

const API_TIMEOUT_MS = 15_000;
const SAFE_METHOD = /^(GET|HEAD|OPTIONS|TRACE)$/i;

function csrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return value ? decodeURIComponent(value) : null;
}

/** Shared browser request policy for the same-origin Django API. */
async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!SAFE_METHOD.test(options.method ?? 'GET')) {
    const token = csrfToken();
    if (token) headers.set('X-CSRFToken', token);
  }

  try {
    return await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
      signal: options.signal ?? AbortSignal.timeout(API_TIMEOUT_MS),
    });
  } catch (reason) {
    if (
      reason instanceof DOMException &&
      (reason.name === 'TimeoutError' || reason.name === 'AbortError')
    ) {
      throw new Error('The request timed out. Please try again.');
    }
    throw reason;
  }
}

function endSession(): void {
  localStorage.removeItem(SESSION_FLAG);
  window.dispatchEvent(new Event(AUTH_FAILURE_EVENT));
}

let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshInFlight ??= apiFetch('/api/token/refresh/', { method: 'POST' })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

export async function authedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await apiFetch(url, options);
  if (response.status !== 401) return response;

  if (!(await refreshSession())) {
    endSession();
    return response;
  }

  const retried = await apiFetch(url, options);
  if (retried.status === 401) endSession();
  return retried;
}

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

/** The portal home for a signed-in principal. */
export function homeFor(user: Principal): string {
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

export function formatPrice(value: string): string {
  const amount = Number(value);
  if (!value?.trim() || !Number.isFinite(amount)) return '—';
  return `$${amount.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDateTime(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Australia/Perth',
  });
}

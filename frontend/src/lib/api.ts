/** Shared API primitives for both portals. Staff calls live in adminApi.ts, dealer calls in dealerApi.ts. */

export const SESSION_FLAG = "hasSession";
export const AUTH_FAILURE_EVENT = "auth-failure";

export type Role = "staff" | "dealer" | "seo" | "none";
export type DealerStatus = "pending" | "active" | "suspended" | "denied";

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
  is_staff: boolean;
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

/**
 * Fields every subscriber account carries, whichever product it is on. The
 * dealer and SEO accounts extend this with their own plan/payment unions; the
 * staff-facing versions add `StaffAccountFields` on top. This mirrors the
 * backend, where each admin serializer is the self serializer plus those two
 * staff-only fields.
 */
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

/** The two fields only staff see, added by every admin serializer. */
export interface StaffAccountFields {
  staff_notes: string;
  status_changed_at: string | null;
}

function csrfToken(): string | null {
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];
  return value ? decodeURIComponent(value) : null;
}

function endSession(): void {
  localStorage.removeItem(SESSION_FLAG);
  window.dispatchEvent(new Event(AUTH_FAILURE_EVENT));
}

/**
 * One shared refresh per burst of 401s. Pages that load several resources at
 * once (the enquiry detail view fetches the enquiry and its messages together)
 * would otherwise each POST their own refresh and race to rotate the cookie.
 */
let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshInFlight ??= fetch("/api/token/refresh/", { method: "POST", credentials: "include" })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

export async function authedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const request = { ...options, credentials: "include" as RequestCredentials };
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(options.method ?? "GET")) {
    const token = csrfToken();
    if (token) headers.set("X-CSRFToken", token);
  }
  request.headers = headers;

  const response = await fetch(url, request);
  if (response.status !== 401) return response;

  if (!(await refreshSession())) {
    endSession();
    return response;
  }

  // A retry that still 401s means the session is genuinely finished (the
  // account was suspended mid-session, say) — end it rather than leaving the
  // caller to render a bare error on a page it can no longer load.
  const retried = await fetch(url, request);
  if (retried.status === 401) endSession();
  return retried;
}

/**
 * The first human-readable message in a DRF error body. Field errors arrive as
 * `{ email: ["Already registered."] }`, so the first value has to be unwrapped
 * before it is used — otherwise the array stringifies into the message.
 */
export function firstError(data: unknown, fallback = "Request failed"): string {
  if (typeof data !== "object" || data === null) return fallback;
  const body = data as Record<string, unknown>;
  if (typeof body.detail === "string") return body.detail;
  const value = Object.values(body).flat()[0];
  return typeof value === "string" ? value : fallback;
}

export async function jsonOrError<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(firstError(data));
  return data as T;
}

export function queryString(values: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") query.set(key, String(value));
  });
  return query.size ? `?${query}` : "";
}

export async function login(identifier: string, password: string): Promise<Principal> {
  const response = await fetch("/api/token/", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: identifier, password }),
  });
  return jsonOrError<Principal>(response);
}

export async function logout(): Promise<void> {
  await fetch("/api/token/logout/", { method: "POST", credentials: "include" });
}

export async function getProfile(): Promise<Principal> {
  return jsonOrError(await authedFetch("/api/auth/me/"));
}

/** The portal home for a signed-in principal. */
export function homeFor(user: Principal): string {
  if (user.role === "staff") return "/dashboard/enquiries";
  if (user.role === "seo") return "/seo-portal";
  return "/portal";
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
  ai_readiness_audit_price: string;
  updated_at: string;
}

/** Every SiteSettings key that holds a price, i.e. everything but the timestamp. */
export type PriceField = Exclude<keyof PublicSiteSettings, "updated_at">;

/** Unauthenticated: powers the public licensing and SEO pricing pages, no cookies required. */
export async function getSiteSettings(): Promise<PublicSiteSettings> {
  return jsonOrError(await fetch("/api/site-settings/"));
}

/**
 * The one enquiry submission path, shared by the contact form, the website
 * builder and anything else that opens a lead. `help_with` is typed against the
 * backend's choices so an option that the API would reject cannot be sent.
 */
export type HelpWith = "website" | "website_builder" | "inventory" | "automation" | "everything" | "unsure";

export interface EnquiryPayload {
  name: string;
  email: string;
  message: string;
  help_with: HelpWith;
  business?: string;
  phone?: string;
  website?: string;
  configuration?: object;
  /** Honeypot. Bots fill it in; the API quietly discards those submissions. */
  company_website?: string;
}

/** An unauthenticated JSON POST — signup and enquiry endpoints. Throws the API's own message. */
export async function postJson<T = unknown>(url: string, payload: object): Promise<T> {
  return jsonOrError<T>(
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function submitEnquiry(payload: EnquiryPayload): Promise<void> {
  await postJson("/api/enquiries/", payload);
}

/** A GST-inclusive dollar amount. Blank or unparseable values render as an em dash. */
export function formatPrice(value: string): string {
  const amount = Number(value);
  if (!value?.trim() || !Number.isFinite(amount)) return "—";
  return `$${amount.toLocaleString("en-AU", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Australia/Perth",
  });
}

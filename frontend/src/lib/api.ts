/** Shared API primitives for both portals. Staff calls live in adminApi.ts, dealer calls in dealerApi.ts. */

export const SESSION_FLAG = "hasSession";
export const AUTH_FAILURE_EVENT = "auth-failure";

export type Role = "staff" | "dealer" | "none";
export type DealerStatus = "pending" | "active" | "suspended" | "denied";

export interface PrincipalDealer {
  id: number;
  business_name: string;
  contact_name: string;
  status: DealerStatus;
  status_label: string;
}

export interface Principal {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  role: Role;
  dealer: PrincipalDealer | null;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

function csrfToken(): string | null {
  const value = document.cookie.split("; ").find((row) => row.startsWith("csrftoken="))?.split("=")[1];
  return value ? decodeURIComponent(value) : null;
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
  let response = await fetch(url, request);
  if (response.status === 401) {
    const refreshed = await fetch("/api/token/refresh/", { method: "POST", credentials: "include" });
    if (refreshed.ok) response = await fetch(url, request);
    else {
      localStorage.removeItem(SESSION_FLAG);
      window.dispatchEvent(new Event(AUTH_FAILURE_EVENT));
    }
  }
  return response;
}

export async function jsonOrError<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || Object.values(data)[0] || "Request failed");
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
  return user.role === "staff" ? "/dashboard/enquiries" : "/portal";
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-AU", {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
    timeZone: "Australia/Perth",
  });
}

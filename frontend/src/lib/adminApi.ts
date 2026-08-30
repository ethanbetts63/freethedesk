export interface StaffUser {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

export interface Enquiry {
  id: number;
  name: string;
  business: string;
  email: string;
  phone: string;
  website: string;
  help_with: string;
  help_with_label: string;
  message: string;
  status: string;
  status_label: string;
  created_at: string;
  updated_at: string;
}

export interface AdminMessage {
  id: number;
  recipient_type: "admin" | "manual";
  recipient: string;
  channel: "email" | "sms";
  subject: string;
  body: string;
  status: "pending" | "sent" | "failed";
  sent_at: string | null;
  error_message: string;
  related_enquiry: number | null;
  related_enquiry_business: string | null;
  created_at: string;
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
      localStorage.removeItem("hasStaffSession");
      window.dispatchEvent(new Event("staff-auth-failure"));
    }
  }
  return response;
}

async function jsonOrError<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || Object.values(data)[0] || "Request failed");
  return data as T;
}

export async function login(identifier: string, password: string): Promise<void> {
  const response = await fetch("/api/token/", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: identifier, password }),
  });
  await jsonOrError(response);
}

export async function logout(): Promise<void> {
  await fetch("/api/token/logout/", { method: "POST", credentials: "include" });
}

export async function getStaffProfile(): Promise<StaffUser> {
  return jsonOrError(await authedFetch("/api/auth/me/"));
}

function queryString(values: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "all") query.set(key, String(value));
  });
  return query.size ? `?${query}` : "";
}

export async function getEnquiries(params: Record<string, string | number | undefined>): Promise<Paginated<Enquiry>> {
  return jsonOrError(await authedFetch(`/api/admin/enquiries/${queryString(params)}`));
}

export async function getEnquiry(id: number): Promise<Enquiry> {
  return jsonOrError(await authedFetch(`/api/admin/enquiries/${id}/`));
}

export async function updateEnquiryStatus(id: number, status: string): Promise<Enquiry> {
  return jsonOrError(await authedFetch(`/api/admin/enquiries/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }));
}

export async function getMessages(params: Record<string, string | number | undefined>): Promise<Paginated<AdminMessage>> {
  return jsonOrError(await authedFetch(`/api/admin/messages/${queryString(params)}`));
}

export async function getMessage(id: number): Promise<AdminMessage> {
  return jsonOrError(await authedFetch(`/api/admin/messages/${id}/`));
}

export async function sendMessage(payload: {
  to: string;
  subject: string;
  body: string;
  relatedEnquiry?: number;
  attachments: File[];
}): Promise<void> {
  const form = new FormData();
  form.set("to", payload.to);
  form.set("subject", payload.subject);
  form.set("body", payload.body);
  if (payload.relatedEnquiry) form.set("related_enquiry", String(payload.relatedEnquiry));
  payload.attachments.forEach((file) => form.append("attachments", file));
  await jsonOrError(await authedFetch("/api/admin/messages/compose/", { method: "POST", body: form }));
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-AU", {
    day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
    timeZone: "Australia/Perth",
  });
}

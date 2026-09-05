import { authedFetch, jsonOrError, queryString, type Paginated } from "./api";

export type { Paginated, Principal as StaffUser } from "./api";
export { authedFetch, formatDateTime, login, logout, getProfile } from "./api";

export interface WebsiteEnquiryConfiguration {
  version?: number;
  appearance?: {
    brand_name?: string;
    current_url?: string;
    accent?: string;
    accent_hex?: string;
  };
  capabilities?: Array<{ key: string; name: string; selected: boolean }>;
  inventory_options?: Array<{ key: string; name: string; selected: boolean }>;
  custom_capability?: string;
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
  configuration: WebsiteEnquiryConfiguration;
  status: string;
  status_label: string;
  created_at: string;
  updated_at: string;
}

export interface Dealer {
  id: number;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  state: "WA" | "NSW" | "VIC" | "QLD" | "SA" | "TAS" | "ACT" | "NT";
  state_label: string;
  plan: "demo" | "licensing" | "contracts" | "complete";
  plan_label: string;
  payment_status: "demo" | "payment_pending" | "active" | "past_due" | "cancelled";
  payment_status_label: string;
  subscription_current_period_end: string | null;
  cancel_at_period_end: boolean;
  status: "pending" | "active" | "suspended" | "denied";
  status_label: string;
  staff_notes: string;
  status_changed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LicensingSettings {
  licensing_price: string;
  contracts_price: string;
  complete_price: string;
  updated_at: string;
}

export interface AdminMessage {
  id: number;
  recipient_type: "admin" | "dealer" | "manual";
  recipient: string;
  channel: "email" | "sms";
  subject: string;
  body: string;
  status: "pending" | "sent" | "failed";
  sent_at: string | null;
  error_message: string;
  related_enquiry: number | null;
  related_enquiry_business: string | null;
  related_dealer: number | null;
  related_dealer_business: string | null;
  created_at: string;
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

export async function getDealers(params: Record<string, string | number | undefined>): Promise<Paginated<Dealer>> {
  return jsonOrError(await authedFetch(`/api/admin/dealers/${queryString(params)}`));
}

export async function getDealer(id: number): Promise<Dealer> {
  return jsonOrError(await authedFetch(`/api/admin/dealers/${id}/`));
}

export async function updateDealer(id: number, changes: Partial<Pick<Dealer, "status" | "staff_notes">>): Promise<Dealer> {
  return jsonOrError(await authedFetch(`/api/admin/dealers/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  }));
}

export async function getLicensingSettings(): Promise<LicensingSettings> {
  return jsonOrError(await authedFetch("/api/admin/licensing-settings/"));
}

export async function updateLicensingSettings(
  changes: Partial<Pick<LicensingSettings, "licensing_price" | "contracts_price" | "complete_price">>,
): Promise<LicensingSettings> {
  return jsonOrError(await authedFetch("/api/admin/licensing-settings/", {
    method: "PATCH",
    body: JSON.stringify(changes),
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

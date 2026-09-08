import {
  authedFetch,
  jsonOrError,
  queryString,
  type Paginated,
  type PublicSiteSettings,
  type StaffAccountFields,
} from "./api";

import type { DealerAccount } from "./dealerApi";
import type { SeoAccount } from "./seoApi";

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
                                                                               
  project_type?: "website" | "automation" | "both";
  budget?: string;
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

                                                                                
export type Dealer = DealerAccount & StaffAccountFields;

                                                                                       
export type SeoSubscriber = SeoAccount & StaffAccountFields;

                                                                       
export type SiteSettings = PublicSiteSettings;

export interface AdminMessage {
  id: number;
  recipient_type: "admin" | "dealer" | "seo" | "manual";
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
  related_seo_subscriber: number | null;
  related_seo_subscriber_business: string | null;
  created_at: string;
}

export async function getEnquiries(params: Record<string, string | number | undefined>): Promise<Paginated<Enquiry>> {
  return jsonOrError(await authedFetch(`/api/admin/enquiries/${queryString(params)}`));
}

export async function getEnquiry(id: number): Promise<Enquiry> {
  return jsonOrError(await authedFetch(`/api/admin/enquiries/${id}/`));
}

export async function updateEnquiryStatus(id: number, status: string): Promise<Enquiry> {
  return jsonOrError(
    await authedFetch(`/api/admin/enquiries/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  );
}

export async function getDealers(params: Record<string, string | number | undefined>): Promise<Paginated<Dealer>> {
  return jsonOrError(await authedFetch(`/api/admin/dealers/${queryString(params)}`));
}

export async function getDealer(id: number): Promise<Dealer> {
  return jsonOrError(await authedFetch(`/api/admin/dealers/${id}/`));
}

export async function updateDealer(
  id: number,
  changes: Partial<Pick<Dealer, "status" | "staff_notes">>,
): Promise<Dealer> {
  return jsonOrError(
    await authedFetch(`/api/admin/dealers/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),
  );
}

export async function getSeoSubscribers(
  params: Record<string, string | number | undefined>,
): Promise<Paginated<SeoSubscriber>> {
  return jsonOrError(await authedFetch(`/api/admin/seo/${queryString(params)}`));
}

export async function getSeoSubscriber(id: number): Promise<SeoSubscriber> {
  return jsonOrError(await authedFetch(`/api/admin/seo/${id}/`));
}

export async function updateSeoSubscriber(
  id: number,
  changes: Partial<Pick<SeoSubscriber, "status" | "staff_notes">>,
): Promise<SeoSubscriber> {
  return jsonOrError(
    await authedFetch(`/api/admin/seo/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),
  );
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return jsonOrError(await authedFetch("/api/admin/site-settings/"));
}

export async function updateSiteSettings(changes: Partial<Omit<SiteSettings, "updated_at">>): Promise<SiteSettings> {
  return jsonOrError(
    await authedFetch("/api/admin/site-settings/", {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),
  );
}

export async function getMessages(
  params: Record<string, string | number | undefined>,
): Promise<Paginated<AdminMessage>> {
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

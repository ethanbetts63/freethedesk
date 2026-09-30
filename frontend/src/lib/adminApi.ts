import {
  authedFetch,
  queryString,
  type Paginated,
  type PublicSiteSettings,
  type StaffAccountFields,
} from './api';

import type { DealerAccount } from './dealerApi';
import type { SeoAccount } from './seoApi';
import { handleResponse } from '@freetheplatform/web-security';

export type { Paginated, Principal as StaffUser } from './api';
export { authedFetch, logout, getProfile } from './api';
export { formatDateTime } from './formatting';

export interface WebsiteEnquiryConfiguration {
  version?: number;
  appearance?: {
    brand_name?: string;
    current_url?: string;
  };
  capabilities?: Array<{ key: string; name: string; selected: boolean }>;
  inventory_options?: Array<{ key: string; name: string; selected: boolean }>;
  custom_capability?: string;

  project_type?: 'website' | 'automation' | 'both';
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

/** What a message is about. One field for any model, rather than a pair per relation. */
export interface RelatedObject {
  type: string;
  id: number;
  label: string;
}

export type MessageStatus =
  'queued' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'cancelled' | 'suppressed';

export interface AdminMessage {
  id: number;
  to: string;
  channel: 'email' | 'sms';
  message_type: string;
  type_label: string;
  subject: string;
  body_text: string;
  body_html: string;
  related: RelatedObject | null;
  status: MessageStatus;
  needs_attention: boolean;
  scheduled_for: string | null;
  sent_at: string | null;
  error_message: string;
  provider_message_id: string;
  acknowledged_at: string | null;
  acknowledged_by_name: string;
  created_at: string;
}

/** Content type for an enquiry, qualified so it cannot collide with another app's model. */
export const ENQUIRY_TYPE = 'core.enquiry';
export const DEALER_TYPE = 'dealers.dealer';
export const SEO_SUBSCRIBER_TYPE = 'seo.seosubscriber';

export async function getEnquiries(
  params: Record<string, string | number | undefined>,
): Promise<Paginated<Enquiry>> {
  return handleResponse(await authedFetch(`/api/admin/enquiries/${queryString(params)}`));
}

export async function getEnquiry(id: number): Promise<Enquiry> {
  return handleResponse(await authedFetch(`/api/admin/enquiries/${id}/`));
}

export async function updateEnquiryStatus(id: number, status: string): Promise<Enquiry> {
  return handleResponse(
    await authedFetch(`/api/admin/enquiries/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  );
}

export async function getDealers(
  params: Record<string, string | number | undefined>,
): Promise<Paginated<Dealer>> {
  return handleResponse(await authedFetch(`/api/admin/dealers/${queryString(params)}`));
}

export async function getDealer(id: number): Promise<Dealer> {
  return handleResponse(await authedFetch(`/api/admin/dealers/${id}/`));
}

export async function updateDealer(
  id: number,
  changes: Partial<Pick<Dealer, 'status' | 'staff_notes'>>,
): Promise<Dealer> {
  return handleResponse(
    await authedFetch(`/api/admin/dealers/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    }),
  );
}

export async function getSeoSubscribers(
  params: Record<string, string | number | undefined>,
): Promise<Paginated<SeoSubscriber>> {
  return handleResponse(await authedFetch(`/api/admin/seo/${queryString(params)}`));
}

export async function getSeoSubscriber(id: number): Promise<SeoSubscriber> {
  return handleResponse(await authedFetch(`/api/admin/seo/${id}/`));
}

export async function updateSeoSubscriber(
  id: number,
  changes: Partial<Pick<SeoSubscriber, 'status' | 'staff_notes'>>,
): Promise<SeoSubscriber> {
  return handleResponse(
    await authedFetch(`/api/admin/seo/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    }),
  );
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return handleResponse(await authedFetch('/api/admin/site-settings/'));
}

export async function getMessages(
  params: Record<string, string | number | undefined>,
): Promise<Paginated<AdminMessage>> {
  return handleResponse(await authedFetch(`/api/admin/messages/${queryString(params)}`));
}

export async function getMessage(id: number): Promise<AdminMessage> {
  return handleResponse(await authedFetch(`/api/admin/messages/${id}/`));
}

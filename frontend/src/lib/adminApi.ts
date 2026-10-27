import {
  authedFetch,
  queryString,
  type DealerStatus,
  type Paginated,
  type PublicSiteSettings,
  type StaffAccountFields,
} from './api';

import type { AffiliateCommission, AffiliateEarnings } from './affiliateApi';
import type { DealerAccount } from './dealerApi';
import type { PackageCode } from './servicePricing';
import type { SeoAccount, SeoSale, SeoSetup, SeoSetupKey } from './seoApi';
import { handleResponse } from '@freetheplatform/web-security';

export type { Paginated, Principal as StaffUser } from './api';
export { authedFetch, logout, getProfile } from './api';
export { formatDateTime } from './formatting';

/** What the project form records beside the message. */
export interface EnquiryConfiguration {
  project_type?: 'website' | 'automation' | 'both' | 'seo';
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
  configuration: EnquiryConfiguration;
  status: string;
  status_label: string;
  created_at: string;
  updated_at: string;
}

export type Dealer = DealerAccount & StaffAccountFields;

export type SeoSubscriber = SeoAccount &
  StaffAccountFields & {
    /** Only on the detail endpoint, and null until the subscriber has paid. */
    setup?: SeoSetup | null;
    /** Only on the detail endpoint, and null until a payment has succeeded. */
    sale?: SeoSale | null;
  };

/** An affiliate as staff see them: the podcast, the code and what it has earned. */
export interface Affiliate extends StaffAccountFields {
  id: number;
  business_name: string;
  contact_name: string;
  email: string;
  website: string;
  code: string;
  earnings: AffiliateEarnings;
  status: DealerStatus;
  status_label: string;
  created_at: string;
  updated_at: string;
  /** Only on the detail endpoint. */
  commissions?: AffiliateCommission[];
  /** The free audit's SEO account, on the detail endpoint. */
  seo_subscriber_id?: number | null;
}

/** A podcast host the outreach cron pitches once. See _docs/affiliate-outreach.md. */
export type ProspectStatus =
  'queued' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'suppressed' | 'signed_up' | 'excluded';
export type PitchVersion = 'a' | 'b' | 'c';
export type ProspectReply = 'none' | 'positive' | 'negative';
/** The writer's guess at how well an SEO audit fits the show's audience; '' is unrated. */
export type ProspectRelevance = 'high' | 'medium' | 'low' | '';

export interface Prospect {
  id: number;
  email: string;
  email_source: string;
  podcast_name: string;
  host_name: string;
  first_name: string;
  website: string;
  apple_url: string;
  genre: string;
  episode_count: number;
  latest_episode_title: string;
  latest_episode_description: string;
  last_release_date: string | null;
  opener: string;
  relevance: ProspectRelevance;
  relevance_label: string;
  version: PitchVersion;
  version_label: string;
  pitched_at: string | null;
  reply: ProspectReply;
  reply_label: string;
  affiliate: number | null;
  affiliate_name: string;
  excluded_reason: string;
  status: ProspectStatus;
  scraped_on: string;
  created_at: string;
  updated_at: string;
}

/** One pitch version's tallies on the outreach page. */
export interface OutreachVersionSummary extends Record<ProspectStatus, number> {
  version: PitchVersion;
  total: number;
  positive: number;
}

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
export const PACKAGE_ORDER_TYPE = 'core.packageorder';
export const DEALER_TYPE = 'dealers.dealer';
export const SEO_SUBSCRIBER_TYPE = 'seo.seosubscriber';
export const AFFILIATE_TYPE = 'affiliates.affiliate';
export const PROSPECT_TYPE = 'affiliates.podcastprospect';

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

/** Dismisses an enquiry without a reply: it leaves the New list but stays on record. */
export async function ignoreEnquiry(id: number): Promise<Enquiry> {
  return updateEnquiryStatus(id, 'ignored');
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

/** Staff confirming a setup step by hand, or resetting it. */
export async function updateSeoSetupStep(
  id: number,
  key: SeoSetupKey,
  action: 'confirm' | 'reset',
): Promise<SeoSetup> {
  return handleResponse(
    await authedFetch(`/api/admin/seo/${id}/setup/${key}/`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),
  );
}

export async function getAffiliates(
  params: Record<string, string | number | undefined>,
): Promise<Paginated<Affiliate>> {
  return handleResponse(await authedFetch(`/api/admin/affiliates/${queryString(params)}`));
}

export async function getAffiliate(id: number): Promise<Affiliate> {
  return handleResponse(await authedFetch(`/api/admin/affiliates/${id}/`));
}

export async function updateAffiliate(
  id: number,
  changes: Partial<Pick<Affiliate, 'status' | 'staff_notes'>>,
): Promise<Affiliate> {
  return handleResponse(
    await authedFetch(`/api/admin/affiliates/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    }),
  );
}

export async function getProspects(
  params: Record<string, string | number | undefined>,
): Promise<Paginated<Prospect>> {
  return handleResponse(await authedFetch(`/api/admin/outreach/prospects/${queryString(params)}`));
}

export async function getProspect(id: number): Promise<Prospect> {
  return handleResponse(await authedFetch(`/api/admin/outreach/prospects/${id}/`));
}

export async function updateProspect(
  id: number,
  changes: Partial<Pick<Prospect, 'reply' | 'excluded_reason'>>,
): Promise<Prospect> {
  return handleResponse(
    await authedFetch(`/api/admin/outreach/prospects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    }),
  );
}

/** The "no thanks" replies to version C: the address goes on the suppression list. */
export async function unsubscribeProspect(id: number): Promise<Prospect> {
  return handleResponse(
    await authedFetch(`/api/admin/outreach/prospects/${id}/unsubscribe/`, { method: 'POST' }),
  );
}

export async function getOutreachSummary(): Promise<{ versions: OutreachVersionSummary[] }> {
  return handleResponse(await authedFetch('/api/admin/outreach/summary/'));
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

/** A package order, as staff see it. */
export interface AdminPackageOrder {
  id: number;
  package: PackageCode;
  package_label: string;
  package_name: string;
  price: string;
  due_now: string;
  /** What is still owed: a website's second half, invoiced before launch. */
  balance: string;
  email: string;
  phone: string;
  website: string;
  business_name: string;
  notes: string;
  payment_status: 'payment_pending' | 'paid';
  payment_status_label: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * One row of the Orders list: a website package or an SEO audit, flattened to the same shape by
 * `/api/admin/orders/`. `href` is the row's own detail page, which differs by kind.
 */
export interface AdminOrder {
  kind: 'package' | 'audit';
  id: number;
  created_at: string;
  business_name: string;
  email: string;
  product_name: string;
  /** Empty when nothing is known yet (a retired plan with no payment). */
  price: string;
  /** A website's balance due before launch, or the discount code a listener used. */
  note: string;
  payment_status: 'payment_pending' | 'paid';
  payment_status_label: string;
  href: string;
}

export async function getOrders(
  params: Record<string, string | number | undefined>,
): Promise<Paginated<AdminOrder>> {
  return handleResponse(await authedFetch(`/api/admin/orders/${queryString(params)}`));
}

export async function getPackageOrders(
  params: Record<string, string | number | undefined>,
): Promise<Paginated<AdminPackageOrder>> {
  return handleResponse(await authedFetch(`/api/admin/package-orders/${queryString(params)}`));
}

export async function getPackageOrder(id: number): Promise<AdminPackageOrder> {
  return handleResponse(await authedFetch(`/api/admin/package-orders/${id}/`));
}

import { DEALER_TYPE, ENQUIRY_TYPE, SEO_SUBSCRIBER_TYPE } from '@/lib/adminApi';
import type { InvoiceListItem, RelatedRecord } from './invoiceTypes';

/** `overdue` is not stored: an issued invoice past its due date, shown as its own state because it is the one to chase. */
export function displayStatus(invoice: Pick<InvoiceListItem, 'status' | 'is_overdue'>): string {
  return invoice.is_overdue ? 'overdue' : invoice.status;
}

export const INVOICE_FILTERS = [
  { value: 'draft', label: 'Drafts' },
  { value: 'outstanding', label: 'Awaiting payment' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'paid', label: 'Paid' },
  { value: 'void', label: 'Void' },
];

/** The statuses, for the list's colour legend. */
export const invoiceStatuses = ['draft', 'issued', 'overdue', 'paid', 'void'];

const RELATED: Record<string, { name: string; href: (id: number) => string }> = {
  [ENQUIRY_TYPE]: { name: 'Enquiry', href: (id) => `/dashboard/admin/enquiries/${id}` },
  [DEALER_TYPE]: { name: 'Dealer', href: (id) => `/dashboard/admin/dealers/${id}` },
  [SEO_SUBSCRIBER_TYPE]: { name: 'SEO customer', href: (id) => `/dashboard/admin/seo/${id}` },
};

export function relatedHref(record: RelatedRecord): string | null {
  return RELATED[record.type]?.href(record.id) ?? null;
}

export function relatedName(record: RelatedRecord): string {
  return RELATED[record.type]?.name ?? 'Linked record';
}

/** The link a record's detail page offers: a new invoice that starts from it. */
export function newInvoiceHref(type: string, id: number): string {
  return `/dashboard/admin/invoices/new?related_type=${encodeURIComponent(type)}&related_id=${id}`;
}

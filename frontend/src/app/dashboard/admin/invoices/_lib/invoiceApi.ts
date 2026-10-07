import { handleResponse } from '@freetheplatform/web-security';

import { authedFetch, queryString, type Paginated } from '@/lib/api';
import type {
  CustomerCandidate,
  Invoice,
  InvoiceConfig,
  InvoiceInput,
  InvoiceListItem,
  InvoiceMessage,
  InvoicePrefill,
  InvoiceSummary,
} from './invoiceTypes';

const BASE = '/api/admin/invoices';

export async function getInvoices(
  params: Record<string, string | number | undefined>,
): Promise<Paginated<InvoiceListItem>> {
  return handleResponse(await authedFetch(`${BASE}/${queryString(params)}`));
}

export async function getInvoiceSummary(): Promise<InvoiceSummary> {
  return handleResponse(await authedFetch(`${BASE}/summary/`));
}

export async function getInvoiceConfig(): Promise<InvoiceConfig> {
  return handleResponse(await authedFetch(`${BASE}/config/`));
}

export async function getInvoice(id: number | string): Promise<Invoice> {
  return handleResponse(await authedFetch(`${BASE}/${id}/`));
}

export async function createInvoice(input: InvoiceInput): Promise<Invoice> {
  return handleResponse(
    await authedFetch(`${BASE}/`, { method: 'POST', body: JSON.stringify(input) }),
  );
}

export async function updateInvoice(id: number | string, input: InvoiceInput): Promise<Invoice> {
  return handleResponse(
    await authedFetch(`${BASE}/${id}/`, { method: 'PUT', body: JSON.stringify(input) }),
  );
}

export async function deleteInvoice(id: number): Promise<void> {
  await handleResponse(await authedFetch(`${BASE}/${id}/`, { method: 'DELETE' }));
}

export type InvoiceAction = 'issue' | 'mark-paid' | 'mark-unpaid' | 'void' | 'duplicate';

export async function invoiceAction(
  id: number,
  action: InvoiceAction,
  body: Record<string, string> = {},
): Promise<Invoice> {
  return handleResponse(
    await authedFetch(`${BASE}/${id}/${action}/`, { method: 'POST', body: JSON.stringify(body) }),
  );
}

export async function getInvoicePrefill(type: string, id: string): Promise<InvoicePrefill> {
  return handleResponse(
    await authedFetch(`${BASE}/prefill/${queryString({ related_type: type, related_id: id })}`),
  );
}

export async function searchInvoiceCustomers(search: string): Promise<CustomerCandidate[]> {
  const body = await handleResponse<{ results: CustomerCandidate[] }>(
    await authedFetch(`${BASE}/customers/${queryString({ search })}`),
  );
  return body.results;
}

export async function getInvoiceEmailDraft(id: number | string) {
  return handleResponse<{
    to: string;
    subject: string;
    body: string;
    automatic_attachments: string[];
  }>(await authedFetch(`${BASE}/${id}/email/`));
}

/** Emails sent for one invoice, from the shared message log. */
export async function getInvoiceMessages(id: number): Promise<InvoiceMessage[]> {
  const body = await handleResponse<{ results: InvoiceMessage[] }>(
    await authedFetch(
      `/api/admin/messages/${queryString({ related_type: 'ftp_invoicing.invoice', related_id: id })}`,
    ),
  );
  return body.results;
}

/** Same-origin, so the session cookie rides along; `download` asks for a save rather than a tab. */
export function invoicePdfUrl(id: number, download = false): string {
  return `${BASE}/${id}/pdf/${download ? '?download=1' : ''}`;
}

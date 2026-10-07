/** The staff invoice API (`freetheplatform.invoicing`), as this dashboard reads it. Money arrives as DRF decimal strings. */

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'void';

export interface RelatedRecord {
  /** `app_label.model`, e.g. `service.booking`. */
  type: string;
  id: number;
  label: string;
}

export interface InvoiceLine {
  id?: number;
  item_code: string;
  description: string;
  quantity: string;
  unit_price: string;
  taxable: boolean;
  amount?: string;
}

export interface InvoiceCustomer {
  customer_name: string;
  customer_company: string;
  customer_email: string;
  customer_phone: string;
  customer_abn: string;
  customer_address: string;
}

export interface Invoice extends InvoiceCustomer {
  id: number;
  number: string;
  status: InvoiceStatus;
  is_overdue: boolean;
  issue_date: string;
  due_date: string;
  prices_include_tax: boolean;
  tax_rate: string;
  subtotal: string;
  tax_total: string;
  total: string;
  amount_paid: string;
  balance_due: string;
  paid_on: string | null;
  payment_method: string;
  payment_reference: string;
  related: RelatedRecord | null;
  lines: InvoiceLine[];
  issued_at: string | null;
  voided_at: string | null;
  void_reason: string;
  last_sent_at: string | null;
  last_sent_to: string;
  created_by_name: string;
  created_at: string;
}

export type InvoiceListItem = Pick<
  Invoice,
  | 'id'
  | 'number'
  | 'status'
  | 'is_overdue'
  | 'customer_name'
  | 'customer_company'
  | 'customer_email'
  | 'issue_date'
  | 'due_date'
  | 'total'
  | 'balance_due'
  | 'related'
  | 'last_sent_at'
  | 'created_at'
>;

export interface InvoicePage {
  count: number;
  next: string | null;
  previous: string | null;
  results: InvoiceListItem[];
}

export interface InvoiceConfig {
  currency: string;
  tax_registered: boolean;
  tax_name: string;
  tax_rate: string;
  prices_include_tax: boolean;
  default_issue_date: string;
  default_due_date: string;
  default_due_days: number;
  seller_name: string;
  seller_problems: string[];
  can_email: boolean;
  payment_methods: { value: string; label: string }[];
}

export interface InvoiceSummary {
  outstanding_count: number;
  outstanding_total: string;
  overdue_count: number;
  overdue_total: string;
  paid_this_month_total: string;
  draft_count: number;
}

export interface InvoicePrefill {
  customer: InvoiceCustomer;
  lines: Partial<InvoiceLine>[];
  related: RelatedRecord | null;
}

export interface CustomerCandidate {
  label: string;
  detail: string;
  source: string;
  customer: InvoiceCustomer;
  related: RelatedRecord | null;
}

/** What the editor sends. Lines replace the draft's lines wholesale. */
export interface InvoiceInput extends InvoiceCustomer {
  issue_date: string;
  due_date: string;
  prices_include_tax: boolean;
  related_type: string;
  related_id: number | null;
  lines: Omit<InvoiceLine, 'id' | 'amount'>[];
}

export interface InvoiceMessage {
  id: number;
  to: string;
  subject: string;
  status: string;
  sent_at: string | null;
  created_at: string;
}

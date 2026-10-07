import { formatDayMonthYear } from '@/lib/formatting';
import { EMPTY_LINE, type InvoiceFormInput } from './InvoiceForm.schema';
import type { Invoice, InvoiceConfig, InvoicePrefill } from './invoiceTypes';

/** A blank invoice on today's terms, optionally started from one of our records. */
export function newInvoiceValues(
  config: InvoiceConfig,
  prefill?: InvoicePrefill,
): InvoiceFormInput {
  const lines = prefill?.lines.length
    ? prefill.lines.map((line) => ({
        item_code: line.item_code ?? '',
        description: line.description ?? '',
        quantity: String(line.quantity ?? '1'),
        unit_price: String(line.unit_price ?? ''),
        taxable: config.tax_registered && (line.taxable ?? true),
      }))
    : [{ ...EMPTY_LINE, taxable: config.tax_registered }];
  return {
    customer_name: '',
    customer_company: '',
    customer_email: '',
    customer_phone: '',
    customer_abn: '',
    customer_address: '',
    ...prefill?.customer,
    customer_reference: '',
    issue_date: formatDayMonthYear(config.default_issue_date),
    due_date: formatDayMonthYear(config.default_due_date),
    prices_include_tax: config.prices_include_tax,
    notes: config.default_notes,
    lines,
  };
}

/** A draft back into the editor. */
export function draftValues(invoice: Invoice): InvoiceFormInput {
  return {
    customer_name: invoice.customer_name,
    customer_company: invoice.customer_company,
    customer_email: invoice.customer_email,
    customer_phone: invoice.customer_phone,
    customer_abn: invoice.customer_abn,
    customer_address: invoice.customer_address,
    customer_reference: invoice.customer_reference,
    issue_date: formatDayMonthYear(invoice.issue_date),
    due_date: formatDayMonthYear(invoice.due_date),
    prices_include_tax: invoice.prices_include_tax,
    notes: invoice.notes,
    lines: invoice.lines.map((line) => ({
      item_code: line.item_code,
      description: line.description,
      quantity: String(Number(line.quantity)),
      unit_price: line.unit_price,
      taxable: line.taxable,
    })),
  };
}

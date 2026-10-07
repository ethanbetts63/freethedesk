import { FIELD_MAX } from '@freetheplatform/web-security';
import { email, requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { dateInputValue } from '@/lib/formatting';

/** A typed amount, kept as a string so "12.5" is not reformatted under the cursor. */
const amount = (message: string) =>
  z
    .string()
    .trim()
    .max(FIELD_MAX.token)
    .refine((value) => value !== '' && Number.isFinite(Number(value)), { message });

const DATE = /^\d{2}\/\d{2}\/\d{4}$/;

const lineSchema = z.object({
  item_code: z.string().trim().max(FIELD_MAX.reference).default(''),
  description: z.string().trim().min(1, 'Describe what this line is for.').max(FIELD_MAX.note),
  quantity: amount('Enter a quantity.').refine((value) => Number(value) > 0, {
    message: 'Quantity must be more than zero.',
  }),
  // Negative is allowed: a discount or credit line.
  unit_price: amount('Enter a price.'),
  taxable: z.boolean().default(true),
});

/**
 * Track A: a repeatable line group, and a due date that depends on the issue date. Dates are typed
 * DD/MM/YYYY (the dashboard avoids native date inputs) and converted on submit.
 */
export const invoiceFormSchema = z
  .object({
    customer_name: requiredString('business_name', 'Who is this invoice to?'),
    customer_company: z.string().trim().max(FIELD_MAX.business_name).default(''),
    customer_email: email({ required: false }).default(''),
    customer_phone: z.string().trim().max(FIELD_MAX.phone).default(''),
    customer_abn: z.string().trim().max(FIELD_MAX.token).default(''),
    customer_address: z.string().trim().max(FIELD_MAX.note).default(''),
    issue_date: z.string().trim().max(FIELD_MAX.token).regex(DATE, 'Use DD/MM/YYYY.'),
    due_date: z.string().trim().max(FIELD_MAX.token).regex(DATE, 'Use DD/MM/YYYY.'),
    prices_include_tax: z.boolean().default(true),
    lines: z.array(lineSchema).min(1, 'Add at least one line.').max(100),
  })
  .refine((values) => dateInputValue(values.due_date) >= dateInputValue(values.issue_date), {
    message: "The due date can't be before the issue date.",
    path: ['due_date'],
  });

export type InvoiceFormInput = z.input<typeof invoiceFormSchema>;
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export const EMPTY_LINE = {
  item_code: '',
  description: '',
  quantity: '1',
  unit_price: '',
  taxable: true,
};

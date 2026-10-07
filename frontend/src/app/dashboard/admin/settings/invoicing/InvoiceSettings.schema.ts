import { FIELD_MAX } from '@freetheplatform/web-security';
import { requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

const optional = (kind: keyof typeof FIELD_MAX) =>
  z.string().trim().max(FIELD_MAX[kind]).default('');

export const invoiceSettingsSchema = z.object({
  business_name: requiredString('business_name', 'The business name prints on every invoice.'),
  legal_name: optional('business_name'),
  abn: optional('token'),
  address: optional('note'),
  email: z.union([z.literal(''), z.email('Enter a valid email address.').max(FIELD_MAX.email)]),
  phone: optional('phone'),
  website: optional('url'),
  bank_account_name: optional('business_name'),
  bank_bsb: z
    .string()
    .trim()
    .max(7)
    .refine((value) => value === '' || value.replace(/\D/g, '').length === 6, {
      message: 'A BSB is six digits.',
    }),
  bank_account_number: optional('token'),
  payment_note: optional('line'),
});

export type InvoiceSettingsValues = z.infer<typeof invoiceSettingsSchema>;

export const INVOICE_SETTINGS_FIELDS = Object.keys(
  invoiceSettingsSchema.shape,
) as (keyof InvoiceSettingsValues)[];

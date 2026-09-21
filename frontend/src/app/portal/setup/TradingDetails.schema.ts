import { FIELD_MAX } from '@freetheplatform/web-security';
import { z } from 'zod';

// A file input always appears in FormData, even when nothing was chosen —
// browsers submit an empty File (name "", size 0) rather than omitting it.
const optionalFile = z
  .instanceof(File)
  .optional()
  .transform((file) => (file && file.size > 0 ? file : undefined));

/**
 * Where the customer's money goes, and how the dealer's block on a contract is
 * drawn. Flat fields, one submit, one result — Track B under the forms
 * standard.
 *
 * The BSB is normalised server-side rather than here, because the stored form
 * is what the payment instructions page prints and it should not depend on
 * which client saved it.
 */
export const tradingDetailsSchema = z.object({
  bank_account_name: z.string().trim().max(FIELD_MAX.line).optional().default(''),
  bank_bsb: z.string().trim().max(FIELD_MAX.token).optional().default(''),
  bank_account_number: z.string().trim().max(FIELD_MAX.token).optional().default(''),
  signature_name: z.string().trim().max(FIELD_MAX.line).optional().default(''),
  signature_image: optionalFile,
  trading_hours_note: z.string().trim().max(FIELD_MAX.note).optional().default(''),
});

export type TradingDetailsValues = z.infer<typeof tradingDetailsSchema>;

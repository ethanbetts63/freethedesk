import { z } from 'zod';

const text = z.string().optional().default('');

// A file input always appears in FormData, even when nothing was chosen —
// browsers submit an empty File (name "", size 0) rather than omitting it.
const optionalFile = z
  .instanceof(File)
  .optional()
  .transform((file) => (file && file.size > 0 ? file : undefined));

export const dealerSetupSchema = z.object({
  legal_name: text,
  dealer_licence_number: text,
  repairer_licence_number: text,
  organisation_code: text,
  abn: text,
  acn: text,
  address_line1: text,
  suburb: text,
  postcode: text,
  authorised_officer_name: text,
  authorised_officer_licence_number: text,
  declared_at: text,
  authorised_officer_date_of_birth: text,
  dealer_licence_document: optionalFile,
  authorised_officer_identity_document: optionalFile,
  business_evidence_document: optionalFile,
  intent: z.enum(['draft', 'submit']).default('draft'),
});

export type DealerSetupValues = z.infer<typeof dealerSetupSchema>;

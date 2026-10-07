import { FIELD_MAX } from '@freetheplatform/web-security';
import { email, requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

export const invoiceEmailSchema = z.object({
  invoiceId: z.coerce.number().int().positive(),
  to: email(),
  subject: requiredString('line', 'Subject is required.'),
  body: z.string().trim().min(1, 'Email body is required.').max(FIELD_MAX.long_text),
  attachments: z.array(z.instanceof(File)).default([]),
});

export type InvoiceEmailValues = z.infer<typeof invoiceEmailSchema>;

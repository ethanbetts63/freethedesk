import { FIELD_MAX } from '@freetheplatform/web-security';
import { email, requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

export const composeMessageSchema = z.object({
  to: email(),
  subject: requiredString('line', 'Subject is required.'),
  body: z.string().trim().min(1, 'Email body is required.').max(FIELD_MAX.long_text),
  relatedEnquiry: z.coerce.number().optional(),
  attachments: z.array(z.instanceof(File)).default([]),
});

export type ComposeMessageValues = z.infer<typeof composeMessageSchema>;

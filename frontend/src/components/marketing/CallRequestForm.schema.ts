import { FIELD_MAX } from '@freetheplatform/web-security';
import { requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { normaliseWebsiteUrl } from '@/lib/api';

/**
 * Track B under the forms standard. The field names are the call request serializer's
 * (`seo.serializers.call_request`). Only the email or phone is required; the API checks which it is.
 */
export const callRequestSchema = z.object({
  contact: requiredString('email', 'Your email or phone number is required.'),
  // Bounded before `normaliseWebsiteUrl`, which adds a scheme to "yoursite.com.au".
  website: z
    .string()
    .trim()
    .max(FIELD_MAX.url)
    .transform((value) => (value ? normaliseWebsiteUrl(value) : '')),
  notes: z.string().trim().max(FIELD_MAX.note).optional().default(''),
  source: z.string().trim().max(FIELD_MAX.reference).optional().default(''),
});

export type CallRequestValues = z.infer<typeof callRequestSchema>;

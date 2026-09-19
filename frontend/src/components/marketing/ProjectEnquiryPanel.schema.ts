import { FIELD_MAX } from '@freetheplatform/web-security';
import { email, requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { normaliseWebsiteUrl } from '@/lib/api';

export const projectEnquirySchema = z.object({
  project_type: z.enum(['website', 'automation', 'both']),
  // Free text, because the "custom" option lets people write their own figure.
  budget: requiredString('reference', 'Budget is required.'),
  // Bounded before `normaliseWebsiteUrl` rather than after: the transform adds
  // a scheme, so checking the result would let a longer input through.
  website: z
    .string()
    .trim()
    .min(1, 'Website is required.')
    .max(FIELD_MAX.url)
    .transform(normaliseWebsiteUrl),
  email: email({ required: 'Email is required.' }),
  phone: z.string().trim().max(FIELD_MAX.phone).optional().default(''),
  notes: z.string().trim().max(FIELD_MAX.note).optional().default(''),
});

export type ProjectEnquiryValues = z.infer<typeof projectEnquirySchema>;

import { FIELD_MAX } from '@freetheplatform/web-security';
import { email } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { normaliseWebsiteUrl } from '@/lib/api';

export const projectEnquirySchema = z.object({
  project_type: z.enum(['website', 'automation', 'both', 'seo']),
  // Free text on one line, because the "custom" option lets people write
  // their own figure in words rather than pick one. Blank for an SEO audit,
  // which has a fixed price; the API requires it for every other scope.
  budget: z.string().trim().max(FIELD_MAX.line).optional().default(''),
  // Optional, so someone with no website yet can still enquire. Bounded before
  // `normaliseWebsiteUrl` rather than after: the transform adds a scheme, so
  // checking the result would let a longer input through.
  website: z
    .string()
    .trim()
    .max(FIELD_MAX.url)
    .transform(normaliseWebsiteUrl)
    .optional()
    .default(''),
  email: email({ required: 'Email is required.' }),
  phone: z.string().trim().max(FIELD_MAX.phone).optional().default(''),
  notes: z.string().trim().max(FIELD_MAX.note).optional().default(''),
});

export type ProjectEnquiryValues = z.infer<typeof projectEnquirySchema>;

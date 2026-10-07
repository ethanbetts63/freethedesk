import { FIELD_MAX } from '@freetheplatform/web-security';
import { email } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { normaliseWebsiteUrl } from '@/lib/api';

/** The free enquiry's fields, plus which package is being bought. */
export const packageOrderSchema = z.object({
  package: z.enum(['website_small', 'website_large', 'web_application', 'automation_discovery']),
  // Optional, so someone with no website yet can still buy one. Bounded before
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

export type PackageOrderValues = z.infer<typeof packageOrderSchema>;

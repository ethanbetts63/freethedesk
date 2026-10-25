import { FIELD_MAX } from '@freetheplatform/web-security';
import { email, requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { normaliseWebsiteUrl } from '@/lib/api';

export const affiliateSignupSchema = z.object({
  name: requiredString('name', 'Your name is required.'),
  email: email({ required: 'Email is required.' }),
  podcast: requiredString('business_name', "Your podcast's name is required."),
  // The site the free audit is written about. Bounded before
  // `normaliseWebsiteUrl` rather than after: the transform adds a scheme, so
  // checking the result would let a longer input through.
  website: z
    .string()
    .trim()
    .min(1, 'The website to audit is required.')
    .max(FIELD_MAX.url)
    .transform(normaliseWebsiteUrl),
  notes: z.string().trim().max(FIELD_MAX.note).optional().default(''),
});

export type AffiliateSignupValues = z.infer<typeof affiliateSignupSchema>;

import { FIELD_MAX } from '@freetheplatform/web-security';
import { email, requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { normaliseWebsiteUrl } from '@/lib/api';

export const affiliateSignupSchema = z.object({
  name: requiredString('name', 'Your name is required.'),
  email: email({ required: 'Email is required.' }),
  business: requiredString('business_name', 'Your business name is required.'),
  // Optional: the free audit is a bonus. Bounded before `normaliseWebsiteUrl`
  // rather than after: the transform adds a scheme, so checking the result
  // would let a longer input through.
  website: z
    .string()
    .trim()
    .max(FIELD_MAX.url)
    .transform((value) => (value ? normaliseWebsiteUrl(value) : '')),
});

export type AffiliateSignupValues = z.infer<typeof affiliateSignupSchema>;

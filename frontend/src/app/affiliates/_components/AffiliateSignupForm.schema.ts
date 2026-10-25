import { FIELD_MAX } from '@freetheplatform/web-security';
import { email, requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { normaliseWebsiteUrl } from '@/lib/api';

/**
 * Track B under the forms standard. The field names are the registration
 * serializer's (`affiliates.serializers.registration`): no password, the
 * account is opened by an emailed code.
 */
export const affiliateSignupSchema = z.object({
  contact_name: requiredString('name', 'Your name is required.'),
  email: email({ required: 'Email is required.' }),
  business_name: requiredString('business_name', 'Your business name is required.'),
  // Optional: the free audit is a bonus. Bounded before `normaliseWebsiteUrl`
  // rather than after: the transform adds a scheme, so checking the result
  // would let a longer input through.
  website: z
    .string()
    .trim()
    .max(FIELD_MAX.url)
    .transform((value) => (value ? normaliseWebsiteUrl(value) : '')),
  // An unticked checkbox sends nothing; a ticked one sends "on".
  accepted_terms: z
    .literal('on', { message: 'Accept the Affiliate Program Terms to continue.' })
    .transform(() => true),
});

export type AffiliateSignupValues = z.infer<typeof affiliateSignupSchema>;

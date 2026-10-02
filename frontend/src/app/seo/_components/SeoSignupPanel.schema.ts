import { FIELD_MAX } from '@freetheplatform/web-security';
import { email } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { normaliseWebsiteUrl } from '@/lib/api';

/**
 * Track B under the forms standard. No password: this endpoint starts the
 * session itself, so there is no credential to collect or validate.
 *
 * `plan` is set by the panel rather than typed. Its radio group carries its own
 * `name` attribute, which used to travel to Django alongside the real fields; a
 * `z.object` strips what it does not declare.
 */
export const seoSignupSchema = z.object({
  email: email({ required: 'Email is required.' }),
  phone: z.string().trim().max(FIELD_MAX.phone).optional().default(''),
  // Bounded before `normaliseWebsiteUrl` rather than after: the transform
  // adds a scheme, so checking the result would let a longer input through.
  website: z
    .string()
    .trim()
    .min(1, 'Website is required.')
    .max(FIELD_MAX.url)
    .transform(normaliseWebsiteUrl),
  // A subscription always starts monthly; the slower cadences come later.
  plan: z.enum(['monthly', 'oneoff'], { message: 'Choose a plan.' }),
});

export type SeoSignupValues = z.infer<typeof seoSignupSchema>;

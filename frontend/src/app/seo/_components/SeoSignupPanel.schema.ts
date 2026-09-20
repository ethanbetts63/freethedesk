import { FIELD_MAX } from '@freetheplatform/web-security';
import { email } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { normaliseWebsiteUrl } from '@/lib/api';

/**
 * Track B under the forms standard. No password: this endpoint starts the
 * session itself, so there is no credential to collect or validate.
 *
 * `plan` and `report_type` are set by the panel rather than typed. Their radio
 * groups carry their own `name` attributes, which used to travel to Django
 * alongside the real fields; a `z.object` strips what it does not declare.
 *
 * The cross-field rule below is Django's, duplicated here to save a round trip
 * rather than to replace it — `SeoRegistrationSerializer.validate` is still
 * what enforces it.
 */
export const seoSignupSchema = z
  .object({
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
    report_type: z.enum(['gbp', 'seo', 'both'], { message: 'Choose what to report on.' }),
    plan: z.enum(['monthly', 'quarterly', 'biannual', 'oneoff'], { message: 'Choose a plan.' }),
  })
  .refine((v) => v.report_type !== 'gbp' || v.plan === 'oneoff', {
    message: 'The Google Business Profile audit is a one-time product.',
    path: ['plan'],
  })
  .refine((v) => v.report_type === 'gbp' || v.plan !== 'oneoff', {
    message: 'Website SEO reporting is a recurring service.',
    path: ['plan'],
  });

export type SeoSignupValues = z.infer<typeof seoSignupSchema>;

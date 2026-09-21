import { FIELD_MAX } from '@freetheplatform/web-security';
import { z } from 'zod';

/**
 * Every string is bounded. This is a public, unauthenticated Server Action that
 * forwards straight to the enquiries API, so an unbounded field is a free
 * write of arbitrary size into someone else's database. The ceilings come
 * from FIELD_MAX so they match what the Enquiry model accepts — the brand
 * input's `maxLength={28}` is a client-side courtesy, not a constraint on
 * anything that posts here.
 */
const CONFIGURATION_MAX_BYTES = 8_000;

export const configuratorEnquirySchema = z.object({
  name: z.string().min(1, 'Name is required.').max(FIELD_MAX.name),
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.')
    .max(FIELD_MAX.email),
  phone: z.string().min(1, 'Phone number is required.').max(FIELD_MAX.phone),
  business: z.string().max(FIELD_MAX.business_name),
  website: z.string().max(FIELD_MAX.url).optional().default(''),
  message: z.string().max(FIELD_MAX.note),
  configuration: z
    .string()
    .max(CONFIGURATION_MAX_BYTES)
    .transform((raw, ctx) => {
      try {
        return JSON.parse(raw) as object;
      } catch {
        ctx.addIssue({
          code: 'custom',
          message: 'Your configuration could not be read. Please try again.',
        });
        return z.NEVER;
      }
    }),
});

export type ConfiguratorEnquiryValues = z.infer<typeof configuratorEnquirySchema>;

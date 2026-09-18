import { z } from 'zod';

/**
 * Every string is bounded. This is a public, unauthenticated Server Action that
 * forwards straight to the enquiries API, so an unbounded field is a free
 * write of arbitrary size into someone else's database. The limits are
 * generous versions of what the controls can actually produce: the brand input
 * is `maxLength={28}`, but that is a client-side courtesy and not a constraint
 * on anything that posts here.
 */
const CONFIGURATION_MAX_BYTES = 8_000;

export const configuratorEnquirySchema = z.object({
  name: z.string().min(1, 'Name is required.').max(120),
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.').max(254),
  phone: z.string().min(1, 'Phone number is required.').max(40),
  business: z.string().max(200),
  website: z.string().max(2048).optional().default(''),
  message: z.string().max(2000),
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

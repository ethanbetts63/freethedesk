import { z } from 'zod';

/** What the server accepts: 3 to 24 letters, digits or hyphens, spaces ignored. */
export const affiliateCodeSchema = z.object({
  code: z
    .string()
    .transform((value) => value.replace(/\s+/g, '').toUpperCase())
    .pipe(
      z
        .string()
        .min(3, 'A code is 3 to 24 letters, digits or hyphens.')
        .max(24, 'A code is 3 to 24 letters, digits or hyphens.')
        .regex(/^[A-Z0-9-]+$/, 'A code is 3 to 24 letters, digits or hyphens.'),
    ),
});

export type AffiliateCodeValues = z.infer<typeof affiliateCodeSchema>;

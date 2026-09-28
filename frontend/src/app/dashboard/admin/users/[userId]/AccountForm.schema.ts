import { FIELD_MAX } from '@freetheplatform/web-security';
import { email, requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

/**
 * Track B: flat fields, one submit.
 *
 * Each flag arrives as a hidden `false` followed by a checkbox's `true`, so the
 * last value wins either way. On your own account the flags are not rendered
 * at all, and are absent rather than false.
 */
const flag = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .optional();

export const accountSchema = z.object({
  id: z.coerce.number().int().positive(),
  username: requiredString('email', 'A username is required.'),
  // The username as loaded, so an untouched one is left out and can follow the email.
  original_username: z.string().max(FIELD_MAX.email),
  email: email({ required: false, invalid: 'That email address does not look right.' }),
  first_name: z.string().trim().max(FIELD_MAX.name),
  last_name: z.string().trim().max(FIELD_MAX.name),
  is_active: flag,
  is_staff: flag,
});

export type AccountValues = z.infer<typeof accountSchema>;

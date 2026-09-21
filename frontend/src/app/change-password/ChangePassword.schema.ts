import { FIELD_MAX } from '@freetheplatform/web-security';
import { password } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { MINIMUM_PASSWORD_LENGTH } from '@/components/auth/PasswordFields';

/**
 * Track B. The `.refine()` is a confirm-field match, which is one rule over two
 * adjacent fields rather than a rule deciding whether other fields are
 * required; see ResetPasswordConfirm.schema.ts.
 *
 * `current_password` is bounded but not length-checked: it is an existing
 * credential being typed, not a new one being chosen, and a minimum here would
 * reject an old password predating the current rule rather than let the server
 * say so.
 */
export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, 'Your current password is required.')
      .max(FIELD_MAX.password),
    new_password: password(MINIMUM_PASSWORD_LENGTH),
    confirm_password: z.string().max(FIELD_MAX.password),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    message: 'Those two passwords do not match.',
    path: ['confirm_password'],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

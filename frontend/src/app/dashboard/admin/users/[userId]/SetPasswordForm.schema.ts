import { FIELD_MAX } from '@freetheplatform/web-security';
import { password } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { MINIMUM_PASSWORD_LENGTH } from '@/components/auth/PasswordFields';

/**
 * Track B. The `.refine()` is a confirm-field match, one rule over two
 * adjacent fields; see ChangePasswordScreen.schema.ts.
 */
export const setPasswordSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    new_password: password(MINIMUM_PASSWORD_LENGTH),
    confirm_password: z.string().max(FIELD_MAX.password),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    message: 'Those two passwords do not match.',
    path: ['confirm_password'],
  });

export type SetPasswordValues = z.infer<typeof setPasswordSchema>;

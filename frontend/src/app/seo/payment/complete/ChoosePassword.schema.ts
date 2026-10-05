import { FIELD_MAX } from '@freetheplatform/web-security';
import { password } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { MINIMUM_PASSWORD_LENGTH } from '@/components/auth/PasswordFields';

/**
 * Track B. `reference` travels as a hidden field so the action knows which
 * signup's claim cookie to read; the token itself never enters the form. The
 * `.refine()` is the confirm-field match, as in ChangePassword.schema.ts.
 */
export const choosePasswordSchema = z
  .object({
    reference: z.string().min(1).max(FIELD_MAX.reference),
    new_password: password(MINIMUM_PASSWORD_LENGTH),
    confirm_password: z.string().max(FIELD_MAX.password),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    message: 'Those two passwords do not match.',
    path: ['confirm_password'],
  });

import { FIELD_MAX } from '@freetheplatform/web-security';
import { email, password } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { MINIMUM_PASSWORD_LENGTH } from '@/components/auth/PasswordFields';

/**
 * Track B. `verification_code` is the account's first password, so it is bounded but not
 * length-checked, like any existing credential: the server decides. The `.refine()` is the
 * confirm-field match, as in ChangePassword.schema.ts.
 */
export const verifyEmailSchema = z
  .object({
    email: email(),
    verification_code: z
      .string()
      .trim()
      .min(1, 'Enter the verification code from your email.')
      .max(FIELD_MAX.password),
    new_password: password(MINIMUM_PASSWORD_LENGTH),
    confirm_password: z.string().max(FIELD_MAX.password),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    message: 'Those two passwords do not match.',
    path: ['confirm_password'],
  });

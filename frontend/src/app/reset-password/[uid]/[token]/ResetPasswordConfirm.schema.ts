import { password } from '@freetheplatform/web-security/schema';
import { FIELD_MAX } from '@freetheplatform/web-security';
import { z } from 'zod';

import { MINIMUM_PASSWORD_LENGTH } from '@/components/auth/PasswordFields';

/**
 * Track B despite the `.refine()`.
 *
 * A confirm-field match is two adjacent fields carrying one rule, not a rule
 * that decides whether other fields are required — the shape the track table's
 * cross-field question is asking about. The form is flat, submits once, and
 * needs nothing `useFieldArray` provides.
 *
 * `uid` and `token` come from the route, not from the person. They are bounded
 * because they still arrive as form fields and a Server Action has no idea
 * where a field came from.
 */
export const resetConfirmSchema = z
  .object({
    uid: z.string().trim().min(1).max(64),
    token: z.string().trim().min(1).max(64),
    new_password: password(MINIMUM_PASSWORD_LENGTH),
    confirm_password: z.string().max(FIELD_MAX.password),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    message: 'Those two passwords do not match.',
    path: ['confirm_password'],
  });

export type ResetConfirmValues = z.infer<typeof resetConfirmSchema>;

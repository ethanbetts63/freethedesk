import { email } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

/** Track B: one field, one POST, one result. */
export const resetRequestSchema = z.object({
  email: email({ required: 'Email is required.' }),
});

export type ResetRequestValues = z.infer<typeof resetRequestSchema>;

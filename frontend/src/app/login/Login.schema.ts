import { FIELD_MAX } from '@freetheplatform/web-security';
import { z } from 'zod';

/**
 * Track B, and the reason the fields are bounded but not trimmed: these are
 * existing credentials being typed, not new ones being chosen. Trailing
 * whitespace may be part of a password, and a minimum length here would reject
 * a credential that predates the current rule rather than let the server say
 * so. The ceiling is what stops a caller handing the hasher something enormous.
 */
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email is required.').max(FIELD_MAX.email),
  password: z.string().min(1, 'Password is required.').max(FIELD_MAX.password),
});

export type LoginValues = z.infer<typeof loginSchema>;

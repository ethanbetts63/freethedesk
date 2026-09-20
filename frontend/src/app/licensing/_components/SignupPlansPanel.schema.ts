import { FIELD_MAX } from '@freetheplatform/web-security';
import { email, password } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { DEALER_STATES } from '@/lib/dealerStates';

/**
 * Track B under the forms standard: flat fields, one submit, one result.
 *
 * `plan` is set by the panel rather than typed, and the radio group that drives
 * that choice carries its own `name` for accessibility. Parsing through this
 * schema is what keeps that UI-only field out of the request — a `z.object`
 * strips what it does not declare.
 *
 * `password()` takes its minimum from the package, which matches
 * `MinimumLengthValidator`'s `OPTIONS` in config/settings.py. This form used to
 * say "at least 8 characters" against a server minimum of 12, so a dealer could
 * clear the browser check and be rejected anyway.
 */
export const dealerSignupSchema = z.object({
  email: email({ required: 'Email is required.' }),
  phone: z.string().trim().max(FIELD_MAX.phone).optional().default(''),
  password: password(),
  state: z.enum(DEALER_STATES, { message: 'Choose your state or territory.' }),
  plan: z.enum(['licensing', 'contracts', 'complete'], { message: 'Choose a plan.' }),
});

export type DealerSignupValues = z.infer<typeof dealerSignupSchema>;

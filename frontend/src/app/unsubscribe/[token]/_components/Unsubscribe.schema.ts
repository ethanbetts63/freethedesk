import { requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

/**
 * Track B under the forms standard. The only field is the signed token from
 * the route, carried in a hidden input so the button's POST is a real submit.
 */
export const unsubscribeSchema = z.object({
  token: requiredString('line', "That unsubscribe link isn't valid."),
});

export type UnsubscribeValues = z.infer<typeof unsubscribeSchema>;

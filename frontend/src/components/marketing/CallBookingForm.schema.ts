import { FIELD_MAX } from '@freetheplatform/web-security';
import { email, requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { normaliseWebsiteUrl } from '@/lib/api';

/**
 * Track B under the forms standard. The field names are the booking serializer's
 * (`seo.serializers.call_booking`). The call is by phone, so the number is required, and the
 * email carries the confirmation. `starts_at` is one of the offered slots, as the API sent it.
 */
export const callBookingSchema = z.object({
  starts_at: requiredString('token', 'Pick a time for the call.'),
  name: requiredString('name', 'Your name is required.'),
  // Bounded before `normaliseWebsiteUrl`, which adds a scheme to "yoursite.com.au".
  website: z
    .string()
    .trim()
    .min(1, 'Your website is required.')
    .max(FIELD_MAX.url)
    .transform(normaliseWebsiteUrl),
  phone: requiredString('phone', 'Your phone number is required.'),
  email: email({ required: 'Your email is required.' }),
  notes: z.string().trim().max(FIELD_MAX.note).optional().default(''),
  source: z.string().trim().max(FIELD_MAX.reference).optional().default(''),
});

export type CallBookingValues = z.infer<typeof callBookingSchema>;

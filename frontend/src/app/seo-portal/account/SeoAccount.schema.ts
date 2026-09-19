import { FIELD_MAX } from '@freetheplatform/web-security';
import { requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

export const seoAccountSchema = z
  .object({
    business_name: requiredString('business_name', 'Business name is required.'),
    contact_name: requiredString('name', 'Contact name is required.'),
    phone: z.string().trim().max(FIELD_MAX.phone).optional().default(''),
    website: z.string().trim().max(FIELD_MAX.url).optional().default(''),
    // Only rendered (and so only present) for a first-time setup. Bounded but
    // not trimmed: whitespace can be part of a password. Django's validators
    // are what decide whether it is strong enough.
    password: z.string().max(FIELD_MAX.password).optional().default(''),
    password_confirmation: z.string().max(FIELD_MAX.password).optional().default(''),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: 'The passwords do not match.',
    path: ['password_confirmation'],
  });

export type SeoAccountValues = z.infer<typeof seoAccountSchema>;

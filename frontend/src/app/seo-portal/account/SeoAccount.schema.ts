import { FIELD_MAX } from '@freetheplatform/web-security';
import { requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

export const seoAccountSchema = z.object({
  business_name: requiredString('business_name', 'Business name is required.'),
  contact_name: requiredString('name', 'Contact name is required.'),
  phone: z.string().trim().max(FIELD_MAX.phone).optional().default(''),
  website: z.string().trim().max(FIELD_MAX.url).optional().default(''),
});

export type SeoAccountValues = z.infer<typeof seoAccountSchema>;

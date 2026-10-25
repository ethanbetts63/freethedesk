import { FIELD_MAX } from '@freetheplatform/web-security';
import { requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

export const affiliateAccountSchema = z.object({
  business_name: requiredString('business_name', 'The podcast or business name is required.'),
  contact_name: requiredString('name', 'Your name is required.'),
  website: z.string().trim().max(FIELD_MAX.url).optional().default(''),
});

export type AffiliateAccountValues = z.infer<typeof affiliateAccountSchema>;

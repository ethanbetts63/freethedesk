import { FIELD_MAX } from '@freetheplatform/web-security';
import { requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { DEALER_STATES } from '@/lib/dealerStates';

export const portalAccountSchema = z.object({
  business_name: requiredString('business_name', 'Business name is required.'),
  contact_name: requiredString('name', 'Contact name is required.'),
  phone: z.string().trim().max(FIELD_MAX.phone).optional().default(''),
  state: z.enum(DEALER_STATES),
});

export type PortalAccountValues = z.infer<typeof portalAccountSchema>;

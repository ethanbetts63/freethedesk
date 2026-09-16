import { z } from 'zod';

import { DEALER_STATES } from '@/lib/dealerStates';

export const portalAccountSchema = z.object({
  business_name: z.string().min(1, 'Business name is required.'),
  contact_name: z.string().min(1, 'Contact name is required.'),
  phone: z.string().optional().default(''),
  state: z.enum(DEALER_STATES),
});

export type PortalAccountValues = z.infer<typeof portalAccountSchema>;

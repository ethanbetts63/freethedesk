import { email, requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

/**
 * Track B under the forms standard. The field names are the registration
 * serializer's (`affiliates.serializers.registration`): no password, the
 * account is opened by an emailed code. No website: the portal asks for it
 * when the free audit is set up.
 */
export const affiliateSignupSchema = z.object({
  contact_name: requiredString('name', 'Your name is required.'),
  email: email({ required: 'Email is required.' }),
  business_name: requiredString('business_name', 'Your business name is required.'),
  // An unticked checkbox sends nothing; a ticked one sends "on".
  accepted_terms: z
    .literal('on', { message: 'Accept the Affiliate Program Terms to continue.' })
    .transform(() => true),
});

export type AffiliateSignupValues = z.infer<typeof affiliateSignupSchema>;

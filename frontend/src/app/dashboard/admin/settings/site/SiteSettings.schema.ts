import { requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

const price = requiredString('token', 'This field is required.');

export const siteSettingsSchema = z.object({
  licensing_price: price,
  contracts_price: price,
  complete_price: price,
  seo_monthly_price: price,
  seo_quarterly_price: price,
  seo_yearly_price: price,
  seo_oneoff_price: price,
});

export type SiteSettingsValues = z.infer<typeof siteSettingsSchema>;

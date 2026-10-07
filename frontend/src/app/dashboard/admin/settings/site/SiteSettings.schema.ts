import { requiredString } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

/* Counts and prices alike arrive as strings from number inputs; the API checks the ranges. */
const price = requiredString('token', 'This field is required.');

export const siteSettingsSchema = z.object({
  licensing_price: price,
  contracts_price: price,
  complete_price: price,
  seo_monthly_price: price,
  seo_quarterly_price: price,
  seo_yearly_price: price,
  seo_oneoff_price: price,
  hourly_rate: price,
  discovery_hours: price,
  website_small_pages: price,
  website_small_page_price: price,
  website_large_pages: price,
  website_large_page_price: price,
  web_app_from_price: price,
  automation_from_price: price,
});

export type SiteSettingsValues = z.infer<typeof siteSettingsSchema>;

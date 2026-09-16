import { z } from "zod";

const price = z.string().min(1, "This field is required.");

export const siteSettingsSchema = z.object({
  licensing_price: price,
  contracts_price: price,
  complete_price: price,
  seo_monthly_price: price,
  seo_quarterly_price: price,
  seo_biannual_price: price,
  seo_oneoff_price: price,
  gbp_audit_price: price,
});

export type SiteSettingsValues = z.infer<typeof siteSettingsSchema>;

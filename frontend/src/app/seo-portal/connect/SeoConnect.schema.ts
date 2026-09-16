import { z } from 'zod';

const text = z.string().optional().default('');

export const seoConnectSchema = z.object({
  website_url: text,
  search_console_property: text,
  google_business_profile_url: text,
  primary_location: text,
  target_keywords: text,
  competitors: text,
  notes: text,
  intent: z.enum(['draft', 'submit']).default('draft'),
});

export type SeoConnectValues = z.infer<typeof seoConnectSchema>;

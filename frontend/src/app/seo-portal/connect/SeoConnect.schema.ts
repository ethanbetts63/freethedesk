import { FIELD_MAX } from '@freetheplatform/web-security';
import { z } from 'zod';

/** One line each. */
const line = z.string().trim().max(FIELD_MAX.line).optional().default('');
/** A paragraph the customer types. */
const note = z.string().trim().max(FIELD_MAX.note).optional().default('');
const url = z.string().trim().max(FIELD_MAX.url).optional().default('');

export const seoConnectSchema = z.object({
  website_url: url,
  search_console_property: line,
  google_business_profile_url: url,
  primary_location: line,
  target_keywords: note,
  competitors: note,
  notes: note,
  intent: z.enum(['draft', 'submit']).default('draft'),
});

export type SeoConnectValues = z.infer<typeof seoConnectSchema>;

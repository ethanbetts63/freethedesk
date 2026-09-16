import { z } from 'zod';

import { normaliseWebsiteUrl } from '@/lib/api';

export const projectEnquirySchema = z.object({
  project_type: z.enum(['website', 'automation', 'both']),
  budget: z.string().min(1, 'Budget is required.'),
  website: z.string().min(1, 'Website is required.').transform(normaliseWebsiteUrl),
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
  phone: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export type ProjectEnquiryValues = z.infer<typeof projectEnquirySchema>;

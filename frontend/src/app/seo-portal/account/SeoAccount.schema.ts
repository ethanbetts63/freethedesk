import { z } from 'zod';

export const seoAccountSchema = z
  .object({
    business_name: z.string().min(1, 'Business name is required.'),
    contact_name: z.string().min(1, 'Contact name is required.'),
    phone: z.string().optional().default(''),
    website: z.string().optional().default(''),
    // Only rendered (and so only present) for a first-time setup.
    password: z.string().optional().default(''),
    password_confirmation: z.string().optional().default(''),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: 'The passwords do not match.',
    path: ['password_confirmation'],
  });

export type SeoAccountValues = z.infer<typeof seoAccountSchema>;

import { z } from 'zod';

export const composeMessageSchema = z.object({
  to: z.string().email('Enter a valid email address.'),
  subject: z.string().min(1, 'Subject is required.'),
  body: z.string().min(1, 'Email body is required.'),
  relatedEnquiry: z.coerce.number().optional(),
  attachments: z.array(z.instanceof(File)).default([]),
});

export type ComposeMessageValues = z.infer<typeof composeMessageSchema>;

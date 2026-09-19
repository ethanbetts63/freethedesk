import { FIELD_MAX } from '@freetheplatform/web-security';
import { email } from '@freetheplatform/web-security/schema';
import { z } from 'zod';

import { normaliseWebsiteUrl } from '@/lib/api';

export const aiReadinessSchema = z.object({
  // Bounded before `normaliseWebsiteUrl` rather than after: the transform adds
  // a scheme, so checking the result would let a longer input through.
  website: z
    .string()
    .trim()
    .min(1, 'Website is required.')
    .max(FIELD_MAX.url)
    .transform(normaliseWebsiteUrl),
  email: email(),
});

export type AiReadinessValues = z.infer<typeof aiReadinessSchema>;

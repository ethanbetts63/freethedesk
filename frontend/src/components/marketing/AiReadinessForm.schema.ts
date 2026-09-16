import { z } from "zod";
import { normaliseWebsiteUrl } from "@/lib/api";

export const aiReadinessSchema = z.object({
  website: z.string().min(1, "Website is required.").transform(normaliseWebsiteUrl),
  email: z.string().email("Enter a valid email address."),
});

export type AiReadinessValues = z.infer<typeof aiReadinessSchema>;

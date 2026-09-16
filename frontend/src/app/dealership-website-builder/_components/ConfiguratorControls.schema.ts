import { z } from "zod";

export const configuratorEnquirySchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  phone: z.string().min(1, "Phone number is required."),
  business: z.string(),
  website: z.string().optional().default(""),
  message: z.string(),
  configuration: z.string().transform((raw, ctx) => {
    try {
      return JSON.parse(raw) as object;
    } catch {
      ctx.addIssue({ code: "custom", message: "Your configuration could not be read. Please try again." });
      return z.NEVER;
    }
  }),
});

export type ConfiguratorEnquiryValues = z.infer<typeof configuratorEnquirySchema>;

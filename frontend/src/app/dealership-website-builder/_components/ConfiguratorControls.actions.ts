"use server";

import { SERVER_API_BASE_URL } from "@/lib/serverApi";
import { configuratorEnquirySchema } from "./ConfiguratorControls.schema";

export interface ConfiguratorEnquiryState {
  status: "idle" | "success" | "error";
}

export async function submitConfiguratorEnquiry(
  _prev: ConfiguratorEnquiryState,
  formData: FormData,
): Promise<ConfiguratorEnquiryState> {
  const parsed = configuratorEnquirySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error" };
  }

  try {
    const response = await fetch(`${SERVER_API_BASE_URL}/api/enquiries/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...parsed.data, help_with: "website_builder" }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      return { status: "error" };
    }
  } catch {
    return { status: "error" };
  }

  return { status: "success" };
}

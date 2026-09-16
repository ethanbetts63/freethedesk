"use server";

import { SERVER_API_BASE_URL } from "@/lib/serverApi";
import { projectEnquirySchema } from "./ProjectEnquiryPanel.schema";

export interface ProjectEnquiryState {
  status: "idle" | "success" | "error";
  error?: string;
}

const FAILURE_MESSAGE = "We could not send that. Please try again.";

export async function submitProjectEnquiry(
  _prev: ProjectEnquiryState,
  formData: FormData,
): Promise<ProjectEnquiryState> {
  const parsed = projectEnquirySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  try {
    const response = await fetch(`${SERVER_API_BASE_URL}/api/project-enquiries/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      return { status: "error", error: FAILURE_MESSAGE };
    }
  } catch {
    return { status: "error", error: FAILURE_MESSAGE };
  }

  return { status: "success" };
}

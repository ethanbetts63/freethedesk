"use server";

import { SERVER_API_BASE_URL } from "@/lib/serverApi";
import { aiReadinessSchema } from "./AiReadinessForm.schema";

export interface AiReadinessState {
  status: "idle" | "success" | "error";
  error?: string;
}

const FAILURE_MESSAGE = "We could not start the check. Please try again.";

export async function submitAiReadiness(
  _prev: AiReadinessState,
  formData: FormData,
): Promise<AiReadinessState> {
  const parsed = aiReadinessSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  try {
    const response = await fetch(`${SERVER_API_BASE_URL}/api/ai-readiness/`, {
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

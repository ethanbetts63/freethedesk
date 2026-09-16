"use server";

import { serverApiFetch } from "@/lib/serverApi";
import type { DealerAccount } from "@/lib/dealerApi";
import { portalAccountSchema } from "./PortalAccount.schema";

export interface PortalAccountState {
  status: "idle" | "success" | "error";
  error?: string;
  account?: DealerAccount;
}

const FAILURE_MESSAGE = "Your details could not be saved.";

export async function submitPortalAccount(
  _prev: PortalAccountState,
  formData: FormData,
): Promise<PortalAccountState> {
  const parsed = portalAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  const response = await serverApiFetch("/api/dealers/me/", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (!response.ok) {
    return { status: "error", error: FAILURE_MESSAGE };
  }

  const account = (await response.json()) as DealerAccount;
  return { status: "success", account };
}

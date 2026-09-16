"use server";

import { serverApiFetch } from "@/lib/serverApi";
import type { SiteSettings } from "@/lib/adminApi";
import { siteSettingsSchema } from "./SiteSettings.schema";

export interface SiteSettingsState {
  status: "idle" | "success" | "error";
  error?: string;
  settings?: SiteSettings;
}

const FAILURE_MESSAGE = "Site settings could not be saved.";

export async function submitSiteSettings(
  _prev: SiteSettingsState,
  formData: FormData,
): Promise<SiteSettingsState> {
  const parsed = siteSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", error: parsed.error.issues[0]?.message ?? FAILURE_MESSAGE };
  }

  const response = await serverApiFetch("/api/admin/site-settings/", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parsed.data),
  });
  if (!response.ok) {
    return { status: "error", error: FAILURE_MESSAGE };
  }

  const settings = (await response.json()) as SiteSettings;
  return { status: "success", settings };
}

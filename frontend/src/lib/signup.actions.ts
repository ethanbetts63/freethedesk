"use server";

import { SERVER_API_BASE_URL } from "@/lib/serverApi";
import { relaySetCookies } from "@/lib/serverCookies";
import { firstError, normaliseWebsiteUrl } from "@/lib/api";

export interface SignupState {
  status: "idle" | "success" | "error";
  error?: string;
}

export interface SignupConfig {
  endpoint: string;
  /** Set when `endpoint` itself establishes the session (its own Set-Cookie),
   *  so this skips the separate login call a plain account-creation endpoint needs. */
  sessionFromSignup?: boolean;
}

const GENERIC_FAILURE = "Unable to create your account.";

/** Bind `config` with `.bind(null, config)` before passing to `useActionState`. */
export async function submitSignup(
  config: SignupConfig,
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const values = Object.fromEntries(formData) as Record<string, string>;
  if (values.website?.trim()) values.website = normaliseWebsiteUrl(values.website);
  const email = values.email ?? "";
  const password = values.password ?? "";

  let response: Response;
  try {
    response = await fetch(`${SERVER_API_BASE_URL}${config.endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    return { status: "error", error: GENERIC_FAILURE };
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { status: "error", error: firstError(data, GENERIC_FAILURE) };
  }

  // Signing up on a marketing page must not drag the auth context onto it, so
  // the session is only established once the account is confirmed created.
  if (config.sessionFromSignup) {
    await relaySetCookies(response);
  } else {
    let loginResponse: Response;
    try {
      loginResponse = await fetch(`${SERVER_API_BASE_URL}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
        signal: AbortSignal.timeout(15000),
      });
    } catch {
      return { status: "error", error: "Account created, but signing you in failed. Please log in." };
    }
    if (!loginResponse.ok) {
      return { status: "error", error: "Account created, but signing you in failed. Please log in." };
    }
    await relaySetCookies(loginResponse);
  }

  return { status: "success" };
}

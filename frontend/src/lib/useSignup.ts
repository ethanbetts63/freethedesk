"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { normaliseWebsiteUrl, postJson, type Principal } from "@/lib/api";

export type SignupStatus = "idle" | "submitting" | "error";

/**
 * Create an account from a plan-picker form and continue to payment. Licensing
 * signs in with the submitted password; the lower-friction SEO endpoint creates
 * the authenticated session itself.
 */
export function useSignup({
  endpoint,
  nextHref,
  sessionFromSignup = false,
}: {
  endpoint: string;
  nextHref: string;
  sessionFromSignup?: boolean;
}) {
  const router = useRouter();
  const { login, adoptSession } = useAuth();
  const [status, setStatus] = useState<SignupStatus>("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>, extra: Record<string, string>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    const values = new FormData(event.currentTarget);
    // Signup forms take a website as a plain host, so add the scheme the API's
    // URLField needs rather than rejecting what the placeholder told them to type.
    const website = values.get("website");
    if (typeof website === "string" && website.trim()) values.set("website", normaliseWebsiteUrl(website));
    const email = String(values.get("email") ?? "");
    const password = String(values.get("password") ?? "");

    try {
      const result = await postJson<Principal>(endpoint, { ...Object.fromEntries(values.entries()), ...extra });
      if (sessionFromSignup) adoptSession(result);
      else await login(email, password);
      router.push(nextHref);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create your account.");
      setStatus("error");
    }
  }

  return { submit, status, error };
}

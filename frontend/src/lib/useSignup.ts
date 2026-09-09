"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { SESSION_FLAG, login, normaliseWebsiteUrl, postJson, type Principal } from "@/lib/api";

export type SignupStatus = "idle" | "submitting" | "error";

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
  const [status, setStatus] = useState<SignupStatus>("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>, extra: Record<string, string>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    const values = new FormData(event.currentTarget);

    const website = values.get("website");
    if (typeof website === "string" && website.trim()) values.set("website", normaliseWebsiteUrl(website));
    const email = String(values.get("email") ?? "");
    const password = String(values.get("password") ?? "");

    try {
      await postJson<Principal>(endpoint, { ...Object.fromEntries(values.entries()), ...extra });
      // Signing up on a marketing page must not drag the auth context onto it.
      // The flag is all the provider on the destination needs to pick the
      // session up; it fetches the profile itself on mount.
      if (!sessionFromSignup) await login(email, password);
      localStorage.setItem(SESSION_FLAG, "1");
      router.push(nextHref);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create your account.");
      setStatus("error");
    }
  }

  return { submit, status, error };
}

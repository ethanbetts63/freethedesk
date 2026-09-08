"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { postJson } from "@/lib/api";

export type SignupStatus = "idle" | "submitting" | "error";

/**
 * Create an account from a plan-picker form, then sign in and continue to
 * payment. Shared by the licensing and SEO signups: both post the whole form
 * plus the chosen plan, and both depend on the new account being signed in
 * before the payment page can prepare a checkout.
 */
export function useSignup({ endpoint, nextHref }: { endpoint: string; nextHref: string }) {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState<SignupStatus>("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>, extra: Record<string, string>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") ?? "");
    const password = String(values.get("password") ?? "");

    try {
      await postJson(endpoint, { ...Object.fromEntries(values.entries()), ...extra });
      await login(email, password);
      router.push(nextHref);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create your account.");
      setStatus("error");
    }
  }

  return { submit, status, error };
}

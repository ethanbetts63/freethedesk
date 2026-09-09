"use client";

import { FormEvent, useState } from "react";

export type EnquiryStatus = "idle" | "submitting" | "success";

/**
 * Fire-and-forget marketing forms: post, show an inline success state, reset.
 *
 * Distinct from `useSignup`, which creates an account and then authenticates
 * and redirects. These forms have no session and no navigation - the whole
 * interaction stays on the page.
 *
 * `send` receives a reader for the form's own fields, so callers only write
 * the part that differs: which fields to pull and where to post them.
 */
export function useEnquiryForm(
  send: (value: (name: string) => string) => Promise<void>,
  fallbackError: string,
  onSuccess?: () => void,
) {
  const [status, setStatus] = useState<EnquiryStatus>("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? "").trim();

    setStatus("submitting");
    setError("");
    try {
      await send(value);
      form.reset();
      onSuccess?.();
      setStatus("success");
    } catch (reason) {
      setStatus("idle");
      setError(reason instanceof Error ? reason.message : fallbackError);
    }
  }

  return { status, error, submit };
}

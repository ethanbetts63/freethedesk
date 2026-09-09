"use client";

import { MovingColourButton } from "@/components/MovingColourButton";
import { normaliseWebsiteUrl, submitAiReadinessCheck } from "@/lib/api";
import styles from "./AiReadinessBanner.module.css";
import { useEnquiryForm } from "@/lib/useEnquiryForm";

/** The interactive half of the banner. Split out so the surrounding section and
    heading can render on the server wherever the banner is used inline. */
export function AiReadinessForm() {
  const { status, error, submit } = useEnquiryForm(
    (value) =>
      submitAiReadinessCheck({
        website: normaliseWebsiteUrl(value("website")),
        email: value("email"),
      }),
    "We could not start the check. Please try again.",
  );

  if (status === "success") {
    return (
      <p className={styles.success} role="status">
        <span aria-hidden="true">✓</span>
        Your free check is in the queue — we&apos;ll email you the result.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label>
        <span>Website</span>
        {/* Not type="url": it rejects a scheme-less host before submit() adds one. */}
        <input
          name="website"
          type="text"
          inputMode="url"
          placeholder="e.g. www.yoursite.com"
          autoComplete="url"
          required
        />
      </label>
      <label>
        <span>Email</span>
        <input name="email" type="email" placeholder="e.g. email@example.com" autoComplete="email" required />
      </label>
      <MovingColourButton
        type="submit"
        className={styles.submit}
        direction="right"
        size="compact"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Starting…" : "Run free check"}
      </MovingColourButton>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

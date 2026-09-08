"use client";

import { FormEvent, useState } from "react";

import { MovingColourButton } from "@/components/MovingColourButton";
import { normaliseWebsiteUrl, submitAiReadinessCheck } from "@/lib/api";
import styles from "./AiReadinessBanner.module.css";

                                                                                            
export function AiReadinessBanner({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? "").trim();

    setStatus("submitting");
    setError("");
    try {
      await submitAiReadinessCheck({
        website: normaliseWebsiteUrl(value("website")),
        email: value("email"),
        company_website: value("company_website"),
      });
      form.reset();
      setStatus("success");
    } catch (reason) {
      setStatus("idle");
      setError(reason instanceof Error ? reason.message : "We could not start the check. Please try again.");
    }
  }

  return (
    <section className={`${styles.banner} ${className}`} aria-labelledby="ai-readiness-banner-title">
      <div className={`shell ${styles.inner}`}>
        <div className={styles.copy}>
          <h2 id="ai-readiness-banner-title">
            Can AI systems <span className="moving-colour-text">read your site?</span>
          </h2>
        </div>

        {status === "success" ? (
          <p className={styles.success} role="status">
            <span aria-hidden="true">✓</span>
            Your free check is in the queue — we&apos;ll email you the result.
          </p>
        ) : (
          <form className={styles.form} onSubmit={submit}>
            <label className={styles.honeypot} aria-hidden="true">
              Company website
              <input name="company_website" tabIndex={-1} autoComplete="off" />
            </label>
            <label>
              <span>Website</span>
              {/* Deliberately not type="url": that rejects a scheme-less host before
                  submit() gets a chance to add one. normaliseWebsiteUrl and the API validate it. */}
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
        )}
      </div>
    </section>
  );
}

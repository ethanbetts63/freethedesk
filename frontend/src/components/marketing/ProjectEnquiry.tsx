"use client";

import { FormEvent, useState } from "react";

import { MovingColourButton } from "@/components/MovingColourButton";
import { normaliseWebsiteUrl, submitProjectEnquiry, type ProjectType } from "@/lib/api";
import styles from "./ProjectEnquiry.module.css";

const PROJECT_TYPES: { code: ProjectType; name: string }[] = [
  { code: "website", name: "Website" },
  { code: "automation", name: "Automation" },
  { code: "both", name: "Both" },
];

/** `custom` is the escape hatch: picking it swaps in a free-text amount field. */
const BUDGETS = ["$1,000", "$3,000", "$5,000", "custom"] as const;
type Budget = (typeof BUDGETS)[number];

const SUMMARY: Record<ProjectType, string> = {
  website: "A website built around what your business actually needs to do.",
  automation: "The repetitive work behind your business, handled without you.",
  both: "A website and the automation behind it, designed as one system.",
};

export function ProjectEnquiry({
  eyebrow = "Start here",
  /** Pages where this replaces the long form keep the existing #enquiry anchor. */
  id = "project-enquiry",
}: {
  eyebrow?: string;
  id?: string;
}) {
  const [projectType, setProjectType] = useState<ProjectType>("both");
  const [budget, setBudget] = useState<Budget>("$3,000");
  const [customBudget, setCustomBudget] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState("");

  const budgetLabel = budget === "custom" ? customBudget.trim() || "Custom" : budget;

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? "").trim();

    setStatus("submitting");
    setError("");
    try {
      await submitProjectEnquiry({
        project_type: projectType,
        budget: budget === "custom" ? customBudget.trim() : budget,
        website: normaliseWebsiteUrl(value("website")),
        email: value("email"),
        phone: value("phone"),
        company_website: value("company_website"),
      });
      form.reset();
      setCustomBudget("");
      setStatus("success");
    } catch (reason) {
      setStatus("idle");
      setError(reason instanceof Error ? reason.message : "We could not send that. Please try again.");
    }
  }

  return (
    <section className={`shell ${styles.section}`} id={id}>
      <div className={styles.panel}>
        <aside className={styles.chooser}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2>Tell us your budget.</h2>
          <p className={styles.lead}>
            We&apos;ll tell you what we could build for it—honestly, including when the answer is that it is not enough
            yet.
          </p>

          <div className={styles.choiceGroup}>
            <p>What do you need?</p>
            <div className={styles.typeGrid} role="radiogroup" aria-label="Project type">
              {PROJECT_TYPES.map((option) => (
                <button
                  className={`${projectType === option.code ? styles.choiceSelected : ""} ${
                    option.code === "both" ? styles.choiceRecommended : ""
                  }`}
                  key={option.code}
                  type="button"
                  role="radio"
                  aria-checked={projectType === option.code}
                  onClick={() => setProjectType(option.code)}
                >
                  <span>{option.name}</span>
                  {option.code === "both" && <small className="moving-colour-text">Most common</small>}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.choiceGroup}>
            <p>What&apos;s your budget?</p>
            <div className={styles.budgetGrid} role="radiogroup" aria-label="Budget">
              {BUDGETS.map((option) => (
                <button
                  className={budget === option ? styles.choiceSelected : ""}
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={budget === option}
                  onClick={() => setBudget(option)}
                >
                  <span>{option === "custom" ? "Custom" : option}</span>
                </button>
              ))}
            </div>
            {budget === "custom" && (
              <label className={styles.customBudget}>
                <span>Your budget</span>
                <input
                  value={customBudget}
                  onChange={(event) => setCustomBudget(event.target.value)}
                  maxLength={60}
                  placeholder="e.g. around $12,000"
                  required
                />
              </label>
            )}
          </div>

          <div className={styles.total} aria-live="polite">
            <div>
              <strong className="moving-colour-text">{budgetLabel}</strong>
              <small>starting point, not a quote</small>
            </div>
            <span>{SUMMARY[projectType]}</span>
          </div>
        </aside>

        <form className={styles.form} onSubmit={send}>
          <div className={styles.formTitle}>
            <h3>Send your enquiry.</h3>
            <span className={styles.pill}>No commitment</span>
          </div>

          {status === "success" ? (
            <div className={styles.success} role="status">
              <span aria-hidden="true">✓</span>
              <strong>Thanks — that&apos;s with us.</strong>
              <p>We&apos;ll come back with what we&apos;d suggest building for that budget, and what it would take.</p>
            </div>
          ) : (
            <>
              <label className={styles.honeypot} aria-hidden="true">
                Company website
                <input name="company_website" tabIndex={-1} autoComplete="off" />
              </label>
              <label>
                <span>Email</span>
                <input name="email" type="email" placeholder="e.g. email@example.com" autoComplete="email" required />
              </label>
              <label>
                <span>Phone</span>
                <input name="phone" type="tel" placeholder="e.g. 0400 000 000" autoComplete="tel" />
              </label>
              <label>
                <span>Website</span>
                {/* Deliberately not type="url": that rejects a scheme-less host like the
                    placeholder's own example. submitProjectEnquiry normalises it. */}
                <input
                  name="website"
                  type="text"
                  inputMode="url"
                  placeholder="e.g. www.yoursite.com"
                  autoComplete="url"
                  required
                />
              </label>
              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}
              <MovingColourButton type="submit" className={styles.submit} disabled={status === "submitting"}>
                {status === "submitting" ? "Sending…" : "Send enquiry"}
              </MovingColourButton>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

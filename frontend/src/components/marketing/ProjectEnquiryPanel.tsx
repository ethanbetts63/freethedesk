"use client";

import { useId, useState } from "react";

import { MovingColourButton } from "@/components/MovingColourButton";
import formStyles from "@/components/forms/SelectionForm.module.css";
import { normaliseWebsiteUrl, submitProjectEnquiry, type ProjectType } from "@/lib/api";
import styles from "./ProjectEnquiry.module.css";
import { useEnquiryForm } from "@/lib/useEnquiryForm";

const PROJECT_TYPES: { code: ProjectType; name: string }[] = [
  { code: "website", name: "Website" },
  { code: "automation", name: "Automation" },
  { code: "both", name: "Both" },
];

const BUDGETS = ["$3,000", "$5,000", "$10,000", "custom"] as const;
type Budget = (typeof BUDGETS)[number];

function formatCustomBudget(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Custom";
  if (trimmed.includes("$")) return trimmed;

  const numericValue = trimmed.replaceAll(",", "");
  if (/^\d+(?:\.\d{1,2})?$/.test(numericValue)) {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 2,
    }).format(Number(numericValue));
  }

  return `$${trimmed}`;
}

const SUMMARY: Record<ProjectType, string> = {
  website: "A website built around what your business actually needs to do.",
  automation: "The repetitive work behind your business, handled without you.",
  both: "A website and the automation behind it, designed as one system.",
};

/** The stateful half of the enquiry section. `heading` arrives already rendered
    from the server so its markup stays out of the client bundle. */
export function ProjectEnquiryPanel({
  heading,
  showProjectType = true,
  defaultProjectType = "both",
}: {
  heading: React.ReactNode;
  showProjectType?: boolean;
  defaultProjectType?: ProjectType;
}) {
  const groupId = useId().replaceAll(":", "");
  const [projectType, setProjectType] = useState<ProjectType>(defaultProjectType);
  const [budget, setBudget] = useState<Budget>("$5,000");
  const [customBudget, setCustomBudget] = useState("");

  const budgetLabel = budget === "custom" ? formatCustomBudget(customBudget) : budget;
  const {
    status,
    error,
    submit: send,
  } = useEnquiryForm(
    (value) =>
      submitProjectEnquiry({
        project_type: projectType,
        budget: budget === "custom" ? customBudget.trim() : budget,
        website: normaliseWebsiteUrl(value("website")),
        email: value("email"),
        phone: value("phone"),
        notes: value("notes"),
      }),
    "We could not send that. Please try again.",
    () => setCustomBudget(""),
  );

  return (
    <div className={`${formStyles.panel} ${styles.panel}`}>
      <aside className={`${formStyles.chooser} ${styles.chooser} ${!showProjectType ? styles.compactChooser : ""}`}>
        {heading}

        {showProjectType && (
          <div className={formStyles.choiceGroup}>
            <p id={`${groupId}-type`}>What do you need?</p>
            <div
              className={`${formStyles.choiceGrid} ${styles.typeGrid}`}
              role="radiogroup"
              aria-labelledby={`${groupId}-type`}
            >
              {PROJECT_TYPES.map((option) => (
                <label
                  className={`${projectType === option.code ? formStyles.choiceSelected : ""} ${
                    option.code === "both" ? formStyles.choiceRecommended : ""
                  }`}
                  key={option.code}
                >
                  <input
                    className={formStyles.choiceInput}
                    type="radio"
                    name={`${groupId}-project-type`}
                    value={option.code}
                    checked={projectType === option.code}
                    onChange={() => setProjectType(option.code)}
                  />
                  <span>{option.name}</span>
                  {option.code === "both" && <small className="moving-colour-text">recommended</small>}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className={formStyles.choiceGroup}>
          <p id={`${groupId}-budget`}>What&apos;s your budget?</p>
          <div
            className={`${formStyles.choiceGrid} ${styles.budgetGrid}`}
            role="radiogroup"
            aria-labelledby={`${groupId}-budget`}
          >
            {BUDGETS.map((option) => (
              <label className={budget === option ? formStyles.choiceSelected : ""} key={option}>
                <input
                  className={formStyles.choiceInput}
                  type="radio"
                  name={`${groupId}-budget-choice`}
                  value={option}
                  checked={budget === option}
                  onChange={() => setBudget(option)}
                />
                <span>{option === "custom" ? "Custom" : option}</span>
              </label>
            ))}
          </div>
          {budget === "custom" && (
            <label className={styles.customBudget}>
              <span>Your budget</span>
              <input
                value={customBudget}
                onChange={(event) => setCustomBudget(event.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={60}
                placeholder="e.g. 12000"
                required
              />
            </label>
          )}
        </div>

        <div className={`${formStyles.total} ${styles.total}`} aria-live="polite">
          <div>
            <strong className="moving-colour-text">{budgetLabel}</strong>
          </div>
          <span>{SUMMARY[projectType]}</span>
        </div>
      </aside>

      <form className={`${formStyles.form} ${styles.form}`} onSubmit={send}>
        <div className={`${formStyles.formTitle} ${styles.formTitle}`}>
          <h3>
            Send your <span className="moving-colour-text">free enquiry.</span>
          </h3>
        </div>

        {status === "success" ? (
          <div className={styles.success} role="status">
            <span aria-hidden="true">✓</span>
            <strong>Thanks — that&apos;s with us.</strong>
            <p>We&apos;ll come back with what we&apos;d suggest building for that budget, and what it would take.</p>
          </div>
        ) : (
          <>
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
              {/* Not type="url": it rejects a scheme-less host like the placeholder example. */}
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
              <span>Notes (optional)</span>
              <textarea
                name="notes"
                rows={3}
                maxLength={2000}
                placeholder="e.g. It takes our team a lot of manual copy and paste to write and send a quote."
              />
            </label>
            {error && (
              <p className={formStyles.error} role="alert">
                {error}
              </p>
            )}
            <MovingColourButton
              type="submit"
              className={formStyles.submit}
              direction="right"
              size="large"
              fullWidth
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Sending…" : "Show me what you’d build"}
            </MovingColourButton>
          </>
        )}
      </form>
    </div>
  );
}

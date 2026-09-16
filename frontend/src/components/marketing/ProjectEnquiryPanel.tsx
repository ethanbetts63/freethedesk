"use client";

import { FormEvent, useActionState, useId, useState } from "react";

import formStyles from "@/components/forms/SelectionForm.module.css";
import { SelectionFormPanel } from "@/components/forms/SelectionFormPanel";
import {
  choiceGroupHeadingClassName,
  fieldInputClassName,
  fieldLabelClassName,
  fieldLabelSpanClassName,
  fieldTextareaClassName,
  formErrorClassName,
  formTitleClassName,
  formTitleHeadingClassName,
  submitClassName,
  totalClassName,
  totalFigureClassName,
  totalPriceClassName,
  totalSummaryClassName,
} from "@/components/forms/selectionFormClassNames";
import { MovingColourButton } from "@/components/MovingColourButton";
import { type ProjectType } from "@/lib/api";
import { submitProjectEnquiry, type ProjectEnquiryState } from "./ProjectEnquiryPanel.actions";

const initialState: ProjectEnquiryState = { status: "idle" };

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
  // Once a submission succeeds the form fields are replaced by a thank-you
  // message (below), so there's no need to separately reset `customBudget`.
  const [state, dispatch, isPending] = useActionState(submitProjectEnquiry, initialState);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("project_type", projectType);
    formData.set("budget", budget === "custom" ? customBudget.trim() : budget);
    dispatch(formData);
  };

  return (
    <SelectionFormPanel
      onSubmit={onSubmit}
      chooserClassName={!showProjectType ? "min-[1080px]:justify-center" : undefined}
      chooser={
        <>
          {heading}

          {showProjectType && (
            <div>
              <p id={`${groupId}-type`} className={choiceGroupHeadingClassName}>
                What do you need?
              </p>
              <div
                className={`${formStyles.choiceGrid} grid-cols-1 sm:grid-cols-3`}
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

          <div className={showProjectType ? "mt-xl" : undefined}>
            <p id={`${groupId}-budget`} className={choiceGroupHeadingClassName}>
              What&apos;s your budget?
            </p>
            <div
              className={`${formStyles.choiceGrid} grid-cols-2 sm:grid-cols-4`}
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
              <label className="mt-xs block">
                <span className="mb-2xs block text-micro font-strong tracking-[0.1em] text-[var(--text-control)] uppercase">
                  Your budget
                </span>
                <input
                  className="min-h-[48px] w-full border border-border-default bg-surface-page px-s text-step-0 text-text-primary outline-none [font:inherit] placeholder:text-small placeholder:font-normal placeholder:text-[var(--text-on-dark-subtle)] focus:border-[var(--page-accent,var(--action-primary))] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--page-accent,var(--action-primary))_12%,transparent)]"
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

          <div
            className={`${totalClassName} [--selection-total-size:2.4rem] ${!showProjectType ? "min-[1080px]:mt-xl" : ""}`}
            aria-live="polite"
          >
            <div className={totalFigureClassName}>
              <strong className={`${totalPriceClassName} moving-colour-text`}>{budgetLabel}</strong>
            </div>
            <span className={totalSummaryClassName}>{SUMMARY[projectType]}</span>
          </div>
        </>
      }
    >
      <div className={formTitleClassName}>
        <h3 className={formTitleHeadingClassName}>
          Send your <span className="moving-colour-text">free enquiry.</span>
        </h3>
      </div>

      {state.status === "success" ? (
        <div role="status">
          <span
            aria-hidden="true"
            className="mb-m flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[var(--page-accent,var(--action-primary))] text-text-on-dark"
          >
            ✓
          </span>
          <strong className="block text-step-0 tracking-[-0.03em]">Thanks — that&apos;s with us.</strong>
          <p className="mt-xs text-body leading-[1.65] text-text-muted">
            We&apos;ll come back with what we&apos;d suggest building for that budget, and what it would take.
          </p>
        </div>
      ) : (
        <>
          <label className={fieldLabelClassName}>
            <span className={fieldLabelSpanClassName}>Email</span>
            <input
              className={fieldInputClassName}
              name="email"
              type="email"
              placeholder="e.g. email@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldLabelSpanClassName}>Phone</span>
            <input
              className={fieldInputClassName}
              name="phone"
              type="tel"
              placeholder="e.g. 0400 000 000"
              autoComplete="tel"
            />
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldLabelSpanClassName}>Website</span>
            <input
              className={fieldInputClassName}
              name="website"
              type="text"
              inputMode="url"
              placeholder="e.g. www.yoursite.com"
              autoComplete="url"
              required
            />
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldLabelSpanClassName}>Notes (optional)</span>
            <textarea
              className={fieldTextareaClassName}
              name="notes"
              rows={3}
              maxLength={2000}
              placeholder="e.g. It takes our team a lot of manual copy and paste to write and send a quote."
            />
          </label>
          {state.status === "error" && (
            <p className={formErrorClassName} role="alert">
              {state.error}
            </p>
          )}
          <MovingColourButton
            type="submit"
            className={submitClassName}
            direction="right"
            size="large"
            fullWidth
            disabled={isPending}
          >
            {isPending ? "Sending…" : "Show me what you’d build"}
          </MovingColourButton>
        </>
      )}
    </SelectionFormPanel>
  );
}

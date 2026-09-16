"use client";

import { FormEvent, useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PrimaryButton } from "@/components/PrimaryButton";
import formStyles from "@/components/forms/SelectionForm.module.css";
import { SESSION_FLAG, type PublicSiteSettings } from "@/lib/api";
import { planByCode } from "@/lib/plans";
import { submitSignup, type SignupState } from "@/lib/signup.actions";
import { buildSeoPlans, REPORT_TYPES, reportTypeLabel, type SeoPlanCode, type SeoReportType } from "../_lib/plans";

const initialState: SignupState = { status: "idle" };
const boundSubmitSignup = submitSignup.bind(null, { endpoint: "/api/seo/signup/", sessionFromSignup: true });

/** The stateful half of the signup section. `heading` arrives already rendered
    from the server so its markup stays out of the client bundle. */
export function SeoSignupPanel({ settings, heading }: { settings: PublicSiteSettings; heading: React.ReactNode }) {
  const router = useRouter();
  const [reportType, setReportType] = useState<SeoReportType>("both");
  const [selectedCode, setSelectedCode] = useState<SeoPlanCode>("quarterly");
  const plans = useMemo(() => buildSeoPlans(settings, reportType), [settings, reportType]);
  const selected = planByCode(plans, selectedCode) ?? plans[0];
  const [state, dispatch, isPending] = useActionState(boundSubmitSignup, initialState);

  useEffect(() => {
    if (state.status !== "success") return;
    localStorage.setItem(SESSION_FLAG, "1");
    router.push("/seo/payment");
  }, [state, router]);

  useEffect(() => {
    const selectLinkedProduct = () => {
      if (window.location.hash === "#google-business-profile-audit") {
        setReportType("gbp");
        setSelectedCode("oneoff");
      }
    };
    selectLinkedProduct();
    window.addEventListener("hashchange", selectLinkedProduct);
    return () => window.removeEventListener("hashchange", selectLinkedProduct);
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("plan", selectedCode);
    formData.set("report_type", reportType);
    dispatch(formData);
  };

  function selectReportType(nextReportType: SeoReportType) {
    setReportType(nextReportType);
    setSelectedCode(nextReportType === "gbp" ? "oneoff" : "quarterly");
  }

  const recommendedFrequency: SeoPlanCode = reportType === "gbp" ? "oneoff" : "quarterly";

  return (
    <div className={`${formStyles.panel} mt-0`}>
      <aside className={`${formStyles.chooser} [scroll-margin-top:24px]`} id="google-business-profile-audit">
        {heading}

        <div className={formStyles.choiceGroup}>
          <p>What do you want?</p>
          <div
            className={`${formStyles.choiceGrid} grid-cols-1 sm:grid-cols-3`}
            role="radiogroup"
            aria-label="Report type"
          >
            {REPORT_TYPES.map((option) => (
              <label
                className={`${reportType === option.code ? formStyles.choiceSelected : ""} ${
                  option.code === "both" ? formStyles.choiceRecommended : ""
                }`}
                key={option.code}
              >
                <input
                  className={formStyles.choiceInput}
                  type="radio"
                  name="seo-report-type"
                  value={option.code}
                  checked={reportType === option.code}
                  onChange={() => selectReportType(option.code)}
                />
                <span>{option.name}</span>
                {option.code === "both" && <small className="moving-colour-text">Recommended</small>}
              </label>
            ))}
          </div>
        </div>

        <div className={formStyles.choiceGroup}>
          <p>{reportType === "gbp" ? "Payment schedule" : "How often?"}</p>
          <div
            className={`${formStyles.choiceGrid} grid-cols-2 sm:grid-cols-4`}
            role="radiogroup"
            aria-label="Report frequency"
          >
            {plans.map((frequency) => (
              <label
                className={`${selectedCode === frequency.code ? formStyles.choiceSelected : ""} ${
                  recommendedFrequency === frequency.code
                    ? "border-[var(--page-accent)] shadow-[inset_0_-3px_0_var(--page-accent)]"
                    : ""
                }`}
                key={frequency.code}
              >
                <input
                  className={formStyles.choiceInput}
                  type="radio"
                  name="seo-report-frequency"
                  value={frequency.code}
                  checked={selectedCode === frequency.code}
                  onChange={() => setSelectedCode(frequency.code)}
                />
                <span>{frequency.name}</span>
                {recommendedFrequency === frequency.code && <small>Recommended</small>}
              </label>
            ))}
          </div>
        </div>

        <div className={formStyles.total} aria-live="polite">
          <div>
            <strong className="moving-colour-text">{selected.price}</strong>
            <small>{selected.cadence}</small>
          </div>
          <span>
            {reportTypeLabel(reportType)} · {selected.name}
          </span>
        </div>
      </aside>

      <form className={formStyles.form} onSubmit={onSubmit}>
        <div className={formStyles.formTitle}>
          <h3>Where should we send it?</h3>
        </div>
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
        {state.status === "error" && (
          <p className={formStyles.error} role="alert">
            {state.error}
          </p>
        )}
        <PrimaryButton
          type="submit"
          className={formStyles.submit}
          direction="right"
          size="large"
          fullWidth
          disabled={isPending}
        >
          {isPending ? "Creating your checkout…" : "Payment"}
        </PrimaryButton>
      </form>
    </div>
  );
}

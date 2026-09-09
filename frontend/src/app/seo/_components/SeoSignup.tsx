"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { SectionNumber } from "@/components/SectionNumber";
import { type PublicSiteSettings } from "@/lib/api";
import { planByCode } from "@/lib/plans";
import { useSignup } from "@/lib/useSignup";
import { buildSeoPlans, REPORT_TYPES, reportTypeLabel, type SeoPlanCode, type SeoReportType } from "../_lib/plans";
import styles from "../page.module.css";

const FREQUENCIES: { code: SeoPlanCode; name: string }[] = [
  { code: "monthly", name: "Monthly" },
  { code: "quarterly", name: "Quarterly" },
  { code: "biannual", name: "Bi-annual" },
  { code: "oneoff", name: "One-off" },
];

export function SeoSignup({ settings, eyebrow }: { settings: PublicSiteSettings; eyebrow: string }) {
  const [reportType, setReportType] = useState<SeoReportType>("both");
  const [selectedCode, setSelectedCode] = useState<SeoPlanCode>("quarterly");
  const plans = useMemo(() => buildSeoPlans(settings, reportType), [settings, reportType]);
  const selected = planByCode(plans, selectedCode) ?? plans[0];
  const { submit, status, error } = useSignup({
    endpoint: "/api/seo/signup/",
    nextHref: "/seo/payment",
    sessionFromSignup: true,
  });

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

  const onSubmit = (event: FormEvent<HTMLFormElement>) =>
    submit(event, { plan: selectedCode, report_type: reportType });

  function selectReportType(nextReportType: SeoReportType) {
    setReportType(nextReportType);
    setSelectedCode(nextReportType === "gbp" ? "oneoff" : "quarterly");
  }

  const recommendedFrequency: SeoPlanCode = reportType === "gbp" ? "oneoff" : "quarterly";

  return (
    <section className={`shell ${styles.plansSection}`} id="signup">
      <div className={styles.signupPanel}>
        <aside className={styles.selectionPanel} id="google-business-profile-audit">
          <SectionNumber>{eyebrow}</SectionNumber>
          <h2>Choose your report.</h2>

          <div className={styles.choiceGroup}>
            <p>What do you want?</p>
            <div className={styles.reportTypeGrid} role="radiogroup" aria-label="Report type">
              {REPORT_TYPES.map((option) => (
                <label
                  className={`${reportType === option.code ? styles.choiceSelected : ""} ${
                    option.code === "both" ? styles.choiceRecommended : ""
                  }`}
                  key={option.code}
                >
                  <input
                    className={styles.choiceInput}
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

          <div className={styles.choiceGroup}>
            <p>How often?</p>
            <div className={styles.frequencyGrid} role="radiogroup" aria-label="Report frequency">
              {FREQUENCIES.map((frequency) => (
                <label
                  className={`${selectedCode === frequency.code ? styles.choiceSelected : ""} ${
                    recommendedFrequency === frequency.code ? styles.frequencyRecommended : ""
                  }`}
                  key={frequency.code}
                >
                  <input
                    className={styles.choiceInput}
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

          <div className={styles.selectionTotal} aria-live="polite">
            <div>
              <strong className="moving-colour-text">{selected.price}</strong>
              <small>{selected.cadence}</small>
            </div>
            <span>
              {reportTypeLabel(reportType)} · {selected.name}
            </span>
          </div>
        </aside>

        <form className={styles.signupForm} onSubmit={onSubmit}>
          <div className={styles.formTitle}>
            <h3>Where should we send it?</h3>
          </div>
          <label className={styles.honeypot} aria-hidden="true">
            Website confirmation
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
                placeholder's own example. useSignup normalises it before posting. */}
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
            <p className={styles.signupError} role="alert">
              {error}
            </p>
          )}
          <button type="submit" className={styles.signupSubmit} disabled={status === "submitting"}>
            {status === "submitting" ? "Creating your checkout…" : "Continue to secure payment"}
            <span>→</span>
          </button>
        </form>
      </div>
    </section>
  );
}

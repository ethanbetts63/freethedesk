"use client";

import { FormEvent, useMemo, useState } from "react";

import { type PublicSiteSettings } from "@/lib/api";
import { planByCode } from "@/lib/plans";
import { useSignup } from "@/lib/useSignup";
import { buildSeoPlans, type SeoPlanCode } from "../_lib/plans";
import styles from "../page.module.css";

export function SeoSignup({ settings }: { settings: PublicSiteSettings }) {
  // Prices are server-rendered from `settings`; there is nothing to fetch.
  const plans = useMemo(() => buildSeoPlans(settings), [settings]);
  const [selectedCode, setSelectedCode] = useState<SeoPlanCode>("quarterly");
  const { submit, status, error } = useSignup({ endpoint: "/api/seo/signup/", nextHref: "/seo/payment" });

  // Always resolves: every code in state comes from the list itself.
  const selected = planByCode(plans, selectedCode) ?? plans[0];

  const onSubmit = (event: FormEvent<HTMLFormElement>) => submit(event, { plan: selectedCode });

  return (
    <section className={`shell ${styles.plansSection}`} id="signup">
      <p className={styles.label}>02 / Plans</p>
      <h2>Pick how often you want to hear from us.</h2>
      <p className={styles.introLead}>
        Every plan is the same report and the same attention&mdash;the cadence is the only variable. Cancel or change
        any time.
      </p>

      <div className={styles.planGrid} role="radiogroup" aria-label="SEO report plan">
        {plans.map((plan) => (
          <button
            className={`${styles.planCard} ${selectedCode === plan.code ? styles.planSelected : ""} ${plan.recommended ? styles.planRecommended : ""}`}
            key={plan.code}
            type="button"
            role="radio"
            aria-checked={selectedCode === plan.code}
            onClick={() => setSelectedCode(plan.code)}
          >
            <span className={`${styles.planTopline} ${plan.recommended ? "moving-colour-text" : ""}`}>
              {plan.recommended ? "Recommended" : "Select plan"}
            </span>
            <strong>{plan.name}</strong>
            <span className={styles.planPrice}>
              {plan.price} <small>{plan.cadence}</small>
            </span>
            <p>{plan.summary}</p>
            <i aria-hidden="true" className={styles.planTick}>
              {selectedCode === plan.code ? "✓" : ""}
            </i>
          </button>
        ))}
      </div>

      <div className={styles.signupPanel}>
        <aside className={styles.selectedSummary}>
          <span>Your selection</span>
          <h3>{selected.name}</h3>
          <p>{selected.summary}</p>
          <ul>
            {selected.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <div>
            <strong>{selected.price}</strong>
            <span>{selected.cadence}</span>
          </div>
        </aside>

        <form className={styles.signupForm} onSubmit={onSubmit}>
          <div className={styles.formTitle}>
            <span>SEO account</span>
            <h3>A few details to begin.</h3>
          </div>
          <label className={styles.honeypot} aria-hidden="true">
            Website confirmation
            <input name="company_website" tabIndex={-1} autoComplete="off" />
          </label>
          <div className={styles.fieldRow}>
            <label>
              <span>Business name</span>
              <input name="business_name" autoComplete="organization" required />
            </label>
            <label>
              <span>Your name</span>
              <input name="contact_name" autoComplete="name" required />
            </label>
          </div>
          <div className={styles.fieldRow}>
            <label>
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              <span>Phone</span>
              <input name="phone" type="tel" autoComplete="tel" />
            </label>
          </div>
          <div className={styles.fieldRow}>
            <label>
              <span>Website</span>
              <input name="website" type="url" placeholder="https://" autoComplete="url" />
            </label>
            <label>
              <span>Password</span>
              <input name="password" type="password" autoComplete="new-password" minLength={8} required />
              <small>At least 8 characters.</small>
            </label>
          </div>
          {error && (
            <p className={styles.signupError} role="alert">
              {error}
            </p>
          )}
          <button type="submit" className={styles.signupSubmit} disabled={status === "submitting"}>
            {status === "submitting" ? "Creating your account…" : "Continue to secure payment"}
            <span>→</span>
          </button>
          <p className={styles.secureNote}>Your plan summary and secure card entry are on the next page.</p>
        </form>
      </div>
    </section>
  );
}

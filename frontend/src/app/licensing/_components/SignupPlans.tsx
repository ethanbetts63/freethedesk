"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

import { PrimaryButton } from "@/components/PrimaryButton";
import { SectionNumber } from "@/components/SectionNumber";
import { DEALER_STATES } from "@/lib/dealerStates";
import { planByCode } from "@/lib/plans";
import { useSignup } from "@/lib/useSignup";
import { buildDealerPlans, type DealerPlanCode, type LicensingPrices } from "../_lib/plans";
import styles from "../page.module.css";

export function SignupPlans({
  settings,
  eyebrow,
}: {
  settings: LicensingPrices;
  eyebrow: string;
}) {
  const plans = useMemo(() => buildDealerPlans(settings), [settings]);
  const [selectedCode, setSelectedCode] = useState<DealerPlanCode>("complete");
  const { submit, status, error } = useSignup({ endpoint: "/api/dealers/signup/", nextHref: "/licensing/payment" });

  const selected = planByCode(plans, selectedCode) ?? plans[0];

  const onSubmit = (event: FormEvent<HTMLFormElement>) => submit(event, { plan: selectedCode });

  return (
    <section className={`shell ${styles.signupSection}`} id="signup">
      <div className={styles.signupPanel}>
        <aside className={styles.selectionPanel}>
          <SectionNumber>{eyebrow}</SectionNumber>
          <h2>Choose what you need.</h2>

          <div className={styles.choiceGroup}>
            <p>What do you need?</p>
            <div className={styles.planTypeGrid} role="radiogroup" aria-label="Subscription plan">
              {plans.map((plan) => (
                <label
                  className={`${selectedCode === plan.code ? styles.choiceSelected : ""} ${
                    plan.recommended ? styles.choiceRecommended : ""
                  }`}
                  key={plan.code}
                >
                  <input
                    className={styles.choiceInput}
                    type="radio"
                    name="dealer-plan"
                    value={plan.code}
                    checked={selectedCode === plan.code}
                    onChange={() => setSelectedCode(plan.code)}
                  />
                  <span>{plan.name}</span>
                  {plan.recommended && <small className="moving-colour-text">Recommended</small>}
                </label>
              ))}
            </div>
          </div>

          <ul className={styles.selectionFeatures}>
            {selected.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>

          <div className={styles.selectionTotal} aria-live="polite">
            <div>
              <strong className="moving-colour-text">{selected.price}</strong>
              <small>{selected.cadence}</small>
            </div>
            <span>{selected.summary}</span>
          </div>
        </aside>

        <form className={styles.signupForm} onSubmit={onSubmit}>
          <div className={styles.formTitle}>
            <h3>A few details to begin.</h3>
            <span className={styles.formPill}>No card required yet</span>
          </div>
          <label className={styles.honeypot} aria-hidden="true">
            Website confirmation
            <input name="company_website" tabIndex={-1} autoComplete="off" />
          </label>
          <div className={styles.fieldRow}>
            <label>
              <span>Business name</span>
              <input name="business_name" placeholder="e.g. Example Motors" autoComplete="organization" required />
            </label>
            <label>
              <span>Your name</span>
              <input name="contact_name" placeholder="e.g. Alex Smith" autoComplete="name" required />
            </label>
          </div>
          <div className={styles.fieldRow}>
            <label>
              <span>Email</span>
              <input
                name="email"
                type="email"
                placeholder="e.g. email@example.com"
                autoComplete="email"
                required
              />
            </label>
            <label>
              <span>Phone</span>
              <input name="phone" type="tel" placeholder="e.g. 0400 000 000" autoComplete="tel" />
            </label>
          </div>
          <div className={styles.fieldRow}>
            <label>
              <span>Password</span>
              <input
                name="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            <label>
              <span>State or territory</span>
              <select name="state" defaultValue="WA" required>
                {DEALER_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error && (
            <p className={styles.signupError} role="alert">
              {error}
            </p>
          )}
          <PrimaryButton
            type="submit"
            className={styles.signupSubmit}
            direction="right"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Creating your account…" : "Continue to secure payment"}
          </PrimaryButton>
        </form>
      </div>

      <p className={styles.customBuildNote}>
        Want this built into a custom dealership website instead?{" "}
        <Link href="/dealership-website-builder">See the website builder ↗</Link>
      </p>
    </section>
  );
}

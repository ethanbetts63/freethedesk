"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { getLicensingSettings } from "@/lib/api";
import { DEALER_STATES } from "@/lib/dealerStates";
import { buildDealerPlans, type DealerPlan, type DealerPlanCode } from "./plans";
import styles from "./page.module.css";

type FormStatus = "idle" | "submitting" | "error";

function firstError(data: Record<string, unknown>) {
  if (typeof data.detail === "string") return data.detail;
  const value = Object.values(data).flat()[0];
  return typeof value === "string" ? value : "Unable to create your account.";
}

export function SignupPlans() {
  const router = useRouter();
  const { login } = useAuth();
  const [plans, setPlans] = useState<DealerPlan[]>([]);
  const [selectedCode, setSelectedCode] = useState<DealerPlanCode>("complete");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    getLicensingSettings()
      .then((settings) => setPlans(buildDealerPlans(settings)))
      .catch(() => setError("Plan pricing could not be loaded."));
  }, []);

  const selected = plans.find((plan) => plan.code === selectedCode) ?? plans[3];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") ?? "");
    const password = String(values.get("password") ?? "");
    const payload = Object.fromEntries(values.entries());

    try {
      const response = await fetch("/api/dealers/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, plan: selectedCode }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(firstError(data));

      await login(email, password);
      router.push(selectedCode === "demo" ? "/portal/overview" : "/licensing/payment");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create your account.");
      setStatus("error");
    }
  }

  return (
    <section className={styles.signupSection} id="signup">
      <div className="shell">
        <div className={styles.signupHeading}>
          <div>
            <p className={styles.sectionLabel}>Start here</p>
            <h2>Choose what you need.</h2>
          </div>
          <p>Create the login now. Dealership verification and licence details happen inside your account after checkout.</p>
        </div>

        <div className={styles.planGrid} role="radiogroup" aria-label="Subscription plan">
          {plans.map((plan) => (
            <button
              className={`${styles.planCard} ${selectedCode === plan.code ? styles.planSelected : ""}`}
              key={plan.code}
              type="button"
              role="radio"
              aria-checked={selectedCode === plan.code}
              onClick={() => setSelectedCode(plan.code)}
            >
              <span className={styles.planTopline}>{plan.recommended ? "Recommended" : "Select plan"}</span>
              <strong>{plan.name}</strong>
              <span className={styles.planPrice}>{plan.price} <small>{plan.cadence}</small></span>
              <p>{plan.summary}</p>
              <i aria-hidden="true">{selectedCode === plan.code ? "✓" : ""}</i>
            </button>
          ))}
        </div>

        <div className={styles.signupPanel}>
          <aside className={styles.selectedSummary}>
            {selected ? (
              <>
                <span>Your selection</span>
                <h3>{selected.name}</h3>
                <p>{selected.summary}</p>
                <ul>{selected.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
                <div><strong>{selected.price}</strong><span>{selected.cadence}</span></div>
              </>
            ) : (
              <span>Loading plans…</span>
            )}
          </aside>

          <form className={styles.signupForm} onSubmit={submit}>
            <div className={styles.formTitle}><span>Dealer account</span><h3>A few details to begin.</h3></div>
            <label className={styles.honeypot} aria-hidden="true">
              Website confirmation<input name="company_website" tabIndex={-1} autoComplete="off" />
            </label>
            <div className={styles.fieldRow}>
              <label><span>Business name</span><input name="business_name" autoComplete="organization" required /></label>
              <label><span>Your name</span><input name="contact_name" autoComplete="name" required /></label>
            </div>
            <div className={styles.fieldRow}>
              <label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
              <label><span>Phone</span><input name="phone" type="tel" autoComplete="tel" /></label>
            </div>
            <div className={styles.fieldRow}>
              <label><span>Password</span><input name="password" type="password" autoComplete="new-password" minLength={8} required /><small>At least 8 characters.</small></label>
              <label><span>State or territory</span><select name="state" defaultValue="WA" required>{DEALER_STATES.map((state) => <option key={state.value} value={state.value}>{state.label}</option>)}</select><small>No street address needed yet.</small></label>
            </div>
            {error && <p className={styles.signupError} role="alert">{error}</p>}
            <button className={styles.signupSubmit} disabled={status === "submitting"}>
              {status === "submitting" ? "Creating your account…" : selectedCode === "demo" ? "Start the demo" : "Continue to secure payment"}
              <span>→</span>
            </button>
            <p className={styles.secureNote}>{selectedCode === "demo" ? "No payment details required." : "Your plan summary and secure card entry are on the next page."}</p>
          </form>
        </div>
      </div>
    </section>
  );
}

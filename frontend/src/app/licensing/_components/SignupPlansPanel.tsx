"use client";

import { FormEvent, useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import formStyles from "@/components/forms/SelectionForm.module.css";
import { SelectionFormPanel } from "@/components/forms/SelectionFormPanel";
import { MovingColourButton } from "@/components/MovingColourButton";
import { DEALER_STATES } from "@/lib/dealerStates";
import { planByCode } from "@/lib/plans";
import { SESSION_FLAG } from "@/lib/api";
import { submitSignup, type SignupState } from "@/lib/signup.actions";

import { buildDealerPlans, type DealerPlanCode, type LicensingPrices } from "../_lib/plans";

const initialState: SignupState = { status: "idle" };
const boundSubmitSignup = submitSignup.bind(null, { endpoint: "/api/dealers/signup/" });

/** The stateful half of the signup section. `heading` arrives already rendered
    from the server so its markup stays out of the client bundle. */
export function SignupPlansPanel({ settings, heading }: { settings: LicensingPrices; heading: React.ReactNode }) {
  const router = useRouter();
  const plans = useMemo(() => buildDealerPlans(settings), [settings]);
  const [selectedCode, setSelectedCode] = useState<DealerPlanCode>("complete");
  const [state, dispatch, isPending] = useActionState(boundSubmitSignup, initialState);

  useEffect(() => {
    if (state.status !== "success") return;
    localStorage.setItem(SESSION_FLAG, "1");
    router.push("/licensing/payment");
  }, [state, router]);

  const selected = planByCode(plans, selectedCode) ?? plans[0];
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("plan", selectedCode);
    dispatch(formData);
  };

  return (
    <SelectionFormPanel
      onSubmit={onSubmit}
      chooser={
        <>
          {heading}

          <div className={formStyles.choiceGroup}>
            <p>What do you need?</p>
            <div
              className={`${formStyles.choiceGrid} grid-cols-1 sm:grid-cols-3`}
              role="radiogroup"
              aria-label="Subscription plan"
            >
              {plans.map((plan) => (
                <label
                  className={`${selectedCode === plan.code ? formStyles.choiceSelected : ""} ${
                    plan.recommended ? formStyles.choiceRecommended : ""
                  }`}
                  key={plan.code}
                >
                  <input
                    className={formStyles.choiceInput}
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

          <ul className="m-0 mt-l list-none p-0">
            {selected.features.map((feature) => (
              <li
                key={feature}
                className="relative mx-0 my-xs pl-ml text-small font-strong text-[var(--slate-800)] before:absolute before:left-0 before:font-black before:text-[var(--page-accent)] before:content-['↳']"
              >
                {feature}
              </li>
            ))}
          </ul>

          <div className={formStyles.total} aria-live="polite">
            <div>
              <strong className="moving-colour-text">{selected.price}</strong>
              <small>{selected.cadence}</small>
            </div>
            <span>{selected.summary}</span>
          </div>
        </>
      }
    >
      <div className={formStyles.formTitle}>
        <h3>Create your account.</h3>
        <span className={formStyles.pill}>No card required yet</span>
      </div>
      <div className={formStyles.fieldRow}>
        <label>
          <span>Email</span>
          <input name="email" type="email" placeholder="e.g. email@example.com" autoComplete="email" required />
        </label>
        <label>
          <span>Phone</span>
          <input name="phone" type="tel" placeholder="e.g. 0400 000 000" autoComplete="tel" />
        </label>
      </div>
      <div className={formStyles.fieldRow}>
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
      {state.status === "error" && (
        <p className={formStyles.error} role="alert">
          {state.error}
        </p>
      )}
      <MovingColourButton
        type="submit"
        className={formStyles.submit}
        direction="right"
        size="large"
        fullWidth
        disabled={isPending}
      >
        {isPending ? "Creating your account…" : "Continue"}
      </MovingColourButton>
    </SelectionFormPanel>
  );
}

'use client';

import { FormEvent, useActionState, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { SelectionFormPanel } from '@/components/forms/SelectionFormPanel';
import {
  choiceGroupHeadingClassName,
  fieldInputClassName,
  fieldLabelClassName,
  fieldLabelSpanClassName,
  fieldRowClassName,
  formErrorClassName,
  formTitleClassName,
  formTitleHeadingClassName,
  pillClassName,
  submitClassName,
  totalCadenceClassName,
  totalClassName,
  totalFigureClassName,
  totalPriceClassName,
  totalSummaryClassName,
} from '@/components/forms/selectionFormClassNames';
import { MovingColourButton } from '@/components/MovingColourButton';
import { DEALER_STATES } from '@/lib/dealerStates';
import { planByCode } from '@/lib/plans';
import { SESSION_FLAG } from '@/lib/api';
import { submitSignup, type SignupState } from '@/lib/signup.actions';

import { buildDealerPlans, type DealerPlanCode, type LicensingPrices } from '../_lib/plans';
import {
  choiceCardVariants,
  choiceGridClassName,
  choiceInputClassName,
} from '@/components/forms/selectionFormClassNames';
import { cn } from '@/lib/utils';

const initialState: SignupState = { status: 'idle' };
const boundSubmitSignup = submitSignup.bind(null, { endpoint: '/api/dealers/signup/' });

/** The stateful half of the signup section. `heading` arrives already rendered
    from the server so its markup stays out of the client bundle. */
export function SignupPlansPanel({
  settings,
  heading,
}: {
  settings: LicensingPrices;
  heading: React.ReactNode;
}) {
  const router = useRouter();
  const plans = useMemo(() => buildDealerPlans(settings), [settings]);
  const [selectedCode, setSelectedCode] = useState<DealerPlanCode>('complete');
  const [state, dispatch, isPending] = useActionState(boundSubmitSignup, initialState);

  useEffect(() => {
    if (state.status !== 'success') return;
    localStorage.setItem(SESSION_FLAG, '1');
    router.push('/licensing/payment');
  }, [state, router]);

  const selected = planByCode(plans, selectedCode) ?? plans[0];
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('plan', selectedCode);
    dispatch(formData);
  };

  return (
    <SelectionFormPanel
      onSubmit={onSubmit}
      chooser={
        <>
          {heading}

          <div>
            <p className={choiceGroupHeadingClassName}>What do you need?</p>
            <div
              className={cn(choiceGridClassName, 'grid-cols-1 sm:grid-cols-3')}
              role="radiogroup"
              aria-label="Subscription plan"
            >
              {plans.map((plan) => (
                <label
                  className={choiceCardVariants({
                    selected: selectedCode === plan.code,
                    recommended: plan.recommended,
                  })}
                  key={plan.code}
                >
                  <input
                    className={choiceInputClassName}
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

          <div className={totalClassName} aria-live="polite">
            <div className={totalFigureClassName}>
              <strong className={`${totalPriceClassName} moving-colour-text`}>
                {selected.price}
              </strong>
              <small className={totalCadenceClassName}>{selected.cadence}</small>
            </div>
            <span className={totalSummaryClassName}>{selected.summary}</span>
          </div>
        </>
      }
    >
      <div className={formTitleClassName}>
        <h3 className={formTitleHeadingClassName}>Create your account.</h3>
        <span className={pillClassName}>No card required yet</span>
      </div>
      <div className={fieldRowClassName}>
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
      </div>
      <div className={fieldRowClassName}>
        <label className={fieldLabelClassName}>
          <span className={fieldLabelSpanClassName}>Password</span>
          <input
            className={fieldInputClassName}
            name="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <label className={fieldLabelClassName}>
          <span className={fieldLabelSpanClassName}>State or territory</span>
          <select className={fieldInputClassName} name="state" defaultValue="WA" required>
            {DEALER_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
      </div>
      {state.status === 'error' && (
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
        {isPending ? 'Creating your account…' : 'Continue'}
      </MovingColourButton>
    </SelectionFormPanel>
  );
}

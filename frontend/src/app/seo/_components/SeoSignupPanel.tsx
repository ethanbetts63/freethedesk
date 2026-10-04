'use client';

import { type FormEvent, useActionState, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CtaButton } from '@/components/CtaButton';
import { SelectionFormPanel } from '@/components/forms/SelectionFormPanel';
import {
  choiceGroupHeadingClassName,
  fieldInputClassName,
  fieldLabelClassName,
  fieldLabelSpanClassName,
  formErrorClassName,
  formTitleClassName,
  formTitleHeadingClassName,
  submitClassName,
  totalCadenceClassName,
  totalClassName,
  totalFigureClassName,
  totalPriceClassName,
  totalSummaryClassName,
} from '@/components/forms/selectionFormClassNames';
import { type PublicSiteSettings } from '@/lib/api';
import { planByCode } from '@/lib/plans';
import { submitSeoSignup, type SeoSignupState } from './SeoSignupPanel.actions';
import {
  choiceCardVariants,
  choiceGridClassName,
  choiceInputClassName,
} from '@/components/forms/selectionFormClassNames';
import { cn } from '@/lib/utils';
import { buildSeoPlans, type SeoPlanCode } from '../_lib/plans';

const initialState: SeoSignupState = { status: 'idle' };

/** The stateful half of the signup section. `heading` arrives already rendered
    from the server so its markup stays out of the client bundle. */
export function SeoSignupPanel({
  settings,
  heading,
}: {
  settings: PublicSiteSettings;
  heading: React.ReactNode;
}) {
  const router = useRouter();
  const [selectedCode, setSelectedCode] = useState<SeoPlanCode>('monthly');
  const plans = useMemo(() => buildSeoPlans(settings), [settings]);
  const selected = planByCode(plans, selectedCode) ?? plans[0];
  const [state, dispatch, isPending] = useActionState(submitSeoSignup, initialState);

  useEffect(() => {
    if (state.status !== 'success' || !state.reference) return;
    router.push(`/seo/payment?ref=${encodeURIComponent(state.reference)}`);
  }, [state, router]);

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
            <p className={choiceGroupHeadingClassName}>How often can you act on a report?</p>
            <div
              className={cn(choiceGridClassName, 'grid-cols-1 sm:grid-cols-2')}
              role="radiogroup"
              aria-label="Plan"
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
                    name="seo-plan"
                    value={plan.code}
                    checked={selectedCode === plan.code}
                    onChange={() => setSelectedCode(plan.code)}
                  />
                  <span>{plan.name}</span>
                  {plan.recommended && <small className="moving-colour-text">Recommended</small>}
                </label>
              ))}
            </div>
            <p className="mt-l mb-0 max-w-[46ch] text-body-sm leading-relaxed text-text-muted">
              Cancel any time.
            </p>
          </div>

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
        <h3 className={formTitleHeadingClassName}>Your details.</h3>
      </div>
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
        {/* Not type="url": it rejects a scheme-less host like the placeholder example. */}
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
      {state.status === 'error' && (
        <p className={formErrorClassName} role="alert">
          {state.error}
          {state.accountExists && (
            <>
              {' '}
              <Link className="font-heavy underline" href="/login">
                Sign in instead.
              </Link>
            </>
          )}
        </p>
      )}
      <CtaButton
        type="submit"
        className={submitClassName}
        direction="right"
        size="large"
        fullWidth
        disabled={isPending}
      >
        {isPending ? 'Saving…' : 'Continue to payment'}
      </CtaButton>
    </SelectionFormPanel>
  );
}

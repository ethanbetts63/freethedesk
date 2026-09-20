'use client';

import { type FormEvent, useActionState, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { CtaButton } from '@/components/CtaButton';
import {
  choiceGroupHeadingClassName,
  chooserClassName,
  fieldInputClassName,
  fieldLabelClassName,
  fieldLabelSpanClassName,
  formClassName,
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
import { submitSignup, type SignupState } from '@/lib/signup.actions';
import {
  choiceCardVariants,
  choiceGridClassName,
  choiceInputClassName,
  selectionPanelClassName,
} from '@/components/forms/selectionFormClassNames';
import { cn } from '@/lib/utils';
import {
  buildSeoPlans,
  REPORT_TYPES,
  reportTypeLabel,
  type SeoPlanCode,
  type SeoReportType,
} from '../_lib/plans';

const initialState: SignupState = { status: 'idle' };
const boundSubmitSignup = submitSignup.bind(null, {
  endpoint: '/api/seo/signup/',
  sessionFromSignup: true,
});

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
  const [reportType, setReportType] = useState<SeoReportType>('both');
  const [selectedCode, setSelectedCode] = useState<SeoPlanCode>('quarterly');
  const plans = useMemo(() => buildSeoPlans(settings, reportType), [settings, reportType]);
  const selected = planByCode(plans, selectedCode) ?? plans[0];
  const [state, dispatch, isPending] = useActionState(boundSubmitSignup, initialState);

  useEffect(() => {
    if (state.status !== 'success') return;
    router.push('/seo/payment');
  }, [state, router]);

  useEffect(() => {
    const selectLinkedProduct = () => {
      if (window.location.hash === '#google-business-profile-audit') {
        setReportType('gbp');
        setSelectedCode('oneoff');
      }
    };
    selectLinkedProduct();
    window.addEventListener('hashchange', selectLinkedProduct);
    return () => window.removeEventListener('hashchange', selectLinkedProduct);
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('plan', selectedCode);
    formData.set('report_type', reportType);
    dispatch(formData);
  };

  function selectReportType(nextReportType: SeoReportType) {
    setReportType(nextReportType);
    setSelectedCode(nextReportType === 'gbp' ? 'oneoff' : 'quarterly');
  }

  const recommendedFrequency: SeoPlanCode = reportType === 'gbp' ? 'oneoff' : 'quarterly';

  return (
    <div className={cn(selectionPanelClassName, 'mt-0')}>
      <aside
        className={`${chooserClassName} [scroll-margin-top:24px]`}
        id="google-business-profile-audit"
      >
        {heading}

        <div>
          <p className={choiceGroupHeadingClassName}>What do you want?</p>
          <div
            className={cn(choiceGridClassName, 'grid-cols-1 sm:grid-cols-3')}
            role="radiogroup"
            aria-label="Report type"
          >
            {REPORT_TYPES.map((option) => (
              <label
                className={choiceCardVariants({
                  selected: reportType === option.code,
                  recommended: option.code === 'both',
                })}
                key={option.code}
              >
                <input
                  className={choiceInputClassName}
                  type="radio"
                  name="seo-report-type"
                  value={option.code}
                  checked={reportType === option.code}
                  onChange={() => selectReportType(option.code)}
                />
                <span>{option.name}</span>
                {option.code === 'both' && (
                  <small className="moving-colour-text">Recommended</small>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-xl">
          <p className={choiceGroupHeadingClassName}>
            {reportType === 'gbp' ? 'Payment schedule' : 'How often?'}
          </p>
          <div
            className={cn(choiceGridClassName, 'grid-cols-2 sm:grid-cols-4')}
            role="radiogroup"
            aria-label="Report frequency"
          >
            {plans.map((frequency) => (
              <label
                className={cn(
                  choiceCardVariants({ selected: selectedCode === frequency.code }),
                  // Not the moving-colour treatment the report-type cards use:
                  // the recommended frequency is marked with an accent rule
                  // under the card instead, so two recommendations on one panel
                  // do not compete for attention.
                  recommendedFrequency === frequency.code &&
                    // Not elevation: an inset rule drawn as a shadow, so the selected
                    // card gains an underline without a border box that would shift the
                    // two unselected ones beside it.
                    // eslint-disable-next-line no-restricted-syntax
                    'border-action-primary shadow-[inset_0_-3px_0_var(--action-primary)]',
                )}
                key={frequency.code}
              >
                <input
                  className={choiceInputClassName}
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

        <div className={totalClassName} aria-live="polite">
          <div className={totalFigureClassName}>
            <strong className={`${totalPriceClassName} moving-colour-text`}>
              {selected.price}
            </strong>
            <small className={totalCadenceClassName}>{selected.cadence}</small>
          </div>
          <span className={totalSummaryClassName}>
            {reportTypeLabel(reportType)} · {selected.name}
          </span>
        </div>
      </aside>

      <form className={formClassName} onSubmit={onSubmit}>
        <div className={formTitleClassName}>
          <h3 className={formTitleHeadingClassName}>Where should we send it?</h3>
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
          {isPending ? 'Creating your checkout…' : 'Payment'}
        </CtaButton>
      </form>
    </div>
  );
}

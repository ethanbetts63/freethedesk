'use client';

import { type FormEvent, startTransition, useActionState, useEffect, useState } from 'react';

import { CtaButton } from '@/components/CtaButton';
import { SelectionFormPanel } from '@/components/forms/SelectionFormPanel';
import {
  choiceCardVariants,
  choiceGridClassName,
  choiceInputClassName,
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
} from '@/components/forms/selectionFormClassNames';
import { MovingColourButton } from '@/components/MovingColourButton';
import { CURRENCY, trackEvent } from '@/lib/analytics';
import { money, type PackageCode, type PurchasePackage } from '@/lib/servicePricing';
import { cn } from '@/lib/utils';

import { submitPackageOrder, type PackageOrderState } from './PackageOrderPanel.actions';

const initialState: PackageOrderState = { status: 'idle' };

const ORDER_ID = 'package-order';

/**
 * The three packages, then the order form. A card's "Buy now" picks that
 * package and brings the form into view; the form asks exactly what the free
 * enquiry asks. Packages arrive priced from the server, so nothing here
 * computes money.
 */
export function PackageOrderPanel({ packages }: { packages: readonly PurchasePackage[] }) {
  const [selectedCode, setSelectedCode] = useState<PackageCode>('website_large');
  const selected = packages.find((item) => item.code === selectedCode) ?? packages[0];
  const [state, dispatch, isPending] = useActionState(submitPackageOrder, initialState);

  // A new state object per submission, so one event per order sent.
  useEffect(() => {
    if (state.status !== 'success') return;
    trackEvent('generate_lead', {
      lead_source: 'package_order',
      package: selected.code,
      value: selected.price,
      currency: CURRENCY,
    });
    // Only the submission should fire this, not a later change of package.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const choose = (code: PackageCode) => {
    setSelectedCode(code);
    trackEvent('select_plan', { item_category: 'website', plan: code });
  };

  const buy = (code: PackageCode) => {
    choose(code);
    document.getElementById(ORDER_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('package', selected.code);
    startTransition(() => dispatch(formData));
  };

  return (
    <>
      <ol className="m-0 mt-2xl grid list-none grid-cols-1 gap-m p-0 lg:grid-cols-3">
        {packages.map((item) => (
          <li
            key={item.code}
            className={cn(
              'flex flex-col p-ml sm:p-xl',
              item.recommended
                ? 'moving-colour-border shadow-l'
                : 'border border-border-default bg-surface-tint',
            )}
          >
            <div className="flex items-center justify-between gap-s text-label font-heavy tracking-label text-text-subtle uppercase">
              <span>{item.label}</span>
              {item.recommended && <span className="moving-colour-text">Recommended</span>}
            </div>
            <h3 className="mt-s mb-0 text-title-sm tracking-[-0.035em] text-text-secondary">
              {item.name}
            </h3>

            <p className="mt-l mb-0 text-display leading-none font-heavy tracking-[-0.06em] text-text-primary">
              {money(item.price)}
            </p>
            <p className="mt-xs mb-0 text-body-sm text-text-muted">{item.priceNote}</p>
            <p className="mt-l mb-0 text-body leading-relaxed text-text-secondary">
              {item.summary}
            </p>

            <p className="mt-l mb-s text-label font-heavy tracking-label text-text-subtle uppercase">
              {item.includesHeading}
            </p>
            <ul className="m-0 mb-xl grid list-none gap-s p-0">
              {item.includes.map((line) => (
                <li
                  key={line}
                  className="grid grid-cols-[auto_minmax(0,1fr)] gap-s text-body leading-relaxed text-text-muted"
                >
                  <span aria-hidden="true" className="font-heavy text-action-primary">
                    ✓
                  </span>
                  {line}
                </li>
              ))}
            </ul>

            <CtaButton
              className="mt-auto"
              onClick={() => buy(item.code)}
              direction="down"
              size="compact"
              appearance={item.recommended ? 'brand' : 'dark'}
              fullWidth
            >
              Buy now
            </CtaButton>
          </li>
        ))}
      </ol>

      <div className="mt-2xl [scroll-margin-top:96px]" id={ORDER_ID}>
        <SelectionFormPanel
          onSubmit={onSubmit}
          chooser={
            <>
              <h3 className="m-0 text-display leading-[1.02] tracking-[-0.058em] text-text-secondary">
                Your <span className="moving-colour-text">order.</span>
              </h3>
              <div
                className={cn(choiceGridClassName, 'mt-xl grid-cols-1 sm:grid-cols-3')}
                role="radiogroup"
                aria-label="Package"
              >
                {packages.map((item) => (
                  <label
                    className={choiceCardVariants({
                      selected: selected.code === item.code,
                      recommended: Boolean(item.recommended),
                    })}
                    key={item.code}
                  >
                    <input
                      className={choiceInputClassName}
                      type="radio"
                      name="package-choice"
                      value={item.code}
                      checked={selected.code === item.code}
                      onChange={() => choose(item.code)}
                    />
                    <span>{item.name}</span>
                    <small>{money(item.price)}</small>
                  </label>
                ))}
              </div>

              <div className="mt-xl" aria-live="polite">
                <p className="m-0 mb-s text-label font-heavy tracking-label text-text-subtle uppercase">
                  {selected.includesHeading}
                </p>
                <ul className="m-0 grid list-none gap-xs p-0">
                  {selected.includes.map((line) => (
                    <li
                      key={line}
                      className="grid grid-cols-[auto_minmax(0,1fr)] gap-s text-body leading-relaxed text-text-muted"
                    >
                      <span aria-hidden="true" className="font-heavy text-action-primary">
                        ✓
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={totalClassName} aria-live="polite">
                <div className={totalFigureClassName}>
                  <strong className={`${totalPriceClassName} moving-colour-text`}>
                    {money(selected.price)}
                  </strong>
                </div>
                <span className={totalSummaryClassName}>
                  {selected.name}: {selected.priceNote}.
                </span>
              </div>
            </>
          }
        >
          <div className={formTitleClassName}>
            <h3 className={formTitleHeadingClassName}>
              Your <span className="moving-colour-text">details.</span>
            </h3>
          </div>

          {state.status === 'success' ? (
            <div role="status">
              <span
                aria-hidden="true"
                className="mb-m flex h-[34px] w-[34px] items-center justify-center rounded-full bg-action-primary text-text-on-dark"
              >
                ✓
              </span>
              <strong className="block text-lead tracking-[-0.03em]">
                Thanks, your order is in.
              </strong>
              <p className="mt-xs text-body leading-relaxed text-text-muted">
                We&apos;ll email you the invoice for the {selected.name} package and the next steps.
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
                <span className={fieldLabelSpanClassName}>Website (optional)</span>
                <input
                  className={fieldInputClassName}
                  name="website"
                  type="text"
                  inputMode="url"
                  placeholder="Leave blank if you don't have one yet"
                  autoComplete="url"
                />
              </label>
              <label className={fieldLabelClassName}>
                <span className={fieldLabelSpanClassName}>Notes (optional)</span>
                <textarea
                  className={fieldTextareaClassName}
                  name="notes"
                  rows={3}
                  maxLength={2000}
                  placeholder="e.g. We sell outdoor furniture and want our range online."
                />
              </label>
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
                {isPending ? 'Sending…' : `Buy now · ${money(selected.price)}`}
              </MovingColourButton>
            </>
          )}
        </SelectionFormPanel>
      </div>
    </>
  );
}

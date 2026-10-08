'use client';

import { type FormEvent, startTransition, useActionState, useEffect, useState } from 'react';

import { SelectionFormPanel } from '@/components/forms/SelectionFormPanel';
import {
  fieldInputClassName,
  fieldLabelClassName,
  fieldLabelSpanClassName,
  fieldTextareaClassName,
  formErrorClassName,
  formTitleClassName,
  formTitleHeadingClassName,
  submitClassName,
} from '@/components/forms/selectionFormClassNames';
import { MovingColourButton } from '@/components/MovingColourButton';
import { CURRENCY, trackEvent } from '@/lib/analytics';
import { money, type PackageCode, type PurchasePackage } from '@/lib/servicePricing';

import { PackageChooser, type PackageCard } from './PackageChooser';
import { submitPackageOrder, type PackageOrderState } from './PackageOrderPanel.actions';

const initialState: PackageOrderState = { status: 'idle' };

/**
 * The order form. Left, the packages (see PackageChooser); right, exactly what the free enquiry
 * asks and the button, which carries the chosen package's price and reads Book discovery when
 * discovery is all the price buys. Packages arrive priced from the server, so nothing here
 * computes money.
 */
export function PackageOrderPanel({ packages }: { packages: readonly PurchasePackage[] }) {
  const [selectedCode, setSelectedCode] = useState<PackageCode>(
    (packages.find((item) => item.recommended) ?? packages[0]).code,
  );
  const selected = packages.find((item) => item.code === selectedCode) ?? packages[0];
  const [state, dispatch, isPending] = useActionState(submitPackageOrder, initialState);
  const cards: PackageCard<PackageCode>[] = packages.map((item) => ({
    code: item.code,
    label: item.label,
    name: item.name,
    priceLabel: item.discovery ? 'Discovery, paid upfront' : 'Fixed price',
    price: money(item.price),
    priceNote: item.priceNote,
    includes: item.includes,
    recommended: item.recommended,
  }));

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
    trackEvent('select_plan', {
      item_category: code === 'automation_discovery' ? 'automation' : 'website',
      plan: code,
    });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('package', selected.code);
    startTransition(() => dispatch(formData));
  };

  return (
    <SelectionFormPanel
      onSubmit={onSubmit}
      chooser={
        <PackageChooser
          noun="package"
          cards={cards}
          selectedCode={selected.code}
          onChoose={choose}
        />
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
          <strong className="block text-lead tracking-[-0.03em]">Thanks, your order is in.</strong>
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
            {isPending
              ? 'Sending…'
              : `${selected.discovery ? 'Book discovery' : 'Buy now'} · ${money(selected.price)}`}
          </MovingColourButton>
        </>
      )}
    </SelectionFormPanel>
  );
}

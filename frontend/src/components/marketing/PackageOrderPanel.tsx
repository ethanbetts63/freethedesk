'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, startTransition, useActionState, useEffect, useState } from 'react';

import { TermsAgreement } from '@/components/checkout/TermsAgreement';

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
import { CURRENCY, trackBeginCheckout, trackEvent } from '@/lib/analytics';
import { money, type PackageCode, type PurchasePackage } from '@/lib/servicePricing';

import { PackageChooser, type PackageCard } from './PackageChooser';
import { submitPackageOrder, type PackageOrderState } from './PackageOrderPanel.actions';

const initialState: PackageOrderState = { status: 'idle' };

/**
 * The order form. Left, the packages (see PackageChooser); right, exactly what the free enquiry
 * asks, the Web Development Terms, and the button, which carries what is due today and reads Book
 * discovery when discovery is all the price buys. Sending it records the order and the terms, then
 * goes to payment. Packages arrive priced from the server, so nothing here computes money.
 */
export function PackageOrderPanel({ packages }: { packages: readonly PurchasePackage[] }) {
  const [selectedCode, setSelectedCode] = useState<PackageCode>(
    (packages.find((item) => item.recommended) ?? packages[0]).code,
  );
  const router = useRouter();
  const selected = packages.find((item) => item.code === selectedCode) ?? packages[0];
  const [state, dispatch, isPending] = useActionState(submitPackageOrder, initialState);
  const cards: PackageCard<PackageCode>[] = packages.map((item) => ({
    code: item.code,
    label: item.label,
    name: item.name,
    priceLabel: item.discovery ? 'Discovery, paid upfront' : 'Fixed price',
    price: money(item.price),
    priceNote: item.priceNote,
    dueNote:
      item.dueNow < item.price ? `${money(item.dueNow)} today, the rest before launch` : undefined,
    includes: item.includes,
    recommended: item.recommended,
  }));

  // A new state object per submission, so one event and one redirect per order sent.
  useEffect(() => {
    if (state.status !== 'success' || !state.reference) return;
    trackEvent('generate_lead', {
      lead_source: 'package_order',
      package: selected.code,
      value: selected.price,
      currency: CURRENCY,
    });
    trackBeginCheckout(state.reference, {
      value: selected.dueNow,
      items: [
        {
          item_id: selected.code,
          item_name: selected.name,
          item_category: selected.code === 'automation_discovery' ? 'automation' : 'website',
          price: selected.dueNow,
        },
      ],
    });
    router.push(`/order/payment?ref=${encodeURIComponent(state.reference)}`);
    // Only the submission should fire this, not a later change of package.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, router]);

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
        <TermsAgreement
          className="mb-l"
          name="accepted_terms"
          required
          termsHref="/legal/web-development-terms"
          termsLabel="Web Development Terms"
          authorisation="authorise this payment."
        />
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
          disabled={isPending || state.status === 'success'}
        >
          {isPending || state.status === 'success'
            ? 'Saving…'
            : selected.discovery
              ? `Book discovery · ${money(selected.price)}`
              : `Buy now · ${money(selected.dueNow)} today`}
        </MovingColourButton>
      </>
    </SelectionFormPanel>
  );
}

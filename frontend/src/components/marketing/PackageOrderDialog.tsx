'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, type RefObject, startTransition, useActionState, useEffect } from 'react';

import { TermsAgreement } from '@/components/checkout/TermsAgreement';
import { OrderContactFields, OrderDialog, OrderSubmit } from '@/components/forms/OrderDialog';
import {
  fieldInputClassName,
  fieldLabelClassName,
  fieldLabelSpanClassName,
  fieldTextareaClassName,
} from '@/components/forms/selectionFormClassNames';
import { CURRENCY, trackBeginCheckout, trackEvent } from '@/lib/analytics';
import { money, type PackageCode, type PurchasePackage } from '@/lib/servicePricing';

import { submitPackageOrder, type PackageOrderState } from './PackageOrderDialog.actions';

const initialState: PackageOrderState = { status: 'idle' };

/**
 * The package order form, in the dialog the package cards open (OrderDialog): what the free
 * enquiry asks, the Web Development Terms, and the button, which carries what is due today and
 * reads Book discovery when discovery is all the price buys. Sending it records the order and the
 * terms, then goes to payment. Packages arrive priced from the server, so nothing here computes
 * money.
 *
 * Track B under the forms standard (schema beside this file). Dispatched from `onSubmit` rather
 * than `action` so a failed submit keeps what was typed.
 */
export function PackageOrderDialog({
  dialogRef,
  packages,
  selectedCode,
  onChoose,
  redesign,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  packages: readonly PurchasePackage[];
  selectedCode: PackageCode;
  onChoose: (code: PackageCode) => void;
  /** A redesign: the current website is the job, so it is asked for rather than optional. */
  redesign: boolean;
}) {
  const router = useRouter();
  const selected = packages.find((item) => item.code === selectedCode) ?? packages[0];
  const [state, dispatch, isPending] = useActionState(submitPackageOrder, initialState);

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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('package', selected.code);
    startTransition(() => dispatch(formData));
  };

  const saving = isPending || state.status === 'success';

  return (
    <OrderDialog
      dialogRef={dialogRef}
      heading={
        <>
          {selected.name}, {money(selected.price)}
          <span className="font-normal text-text-muted">, {packageCadence(selected)}.</span>
        </>
      }
      choices={
        packages.length > 1
          ? {
              legend: 'Package',
              name: 'package-choice',
              options: packages.map((item) => ({
                code: item.code,
                label: item.name,
                detail: money(item.price),
              })),
              selectedCode: selected.code,
              onChoose,
            }
          : undefined
      }
      onSubmit={onSubmit}
    >
      <OrderContactFields />
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>
          {redesign ? 'Your current website' : 'Website (optional)'}
        </span>
        {/* Not type="url": it rejects a scheme-less host like the placeholder example. */}
        <input
          className={fieldInputClassName}
          name="website"
          type="text"
          inputMode="url"
          placeholder={
            redesign ? 'e.g. www.yourbusiness.com.au' : "Leave blank if you don't have one yet"
          }
          autoComplete="url"
          required={redesign}
        />
      </label>
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>Notes (optional)</span>
        <textarea
          className={fieldTextareaClassName}
          name="notes"
          rows={3}
          maxLength={2000}
          placeholder={
            redesign
              ? 'e.g. Our WordPress site is slow and the plugins keep breaking.'
              : 'e.g. We sell outdoor furniture and want our range online.'
          }
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
      <OrderSubmit disabled={saving} error={state.status === 'error' && state.error}>
        {saving
          ? 'Saving…'
          : selected.discovery
            ? `Book discovery · ${money(selected.price)}`
            : `Buy now · ${money(selected.dueNow)} today`}
      </OrderSubmit>
    </OrderDialog>
  );
}

/** How a package is paid, beside its price: a website half up front, discovery all of it. */
export function packageCadence(item: PurchasePackage): string {
  return item.discovery ? 'paid upfront' : 'half upfront';
}

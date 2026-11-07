'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  type FormEvent,
  type RefObject,
  startTransition,
  useActionState,
  useEffect,
  useId,
  useState,
} from 'react';

import { TermsAgreement } from '@/components/checkout/TermsAgreement';
import {
  choiceCardVariants,
  choiceInputClassName,
  fieldInputClassName,
  fieldLabelClassName,
  fieldLabelSpanClassName,
  formErrorClassName,
  submitClassName,
} from '@/components/forms/selectionFormClassNames';
import { MovingColourButton } from '@/components/MovingColourButton';
import { priceValue, trackBeginCheckout } from '@/lib/analytics';
import { type PublicSiteSettings } from '@/lib/api';
import { focusRingClassName } from '@/lib/controlState';
import { planByCode } from '@/lib/plans';
import { cn } from '@/lib/utils';

import { PRICE_FIELD, type SeoPlan, type SeoPlanCode } from '../_lib/plans';
import { submitSeoSignup, type SeoSignupState } from './SeoSignupDialog.actions';

const initialState: SeoSignupState = { status: 'idle' };

/**
 * The order form, in a modal the package cards open (owner, 2026-11-07): a buyer picks an audit
 * first and gives their details second, so the fields are not on the page beside a choice not yet
 * made. The chosen audit is named at the top and can be changed there without closing. A centred
 * box from `sm`; on a phone, a sheet from the foot of the screen, as the service pages' forms are.
 *
 * Track B under the forms standard (schema beside this file). Dispatched from `onSubmit` rather than
 * `action` so a failed submit keeps what was typed.
 */
export function SeoSignupDialog({
  dialogRef,
  plans,
  selectedCode,
  onChoose,
  settings,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  plans: SeoPlan[];
  selectedCode: SeoPlanCode;
  onChoose: (code: SeoPlanCode) => void;
  settings: PublicSiteSettings;
}) {
  const router = useRouter();
  const titleId = useId();
  const selected = planByCode(plans, selectedCode) ?? plans[0];
  const [state, dispatch, isPending] = useActionState(submitSeoSignup, initialState);
  // An affiliate's link (/seo?code=XXX) arrives with the discount code filled in. The page
  // renders per request, so the server sees the same params and nothing mismatches.
  const searchParams = useSearchParams();
  const [code, setCode] = useState(() => (searchParams.get('code') ?? '').toUpperCase());

  useEffect(() => {
    if (state.status !== 'success' || !state.reference) return;
    const price = priceValue(settings[PRICE_FIELD[selected.code]]);
    trackBeginCheckout(state.reference, {
      value: price,
      items: [
        {
          item_id: `seo_${selected.code}`,
          item_name: selected.productName,
          item_category: 'seo',
          price,
        },
      ],
    });
    router.push(`/seo/payment?ref=${encodeURIComponent(state.reference)}`);
    // Only the submission should fire this, not a later change of plan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, router]);

  const close = () => dialogRef.current?.close();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('plan', selectedCode);
    startTransition(() => dispatch(formData));
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // A tap on the backdrop reaches the dialog itself; one inside lands on a child.
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className={cn(
        'w-full border-0 bg-transparent p-0 text-inherit',
        // The sheet, over the browser's centred box: full width, from the foot of the screen.
        'max-sm:m-0 max-sm:max-h-[92dvh] max-sm:max-w-none max-sm:overflow-y-auto max-sm:[inset:auto_0_0_0]',
        // Preflight zeroes every margin, the dialog's centring `margin: auto` with it.
        'sm:m-auto sm:max-h-[92dvh] sm:max-w-measure-tight sm:overflow-y-auto',
        'backdrop:bg-[color-mix(in_srgb,var(--surface-dark)_60%,transparent)]',
      )}
    >
      <form
        className="relative flex flex-col bg-surface-page px-ml py-xl sm:p-2xl"
        onSubmit={onSubmit}
      >
        <header className="mb-l pr-xl">
          <p className="m-0 mb-2xs text-label font-black tracking-label-wide text-action-primary uppercase">
            Your details
          </p>
          <h2
            id={titleId}
            className="m-0 text-title-sm leading-tight tracking-[-0.04em] text-text-primary"
          >
            {selected.name} audit, {selected.price}
            <span className="font-normal text-text-muted">, {selected.cadence}.</span>
          </h2>
        </header>

        {/* The audit can still change here: the cards' choice, as three chips. */}
        <fieldset className="m-0 mb-l grid grid-cols-3 gap-xs border-0 p-0">
          <legend className="mb-xs block text-body font-control text-text-control">Audit</legend>
          {plans.map((plan) => {
            const isSelected = plan.code === selectedCode;
            return (
              <label key={plan.code} className={choiceCardVariants({ selected: isSelected })}>
                <input
                  className={choiceInputClassName}
                  type="radio"
                  name="audit-choice"
                  value={plan.code}
                  checked={isSelected}
                  onChange={() => onChoose(plan.code)}
                />
                {plan.name}
                <small>{plan.price}</small>
              </label>
            );
          })}
        </fieldset>

        <label className={fieldLabelClassName}>
          <span className={fieldLabelSpanClassName}>Email</span>
          <input
            className={fieldInputClassName}
            name="email"
            type="email"
            placeholder="e.g. email@example.com"
            autoComplete="email"
            // The dialog opens on the first field, not on the audit chips above it.
            autoFocus
            required
          />
        </label>
        <label className={fieldLabelClassName}>
          <span className={fieldLabelSpanClassName}>Phone (optional)</span>
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
        <label className={fieldLabelClassName}>
          <span className={fieldLabelSpanClassName}>Discount code (optional)</span>
          <input
            className={fieldInputClassName}
            name="discount_code"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="From a podcast you listen to"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
          />
        </label>
        <TermsAgreement
          className="mb-l"
          name="accepted_terms"
          required
          termsHref="/legal/seo-audit-terms"
          termsLabel="SEO Audit Terms"
          authorisation="authorise this payment."
        />
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
        <MovingColourButton
          type="submit"
          className={submitClassName}
          direction="right"
          size="large"
          fullWidth
          disabled={isPending}
        >
          {isPending ? 'Saving…' : 'Continue to payment'}
        </MovingColourButton>

        {/* Last in the DOM so the dialog opens with the first field focused, not this. */}
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className={cn(
            'absolute top-s right-s flex size-[var(--tap-min)] cursor-pointer items-center justify-center border-0 bg-transparent text-text-muted hover:text-text-primary',
            focusRingClassName,
          )}
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </form>
    </dialog>
  );
}

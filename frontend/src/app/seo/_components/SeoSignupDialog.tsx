'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  type FormEvent,
  type RefObject,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from 'react';

import { TermsAgreement } from '@/components/checkout/TermsAgreement';
import { OrderContactFields, OrderDialog, OrderSubmit } from '@/components/forms/OrderDialog';
import {
  fieldInputClassName,
  fieldLabelClassName,
  fieldLabelSpanClassName,
} from '@/components/forms/selectionFormClassNames';
import { priceValue, trackBeginCheckout } from '@/lib/analytics';
import { type PublicSiteSettings } from '@/lib/api';
import { planByCode } from '@/lib/plans';

import { PRICE_FIELD, type SeoPlan, type SeoPlanCode } from '../_lib/plans';
import { submitSeoSignup, type SeoSignupState } from './SeoSignupDialog.actions';

const initialState: SeoSignupState = { status: 'idle' };

/**
 * The audit order form, in the dialog the audit cards open (OrderDialog). Track B under the forms
 * standard (schema beside this file). Dispatched from `onSubmit` rather than `action` so a failed
 * submit keeps what was typed.
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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('plan', selectedCode);
    startTransition(() => dispatch(formData));
  };

  return (
    <OrderDialog
      dialogRef={dialogRef}
      heading={
        <>
          {selected.name} audit, {selected.price}
          <span className="font-normal text-text-muted">, {selected.cadence}.</span>
        </>
      }
      choices={{
        legend: 'Audit',
        name: 'audit-choice',
        options: plans.map((plan) => ({ code: plan.code, label: plan.name, detail: plan.price })),
        selectedCode,
        onChoose,
      }}
      onSubmit={onSubmit}
    >
      <OrderContactFields />
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
      <OrderSubmit
        disabled={isPending}
        error={
          state.status === 'error' && (
            <>
              {state.error}
              {state.accountExists && (
                <>
                  {' '}
                  <Link className="font-heavy underline" href="/login">
                    Sign in instead.
                  </Link>
                </>
              )}
            </>
          )
        }
      >
        {isPending ? 'Saving…' : 'Continue to payment'}
      </OrderSubmit>
    </OrderDialog>
  );
}

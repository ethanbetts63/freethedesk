'use client';

import {
  type FormEvent,
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { TermsAgreement } from '@/components/checkout/TermsAgreement';
import { MovingColourButton } from '@/components/MovingColourButton';
import { SelectionFormPanel } from '@/components/forms/SelectionFormPanel';
import {
  fieldInputClassName,
  fieldLabelClassName,
  fieldLabelSpanClassName,
  formErrorClassName,
  formTitleClassName,
  formTitleHeadingClassName,
  submitClassName,
} from '@/components/forms/selectionFormClassNames';
import { PackageChooser, type PackageCard } from '@/components/marketing/PackageChooser';
import { priceValue, trackBeginCheckout, trackSelectPlanOnce } from '@/lib/analytics';
import { type PublicSiteSettings } from '@/lib/api';
import { planByCode } from '@/lib/plans';
import { submitSeoSignup, type SeoSignupState } from './SeoSignupPanel.actions';
import { buildSeoPlans, PRICE_FIELD, type SeoPlanCode } from '../_lib/plans';

const initialState: SeoSignupState = { status: 'idle' };

/**
 * The SEO order form, drawn like the service pages' package forms: the audits as cards on the
 * left (see PackageChooser), the details, terms and payment on the right.
 */
export function SeoSignupPanel({ settings }: { settings: PublicSiteSettings }) {
  const router = useRouter();
  const [selectedCode, setSelectedCode] = useState<SeoPlanCode>('plus');
  const plans = useMemo(() => buildSeoPlans(settings), [settings]);
  const selected = planByCode(plans, selectedCode) ?? plans[0];
  const [state, dispatch, isPending] = useActionState(submitSeoSignup, initialState);

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

  const cards: PackageCard<SeoPlanCode>[] = plans.map((plan) => ({
    code: plan.code,
    name: plan.name,
    priceLabel: 'One audit',
    price: plan.price,
    includes: plan.features,
  }));

  return (
    <SelectionFormPanel
      onSubmit={onSubmit}
      chooser={
        <PackageChooser
          noun="audit"
          cards={cards}
          selectedCode={selectedCode}
          onChoose={(code) => {
            setSelectedCode(code);
            trackSelectPlanOnce('seo', code);
          }}
        />
      }
    >
      <div className={formTitleClassName}>
        <h3 className={formTitleHeadingClassName}>
          Your <span className="moving-colour-text">details.</span>
        </h3>
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
    </SelectionFormPanel>
  );
}

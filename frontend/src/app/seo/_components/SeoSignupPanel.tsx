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
import { priceValue, trackBeginCheckout, trackEvent } from '@/lib/analytics';
import { type PublicSiteSettings } from '@/lib/api';
import { planByCode } from '@/lib/plans';
import { submitSeoSignup, type SeoSignupState } from './SeoSignupPanel.actions';
import { buildSeoPlans, type SeoPlanCode } from '../_lib/plans';

const initialState: SeoSignupState = { status: 'idle' };

const PRICE_FIELD = {
  monthly: 'seo_monthly_price',
  quarterly: 'seo_quarterly_price',
  yearly: 'seo_yearly_price',
  oneoff: 'seo_oneoff_price',
} as const satisfies Record<SeoPlanCode, keyof PublicSiteSettings>;

/** Under each card's price: how often it recurs, and whether it can be stopped. */
const CADENCE_NOTE: Record<SeoPlanCode, string> = {
  monthly: 'Every month. Cancel any time.',
  quarterly: 'Every 3 months. Cancel any time.',
  yearly: 'Once a year. Cancel any time.',
  oneoff: 'Once. No subscription.',
};

/**
 * The SEO order form, drawn like the service pages' package forms: the plans as cards on the
 * left (see PackageChooser), the details, terms and payment on the right.
 */
export function SeoSignupPanel({ settings }: { settings: PublicSiteSettings }) {
  const router = useRouter();
  const [selectedCode, setSelectedCode] = useState<SeoPlanCode>('monthly');
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
    label: plan.code === 'oneoff' ? 'One-off' : 'Subscription',
    name: plan.name,
    priceLabel: 'Per audit',
    price: plan.price,
    priceNote: CADENCE_NOTE[plan.code],
    includes: plan.features,
    recommended: plan.recommended,
  }));

  return (
    <SelectionFormPanel
      onSubmit={onSubmit}
      chooser={
        <PackageChooser
          noun="plan"
          cards={cards}
          selectedCode={selectedCode}
          onChoose={(code) => {
            setSelectedCode(code);
            trackEvent('select_plan', { item_category: 'seo', plan: code });
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
      <TermsAgreement
        className="mb-l"
        name="accepted_terms"
        required
        termsHref="/legal/seo-subscription-terms"
        termsLabel="SEO Subscription Terms"
        authorisation={`authorise this ${selected.code === 'oneoff' ? 'payment' : 'recurring subscription'}.`}
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

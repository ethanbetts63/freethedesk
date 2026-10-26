'use client';

import { type FormEvent, type ReactNode, startTransition, useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { TermsAgreement } from '@/components/checkout/TermsAgreement';
import { SelectionFormPanel } from '@/components/forms/SelectionFormPanel';
import {
  fieldInputClassName,
  fieldLabelClassName,
  fieldLabelSpanClassName,
  formErrorClassName,
  formTitleClassName,
  selectionHeadingClassName,
  submitClassName,
} from '@/components/forms/selectionFormClassNames';
import { MovingColourButton } from '@/components/MovingColourButton';
import { trackEvent } from '@/lib/analytics';
import { submitAffiliateSignup, type AffiliateSignupState } from './AffiliateSignupForm.actions';

const initialState: AffiliateSignupState = { status: 'idle' };

/**
 * The affiliate sign-up, drawn like the service pages' order forms: the pitch on the left where
 * the packages would be, the details on the right. Submitting opens the account at once (the
 * code, the free audit, the terms) and sends the host to the verify page, where the emailed code
 * becomes their password.
 */
export function AffiliateSignupForm({ pitch }: { pitch: ReactNode }) {
  const router = useRouter();
  const [state, dispatch, isPending] = useActionState(submitAffiliateSignup, initialState);

  useEffect(() => {
    if (state.status !== 'success') return;
    trackEvent('generate_lead', { lead_source: 'affiliate_signup' });
    router.push(`/affiliates/verify?email=${encodeURIComponent(state.email ?? '')}`);
  }, [router, state]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  return (
    <SelectionFormPanel onSubmit={onSubmit} chooser={pitch}>
      <div className={formTitleClassName}>
        <h3 className={selectionHeadingClassName}>
          <span className="moving-colour-text">Your details.</span>
        </h3>
      </div>
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>Your name</span>
        <input
          className={fieldInputClassName}
          name="contact_name"
          type="text"
          autoComplete="name"
          placeholder="e.g. Sam Taylor"
          required
        />
      </label>
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>Email</span>
        <input
          className={fieldInputClassName}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="e.g. email@example.com"
          required
        />
      </label>
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>Podcast or Socials</span>
        <input
          className={fieldInputClassName}
          name="business_name"
          type="text"
          autoComplete="organization"
          placeholder="e.g. The Tradie Show"
          required
        />
      </label>
      <TermsAgreement
        className="mb-l"
        name="accepted_terms"
        required
        termsHref="/legal/affiliate-program-terms"
        termsLabel="Affiliate Program Terms"
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
        disabled={isPending || state.status === 'success'}
      >
        {isPending || state.status === 'success' ? 'Opening your account…' : 'Claim my free audit'}
      </MovingColourButton>
    </SelectionFormPanel>
  );
}

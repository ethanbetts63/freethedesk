'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';

import {
  fieldInputClassName,
  fieldLabelClassName,
  fieldLabelSpanClassName,
  fieldTextareaClassName,
  formErrorClassName,
  submitClassName,
} from '@/components/forms/selectionFormClassNames';
import { MovingColourButton } from '@/components/MovingColourButton';
import { trackEvent } from '@/lib/analytics';
import { submitAffiliateSignup, type AffiliateSignupState } from './AffiliateSignupForm.actions';

const initialState: AffiliateSignupState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <MovingColourButton
      type="submit"
      className={submitClassName}
      direction="right"
      size="large"
      fullWidth
      disabled={pending}
    >
      {pending ? 'Sending…' : 'Sign up and claim my free audit'}
    </MovingColourButton>
  );
}

/** The podcast affiliate sign-up: five fields, one submit. The section around it renders on the server. */
export function AffiliateSignupForm() {
  const [state, formAction] = useActionState(submitAffiliateSignup, initialState);

  useEffect(() => {
    if (state.status === 'success')
      trackEvent('generate_lead', { lead_source: 'affiliate_signup' });
  }, [state]);

  if (state.status === 'success') {
    return (
      <div role="status">
        <span
          aria-hidden="true"
          className="mb-m flex h-[34px] w-[34px] items-center justify-center rounded-full bg-action-primary text-text-on-dark"
        >
          ✓
        </span>
        <strong className="block text-lead tracking-[-0.03em]">Thanks, you&apos;re in.</strong>
        <p className="mt-xs text-body leading-relaxed text-text-muted">
          We&apos;ll email you within two working days to start your free audit. Your code and link
          follow once it&apos;s written.
        </p>
      </div>
    );
  }

  return (
    // The field classes size their text from the selection panel's variable, so
    // the form sets it the way that panel does.
    <form className="[--selection-input-font-size:1rem]" action={formAction}>
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>Your name</span>
        <input
          className={fieldInputClassName}
          name="name"
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
        <span className={fieldLabelSpanClassName}>Your podcast</span>
        <input
          className={fieldInputClassName}
          name="podcast"
          type="text"
          autoComplete="organization"
          placeholder="e.g. The Tradie Show"
          required
        />
      </label>
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>The website to audit</span>
        {/* Not type="url": it rejects a scheme-less host before the schema adds one. */}
        <input
          className={fieldInputClassName}
          name="website"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="Your business, or the podcast's own site"
          required
        />
      </label>
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>Notes (optional)</span>
        <textarea
          className={fieldTextareaClassName}
          name="notes"
          rows={3}
          maxLength={2000}
          placeholder="e.g. Who listens, and where you'd mention the code."
        />
      </label>
      {state.status === 'error' && (
        <p className={formErrorClassName} role="alert">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}

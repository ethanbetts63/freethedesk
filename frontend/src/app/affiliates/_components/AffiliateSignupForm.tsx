'use client';

import { type FormEvent, type ReactNode, startTransition, useActionState, useEffect } from 'react';

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
 * the packages would be, the details on the right. Four fields, one submit.
 */
export function AffiliateSignupForm({ pitch }: { pitch: ReactNode }) {
  const [state, dispatch, isPending] = useActionState(submitAffiliateSignup, initialState);

  useEffect(() => {
    if (state.status === 'success')
      trackEvent('generate_lead', { lead_source: 'affiliate_signup' });
  }, [state]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  return (
    <SelectionFormPanel onSubmit={onSubmit} chooser={pitch}>
      {state.status === 'success' ? (
        <div role="status">
          <span
            aria-hidden="true"
            className="mb-m flex h-[34px] w-[34px] items-center justify-center rounded-full bg-action-primary text-text-on-dark"
          >
            ✓
          </span>
          <strong className="block text-lead tracking-[-0.03em]">Thanks, you&apos;re in.</strong>
          <p className="mt-xs text-body leading-relaxed text-text-muted">
            We&apos;ll email you within two working days to start your free audit. Your code and
            link follow once it&apos;s written.
          </p>
        </div>
      ) : (
        <>
          <div className={formTitleClassName}>
            <h3 className={selectionHeadingClassName}>
              Your <span className="moving-colour-text">details.</span>
            </h3>
          </div>
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
            <span className={fieldLabelSpanClassName}>Business name</span>
            <input
              className={fieldInputClassName}
              name="business"
              type="text"
              autoComplete="organization"
              placeholder="e.g. The Tradie Show"
              required
            />
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldLabelSpanClassName}>Your website (optional)</span>
            {/* Not type="url": it rejects a scheme-less host before the schema adds one. */}
            <input
              className={fieldInputClassName}
              name="website"
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="e.g. www.yoursite.com"
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
            {isPending ? 'Sending…' : 'Claim my free audit'}
          </MovingColourButton>
        </>
      )}
    </SelectionFormPanel>
  );
}

'use client';

import { type FormEvent, startTransition, useActionState, useEffect } from 'react';

import { SelectionFormPanel } from '@/components/forms/SelectionFormPanel';
import {
  fieldInputClassName,
  fieldLabelClassName,
  fieldLabelSpanClassName,
  fieldTextareaClassName,
  formErrorClassName,
  formTitleClassName,
  selectionHeadingClassName,
  submitClassName,
} from '@/components/forms/selectionFormClassNames';
import { MovingColourButton } from '@/components/MovingColourButton';
import { trackEvent } from '@/lib/analytics';
import { submitAffiliateSignup, type AffiliateSignupState } from './AffiliateSignupForm.actions';

const initialState: AffiliateSignupState = { status: 'idle' };

/** The left half of the panel: there is nothing to choose, so it sells the sign-up instead. */
const AFTER_SIGNUP = [
  {
    title: 'We email you',
    body: 'Within two working days, with the one or two things we need to start your audit.',
  },
  {
    title: 'You read your audit',
    body: 'The same report your listeners would get, about your own site. Decide if it’s something you’d put your name to.',
  },
  {
    title: 'You get your code',
    body: 'A code and a link to share however suits your show. Every audit bought with it is yours.',
  },
];

function Pitch({ share }: { share: string }) {
  return (
    <>
      <h3 className={selectionHeadingClassName}>
        Your audit is <span className="moving-colour-text">on us.</span>
      </h3>
      <p className="m-0 mt-m text-body leading-relaxed text-text-muted">
        Sign up and we write your audit free, so you know exactly what you&apos;re recommending.
        Then every audit a listener buys with your code pays you {share}.
      </p>
      <ol className="m-0 mt-xl list-none p-0">
        {AFTER_SIGNUP.map((step, index) => (
          <li
            key={step.title}
            className="grid grid-cols-[auto_minmax(0,1fr)] gap-m border-t border-border-subtle py-m"
          >
            <span className="text-label font-black tracking-label-wide text-action-primary">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h4 className="m-0 mb-4xs text-lead tracking-[-0.025em] text-text-secondary">
                {step.title}
              </h4>
              <p className="m-0 text-body leading-relaxed text-text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

/**
 * The affiliate sign-up, drawn like the service pages' order forms: the pitch on the left where
 * the packages would be, the details on the right. Five fields, one submit.
 */
export function AffiliateSignupForm({ share }: { share: string }) {
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
    <SelectionFormPanel onSubmit={onSubmit} chooser={<Pitch share={share} />}>
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

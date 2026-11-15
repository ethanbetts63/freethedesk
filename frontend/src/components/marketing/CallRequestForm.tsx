'use client';

import { type FormEvent, startTransition, useActionState, useEffect } from 'react';

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

import { submitCallRequest, type CallRequestState } from './CallRequestForm.actions';

const initialState: CallRequestState = { status: 'idle' };

/**
 * Ask for a call back: a phone number, and optionally the website and a note. Dispatched from
 * `onSubmit`, so a failed submit keeps what was typed.
 */
export function CallRequestForm({ source }: { source: string }) {
  const [state, dispatch, isPending] = useActionState(submitCallRequest, initialState);

  useEffect(() => {
    if (state.status === 'success') trackEvent('generate_lead', { lead_source: 'seo_call' });
  }, [state]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  if (state.status === 'success') {
    return (
      <div role="status" className="grid gap-s">
        <p className="m-0 text-title-sm tracking-[-0.04em] text-text-secondary">Thanks.</p>
        <p className="m-0 text-body leading-relaxed text-text-muted">
          We&apos;ll ring you back as soon as we can.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="source" value={source} />
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>Phone</span>
        <input
          className={fieldInputClassName}
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="e.g. 0400 000 000"
          required
        />
      </label>
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>Website (optional)</span>
        {/* Not type="url": it rejects a scheme-less host before the schema adds one. */}
        <input
          className={fieldInputClassName}
          name="website"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="e.g. yoursite.com.au"
        />
      </label>
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>Anything we should know? (optional)</span>
        <textarea className={fieldTextareaClassName} name="notes" rows={3} maxLength={2000} />
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
        {isPending ? 'Sending…' : 'Ring me back'}
      </MovingColourButton>
    </form>
  );
}

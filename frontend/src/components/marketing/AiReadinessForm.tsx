'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { MovingColourButton } from '@/components/MovingColourButton';
import { cn } from '@/lib/utils';
import { submitAiReadiness, type AiReadinessState } from './AiReadinessForm.actions';

const initialState: AiReadinessState = { status: 'idle' };

/** A text field on the navy prompt surface; the ads savings calculator shares it. */
export const onDarkFieldClassName = cn(
  'w-full rounded-none border px-s py-0 outline-none',
  'border-[color-mix(in_srgb,var(--accent-on-dark-soft)_32%,transparent)]',
  'bg-[color-mix(in_srgb,var(--surface-page)_7%,transparent)]',
  'text-text-on-dark placeholder:text-text-on-dark-subtle',
  // 16px floor: below it, iOS Safari zooms the page on focus. Only the dialog
  // ever renders at that width - the inline strip starts at `sm`, where the
  // field can drop to the interface size and a 40px row.
  'min-h-[var(--tap-min)] text-lead sm:min-h-[40px] sm:text-label',
  'focus:border-accent-on-dark-soft',
  'focus:bg-[color-mix(in_srgb,var(--surface-page)_12%,transparent)]',
  // On a dark surface the page accent is invisible, so the ring takes the
  // soft on-dark accent instead. Shape and strength stay shared.
  '[--ring-field-colour:var(--accent-on-dark-soft)] focus:shadow-focus',
);

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <MovingColourButton
      type="submit"
      className="justify-center whitespace-nowrap sm:justify-start"
      direction="right"
      size="compact"
      disabled={pending}
    >
      {pending ? 'Starting…' : 'Run free check'}
    </MovingColourButton>
  );
}

/** The interactive half of the banner. Split out so the surrounding section and
    heading can render on the server wherever the banner is used inline. */
export function AiReadinessForm() {
  const [state, formAction] = useActionState(submitAiReadiness, initialState);

  if (state.status === 'success') {
    return (
      // Was --slate-100, the only raw ramp value left in this component. On
      // navy it is indistinguishable from the on-dark text role it should have
      // been using, so it now says what it means.
      <p className="m-0 flex items-center gap-s text-body text-text-on-dark" role="status">
        <span
          aria-hidden="true"
          className="flex h-[28px] flex-[0_0_28px] items-center justify-center rounded-full bg-action-primary text-text-on-dark"
        >
          ✓
        </span>
        Your free check is in the queue — we&apos;ll email you the result.
      </p>
    );
  }

  return (
    <form
      className="grid min-w-0 grid-cols-[minmax(0,1fr)] items-center gap-xs sm:grid-cols-[minmax(170px,1fr)_minmax(170px,1fr)_auto]"
      action={formAction}
    >
      <label className="block min-w-0">
        <span className="sr-only">Website</span>
        {/* Not type="url": it rejects a scheme-less host before the schema adds one. */}
        <input
          className={onDarkFieldClassName}
          name="website"
          type="text"
          inputMode="url"
          placeholder="e.g. www.yoursite.com"
          autoComplete="url"
          required
        />
      </label>
      <label className="block min-w-0">
        <span className="sr-only">Email</span>
        <input
          className={onDarkFieldClassName}
          name="email"
          type="email"
          placeholder="e.g. email@example.com"
          autoComplete="email"
          required
        />
      </label>
      <SubmitButton />
      {state.status === 'error' && (
        <p className="col-[1/-1] m-0 text-caption text-text-danger-on-dark" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}

'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { MovingColourButton } from '@/components/MovingColourButton';
import styles from './AiReadinessBanner.module.css';
import { submitAiReadiness, type AiReadinessState } from './AiReadinessForm.actions';

const initialState: AiReadinessState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <MovingColourButton
      type="submit"
      className={styles.submit}
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
      <p className={styles.success} role="status">
        <span aria-hidden="true">✓</span>
        Your free check is in the queue — we&apos;ll email you the result.
      </p>
    );
  }

  return (
    <form className={styles.form} action={formAction}>
      <label>
        <span>Website</span>
        {/* Not type="url": it rejects a scheme-less host before the schema adds one. */}
        <input
          name="website"
          type="text"
          inputMode="url"
          placeholder="e.g. www.yoursite.com"
          autoComplete="url"
          required
        />
      </label>
      <label>
        <span>Email</span>
        <input
          name="email"
          type="email"
          placeholder="e.g. email@example.com"
          autoComplete="email"
          required
        />
      </label>
      <SubmitButton />
      {state.status === 'error' && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}

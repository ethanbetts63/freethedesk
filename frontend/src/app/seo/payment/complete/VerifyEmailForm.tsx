'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';

import { authFieldLabelClassName } from '@/components/auth/AuthCard';
import { MINIMUM_PASSWORD_LENGTH, PasswordField } from '@/components/auth/PasswordFields';
import { CheckoutButton } from '@/components/checkout/CheckoutButton';
import { Notice } from '@/components/ui/Notice';
import { formControlClassName } from '@/components/ui/formControl';
import { cn } from '@/lib/utils';
import { submitVerifyEmail, type VerifyEmailState } from './VerifyEmail.actions';

const initialState: VerifyEmailState = { status: 'idle' };
const fieldClassName = cn(formControlClassName, 'mt-2xs block bg-surface-tint p-s');

/**
 * Verify the email with the code the welcome email carries, and choose a password. Any browser
 * can: the code is the credential, not the device. Setting the password signs the customer in,
 * and the dashboard opens straight after.
 */
export function VerifyEmailForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(submitVerifyEmail, initialState);

  useEffect(() => {
    if (state.status === 'success') router.replace('/seo-portal');
  }, [router, state.status]);

  return (
    <form className="mt-xl flex flex-col gap-m text-left" action={formAction}>
      <label className={authFieldLabelClassName}>
        Email
        <input
          className={fieldClassName}
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </label>
      <label className={authFieldLabelClassName}>
        Verification code
        <input
          className={fieldClassName}
          name="verification_code"
          type="text"
          autoComplete="one-time-code"
          spellCheck={false}
          required
        />
      </label>
      <PasswordField
        name="new_password"
        label="Choose a password"
        autoComplete="new-password"
        minLength={MINIMUM_PASSWORD_LENGTH}
      />
      <PasswordField
        name="confirm_password"
        label="Confirm password"
        autoComplete="new-password"
        minLength={MINIMUM_PASSWORD_LENGTH}
      />
      {state.status === 'error' && (
        <Notice tone="danger" size="field">
          {state.error}
        </Notice>
      )}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <CheckoutButton type="submit" busy={pending} disabled={pending}>
      <span>{pending ? 'Opening your dashboard…' : 'Verify and continue'}</span>
      <b aria-hidden="true">→</b>
    </CheckoutButton>
  );
}

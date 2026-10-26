'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';

import { authFieldLabelClassName } from '@/components/auth/AuthCard';
import { PasswordField } from '@/components/auth/PasswordFields';
import { MINIMUM_PASSWORD_LENGTH } from '@/lib/passwordPolicy';
import { CheckoutButton } from '@/components/checkout/CheckoutButton';
import { Notice } from '@/components/ui/Notice';
import { formControlClassName } from '@/components/ui/formControl';
import { cn } from '@/lib/utils';
import { submitVerifyEmail, type VerifyEmailState } from './VerifyEmailCode.actions';

const initialState: VerifyEmailState = { status: 'idle' };
const fieldClassName = cn(formControlClassName, 'mt-2xs block bg-surface-tint p-s');

/**
 * Verify an email with the code the welcome email carries, and choose a password. Any browser
 * can: the code is the credential, not the device. Setting the password signs the owner in, and
 * `destination` opens straight after. One form for every account a product opens by email: the
 * SEO purchase and the affiliate sign-up (see "Accounts opened by an emailed code" in
 * freetheplatform/_docs/apps/auth.md).
 */
export function VerifyEmailCodeForm({
  destination,
  defaultEmail = '',
  busyLabel = 'Opening your dashboard…',
}: {
  destination: string;
  defaultEmail?: string;
  busyLabel?: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(submitVerifyEmail, initialState);

  useEffect(() => {
    if (state.status === 'success') router.replace(destination);
  }, [destination, router, state.status]);

  return (
    <form className="mt-xl flex flex-col gap-m text-left" action={formAction}>
      <label className={authFieldLabelClassName}>
        Email
        <input
          className={fieldClassName}
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={defaultEmail}
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
      <SubmitButton busyLabel={busyLabel} />
    </form>
  );
}

function SubmitButton({ busyLabel }: { busyLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <CheckoutButton type="submit" busy={pending} disabled={pending}>
      <span>{pending ? busyLabel : 'Verify and continue'}</span>
      <b aria-hidden="true">→</b>
    </CheckoutButton>
  );
}

'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';

import { MINIMUM_PASSWORD_LENGTH, PasswordField } from '@/components/auth/PasswordFields';
import { CheckoutButton } from '@/components/checkout/CheckoutButton';
import { Notice } from '@/components/ui/Notice';
import { submitChoosePassword, type ChoosePasswordState } from './ChoosePassword.actions';

const initialState: ChoosePasswordState = { status: 'idle' };

/**
 * The first password, chosen the moment payment lands. Setting it is what
 * signs the customer in, so nothing comes before it, and the dashboard opens
 * straight after.
 */
export function ChoosePasswordForm({ reference }: { reference: string }) {
  const router = useRouter();
  const [state, formAction] = useActionState(submitChoosePassword, initialState);

  useEffect(() => {
    if (state.status === 'success') router.replace('/seo-portal');
  }, [router, state.status]);

  if (state.status === 'unavailable') {
    return (
      <div className="mt-xl text-left">
        <Notice tone="warning" size="field">
          This page can no longer set your password. Sign in with the temporary password we emailed
          you, and you will choose your own straight after.
        </Notice>
        <CheckoutButton variant="link" className="mt-l" href="/login">
          Sign in
        </CheckoutButton>
      </div>
    );
  }

  return (
    <form className="mt-xl flex flex-col gap-m text-left" action={formAction}>
      <input type="hidden" name="reference" value={reference} />
      <PasswordField
        name="new_password"
        label="Password"
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
      <span>{pending ? 'Opening your dashboard…' : 'Set password and continue'}</span>
      <b aria-hidden="true">→</b>
    </CheckoutButton>
  );
}

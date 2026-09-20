'use client';

import { use, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { AuthCard, authLinkClassName } from '@/components/auth/AuthCard';
import { MINIMUM_PASSWORD_LENGTH, PasswordField } from '@/components/auth/PasswordFields';
import { submitResetConfirm, type ResetConfirmState } from './ResetPasswordConfirm.actions';

const initialState: ResetConfirmState = { status: 'idle' };

/**
 * Spend a reset link on a new password.
 *
 * No cookies come back from this. Whoever followed the link has proved they can
 * read the account's email, which is not the same as being signed in, so it ends
 * at the sign-in form — one extra step, and the session starts the way every
 * other session does.
 */
export default function ResetPasswordConfirmPage({
  params,
}: {
  params: Promise<{ uid: string; token: string }>;
}) {
  const { uid, token } = use(params);
  const [state, formAction] = useActionState(submitResetConfirm, initialState);

  return (
    <AuthCard
      kicker="Reset password"
      heading="Choose a new password"
      intro={`At least ${MINIMUM_PASSWORD_LENGTH} characters. Signing in elsewhere will end those sessions.`}
      footer={
        <p className="mt-ml text-label text-text-muted">
          Link expired?{' '}
          <Link className={authLinkClassName} href="/reset-password">
            Ask for another
          </Link>
        </p>
      }
    >
      <form className="flex flex-col gap-m" action={formAction}>
        {/* From the route, not from the person; the action bounds them anyway. */}
        <input type="hidden" name="uid" value={uid} />
        <input type="hidden" name="token" value={token} />
        <PasswordField
          name="new_password"
          label="New password"
          autoComplete="new-password"
          minLength={MINIMUM_PASSWORD_LENGTH}
        />
        <PasswordField
          name="confirm_password"
          label="Confirm new password"
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
    </AuthCard>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Set password'}
    </Button>
  );
}

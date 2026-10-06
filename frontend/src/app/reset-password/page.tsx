'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { formControlClassName } from '@/components/ui/formControl';
import { cn } from '@/lib/utils';
import { AuthCard, authFieldLabelClassName, authLinkClassName } from '@/components/auth/AuthCard';
import { submitResetRequest, type ResetRequestState } from './ResetPassword.actions';

const initialState: ResetRequestState = { status: 'idle' };

/**
 * Ask for a reset link.
 *
 * The confirmation is the same whatever happened — address known, unknown, or
 * the email failing to send. The API is deliberately built that way, and
 * reporting anything more specific here would undo it: the page would become a
 * way of testing whether somebody has an account. The only thing this page
 * reports as a failure is its own validation, which happens before any request.
 */
export default function ResetPasswordPage() {
  const [state, formAction] = useActionState(submitResetRequest, initialState);

  return (
    <AuthCard
      kicker="Forgot password"
      heading="Reset your password"
      intro="Enter the email address you sign in with and we will send you a link."
      footer={
        <p className="mt-ml text-label text-text-muted">
          Remembered it?{' '}
          <Link className={authLinkClassName} href="/login">
            Back to sign in
          </Link>
        </p>
      }
    >
      {state.status === 'sent' ? (
        <Notice tone="success" size="field">
          If that address has an account, a reset link is on its way. It works once.
        </Notice>
      ) : (
        <form className="flex flex-col gap-m" action={formAction}>
          {state.status === 'error' && (
            <Notice tone="danger" size="field">
              {state.error}
            </Notice>
          )}
          <label className={authFieldLabelClassName}>
            Email
            <input
              className={cn(formControlClassName, 'mt-2xs block bg-surface-tint p-s')}
              name="email"
              type="email"
              autoComplete="username"
              required
            />
          </label>
          <SubmitButton />
        </form>
      )}
    </AuthCard>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Sending…' : 'Send reset link'}
    </Button>
  );
}

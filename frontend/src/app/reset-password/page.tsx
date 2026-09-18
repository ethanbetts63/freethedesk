'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/lib/api';
import { AdminButton } from '@/components/dashboard/AdminButton';
import { AdminNotice } from '@/components/dashboard/AdminNotice';
import { formControlClassName } from '@/components/dashboard/formControl';
import { cn } from '@/lib/utils';
import { AuthCard, authFieldLabelClassName, authLinkClassName } from '@/components/auth/AuthCard';

/**
 * Ask for a reset link.
 *
 * The confirmation is the same whatever happened — address known, unknown, or
 * the email failing to send. The API is deliberately built that way, and
 * reporting anything more specific here would undo it: the page would become a
 * way of testing whether somebody has an account.
 */
export default function ResetPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitting(true);
    await requestPasswordReset(String(data.get('email'))).catch(() => undefined);
    setSubmitting(false);
    setSent(true);
  }

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
      {sent ? (
        <AdminNotice tone="success" size="field">
          If that address has an account, a reset link is on its way. It works once and expires
          within the hour.
        </AdminNotice>
      ) : (
        <form className="flex flex-col gap-m" onSubmit={submit}>
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
          <AdminButton type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset link'}
          </AdminButton>
        </form>
      )}
    </AuthCard>
  );
}

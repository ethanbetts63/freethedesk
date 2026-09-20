'use client';

import { type FormEvent, use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { confirmPasswordReset } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { AuthCard, authLinkClassName } from '@/components/auth/AuthCard';
import { MINIMUM_PASSWORD_LENGTH, PasswordField } from '@/components/auth/PasswordFields';

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
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get('new_password'));
    if (password !== String(data.get('confirm_password'))) {
      setError('Those two passwords do not match.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await confirmPasswordReset(uid, token, password);
      router.replace('/login?reset=1');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'That link is no longer valid.');
      setSubmitting(false);
    }
  }

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
      <form className="flex flex-col gap-m" onSubmit={submit}>
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
        {error && (
          <Notice tone="danger" size="field">
            {error}
          </Notice>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Set password'}
        </Button>
      </form>
    </AuthCard>
  );
}

'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { changePassword, getProfile, homeFor } from '@/lib/api';
import { AdminButton } from '@/components/dashboard/AdminButton';
import { AdminNotice } from '@/components/dashboard/AdminNotice';
import { adminLoadingClassName } from '@/components/dashboard/dashboardChrome';
import { AuthCard } from '@/components/auth/AuthCard';
import { MINIMUM_PASSWORD_LENGTH, PasswordField } from '@/components/auth/PasswordFields';

/**
 * Change your own password, and the gate for an account that has to.
 *
 * The current password is required by the API, not as a formality: without it a
 * stolen session could set a new password, end every session, and leave the
 * owner with nothing to sign back in with.
 *
 * `homeFor` sends anyone with `must_change_password` here, so this page must not
 * use it to leave until the profile has been re-read — otherwise it would route
 * itself straight back.
 */
export default function ChangePasswordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/login?next=/change-password');
  }, [loading, router, user]);

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
      await changePassword(String(data.get('current_password')), password);
      // The API re-issued this session's cookies and ended every other one. The
      // profile is re-read because the must-change marker has just cleared, and
      // the page routes on it.
      router.replace(homeFor(await getProfile()));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'That password could not be saved.');
      setSubmitting(false);
    }
  }

  if (loading || !user) return <div className={adminLoadingClassName}>Loading…</div>;

  return (
    <AuthCard
      kicker={user.must_change_password ? 'Set a password' : 'Change password'}
      heading={user.must_change_password ? 'Choose your own password' : 'Change your password'}
      intro={
        user.must_change_password
          ? `This password was set for you, so it has to be replaced before you go any further. At least ${MINIMUM_PASSWORD_LENGTH} characters.`
          : `At least ${MINIMUM_PASSWORD_LENGTH} characters. Your other sessions will be signed out.`
      }
    >
      <form className="flex flex-col gap-m" onSubmit={submit}>
        <PasswordField
          name="current_password"
          label="Current password"
          autoComplete="current-password"
        />
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
          <AdminNotice tone="danger" size="field">
            {error}
          </AdminNotice>
        )}
        <AdminButton type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Change password'}
        </AdminButton>
      </form>
    </AuthCard>
  );
}

'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { homeFor } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import { adminLoadingClassName } from '@/components/dashboard/dashboardChrome';
import { AuthCard } from '@/components/auth/AuthCard';
import { MINIMUM_PASSWORD_LENGTH, PasswordField } from '@/components/auth/PasswordFields';
import { submitChangePassword, type ChangePasswordState } from './ChangePassword.actions';

const initialState: ChangePasswordState = { status: 'idle' };

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
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [state, formAction] = useActionState(submitChangePassword, initialState);

  useEffect(() => {
    if (!loading && !user) router.replace('/login?next=/change-password');
  }, [loading, router, user]);

  useEffect(() => {
    if (state.status !== 'success') return;
    // The profile is re-read before leaving because the must-change marker has
    // just cleared and `homeFor` routes on it -- routing on the stale one would
    // send this page straight back to itself.
    refresh().then((principal) => {
      if (principal) router.replace(homeFor(principal));
    });
  }, [refresh, router, state.status]);

  if (loading || !user) return <div className={adminLoadingClassName}>Loading…</div>;

  return (
    <AuthCard
      kicker={user.must_change_password ? 'Set a password' : 'Change password'}
      heading={user.must_change_password ? 'Choose your own password' : 'Change your password'}
      intro={
        user.must_change_password
          ? `Your account has a temporary password, which has to be replaced before you go any further. Enter it as your current password (it's in the email or message you were sent), then choose your own: at least ${MINIMUM_PASSWORD_LENGTH} characters.`
          : `At least ${MINIMUM_PASSWORD_LENGTH} characters. Your other sessions will be signed out.`
      }
    >
      <form className="flex flex-col gap-m" action={formAction}>
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
      {pending ? 'Saving…' : 'Change password'}
    </Button>
  );
}

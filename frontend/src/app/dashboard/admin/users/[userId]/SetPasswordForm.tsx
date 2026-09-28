'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { MINIMUM_PASSWORD_LENGTH } from '@/components/auth/PasswordFields';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import {
  adminFormClassName,
  adminFormControlClassName,
  adminFormLabelClassName,
} from '@/components/ui/formControl';
import { submitSetPassword, type SetPasswordState } from './SetPasswordForm.actions';

const initialState: SetPasswordState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending ? 'Setting…' : 'Set password'}
    </Button>
  );
}

/**
 * The old password is never shown — only its hash is stored, and the API has
 * no field for it. This only ever writes.
 */
export default function SetPasswordForm({ accountId }: { accountId: number }) {
  const [state, formAction] = useActionState(submitSetPassword, initialState);

  return (
    <form action={formAction} className={adminFormClassName}>
      <input type="hidden" name="id" value={accountId} />
      <label className={adminFormLabelClassName}>
        New password
        <input
          className={adminFormControlClassName}
          name="new_password"
          type="password"
          autoComplete="new-password"
          minLength={MINIMUM_PASSWORD_LENGTH}
          required
        />
      </label>
      <label className={adminFormLabelClassName}>
        Type it again
        <input
          className={adminFormControlClassName}
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
        />
      </label>
      <p className="m-0 text-label text-text-subtle">
        At least {MINIMUM_PASSWORD_LENGTH} characters. It becomes their password — they are not
        asked to change it — every device they are signed in on is signed out, and they are emailed
        that staff changed it.
      </p>
      {state.status === 'error' && (
        <Notice tone="danger" size="field">
          {state.message}
        </Notice>
      )}
      {state.status === 'success' && (
        <Notice tone="success" size="field">
          {state.message ?? 'Password set.'}
        </Notice>
      )}
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}

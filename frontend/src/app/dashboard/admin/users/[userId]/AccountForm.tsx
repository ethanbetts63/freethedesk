'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import {
  adminFormClassName,
  adminFormControlClassName,
  adminFormLabelClassName,
} from '@/components/ui/formControl';
import type { StaffAccountDetail } from '@/types/StaffAccount';
import { submitAccount, type AccountFormState } from './AccountForm.actions';

const initialState: AccountFormState = { status: 'idle' };

function Flag({
  name,
  label,
  hint,
  checked,
}: {
  name: 'is_active' | 'is_staff';
  label: string;
  hint: string;
  checked: boolean;
}) {
  return (
    <label className="flex items-start gap-s">
      {/* Unchecked boxes submit nothing; this is what an unticked one sends. */}
      <input type="hidden" name={name} value="false" />
      <input type="checkbox" name={name} value="true" defaultChecked={checked} className="mt-2xs" />
      <span>
        <span className="block text-label font-heavy">{label}</span>
        <span className="block text-label text-text-subtle">{hint}</span>
      </span>
    </label>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save account'}
    </Button>
  );
}

export default function AccountForm({
  account,
  onSaved,
}: {
  account: StaffAccountDetail;
  onSaved: (account: StaffAccountDetail) => void;
}) {
  const [state, formAction] = useActionState(submitAccount, initialState);

  useEffect(() => {
    if (state.status === 'success' && state.account) onSaved(state.account);
  }, [state, onSaved]);

  const text = (name: 'first_name' | 'last_name' | 'email' | 'username', label: string) => (
    <label className={adminFormLabelClassName}>
      {label}
      <input
        className={adminFormControlClassName}
        name={name}
        type={name === 'email' ? 'email' : 'text'}
        defaultValue={account[name]}
        required={name === 'username'}
      />
    </label>
  );

  return (
    <form action={formAction} className={adminFormClassName}>
      <input type="hidden" name="id" value={account.id} />
      <input type="hidden" name="original_username" value={account.username} />
      {text('first_name', 'First name')}
      {text('last_name', 'Last name')}
      {text('email', 'Email')}
      {text('username', 'Username')}
      {account.username.toLowerCase() === account.email.toLowerCase() && (
        <p className="m-0 text-label text-text-subtle">
          The username follows the email unless you change it.
        </p>
      )}

      {account.is_self ? (
        <p className="m-0 text-label text-text-subtle">
          This is your own account, so its staff access and active status are not changeable here.
        </p>
      ) : (
        <>
          <Flag
            name="is_active"
            label="Active"
            hint="A deactivated account cannot sign in, and every session it has is ended."
            checked={account.is_active}
          />
          <Flag
            name="is_staff"
            label="Staff"
            hint="Staff can open this dashboard and everything in it."
            checked={account.is_staff}
          />
        </>
      )}

      {state.status === 'error' && (
        <Notice tone="danger" size="field">
          {state.error}
        </Notice>
      )}
      {state.status === 'success' && (
        <Notice tone="success" size="field">
          Account saved.
        </Notice>
      )}
      <div>
        <SaveButton />
      </div>
    </form>
  );
}

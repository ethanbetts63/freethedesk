'use client';

import { cn } from '@/lib/utils';
import { formControlClassName } from '@/components/ui/formControl';
import { authFieldLabelClassName } from './AuthCard';

/**
 * One password input, styled once.
 *
 * `autoComplete` is a required prop rather than a default: a password manager
 * behaves quite differently for `current-password`, `new-password` and
 * `username`, and getting it wrong is the difference between a manager offering
 * to save the new password and silently refilling the old one.
 */
export function PasswordField({
  name,
  label,
  autoComplete,
  minLength,
}: {
  name: string;
  label: string;
  autoComplete: 'current-password' | 'new-password';
  minLength?: number;
}) {
  return (
    <label className={authFieldLabelClassName}>
      {label}
      <input
        className={cn(formControlClassName, 'mt-2xs block bg-surface-tint p-s')}
        name={name}
        type="password"
        autoComplete={autoComplete}
        minLength={minLength}
        required
      />
    </label>
  );
}

/**
 * The minimum the API enforces. Stated here so the field rejects a short
 * password before a round trip; the server is still what decides, because a
 * browser check is a convenience and never a control.
 */
export const MINIMUM_PASSWORD_LENGTH = 12;

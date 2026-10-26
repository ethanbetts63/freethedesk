'use client';

import { cn } from '@/lib/utils';
import { formControlClassName } from '@/components/ui/formControl';
import { authFieldLabelClassName } from './AuthCard';
import { PasswordInput } from './PasswordInput';

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
      <PasswordInput
        wrapperClassName="mt-2xs"
        className={cn(formControlClassName, 'block bg-surface-tint p-s')}
        name={name}
        autoComplete={autoComplete}
        minLength={minLength}
        required
      />
    </label>
  );
}

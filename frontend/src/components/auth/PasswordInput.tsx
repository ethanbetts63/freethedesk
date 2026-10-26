'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes } from 'react';

import { focusRingClassName } from '@/lib/controlState';
import { cn } from '@/lib/utils';

/**
 * A password input with a button at its end that shows what has been typed.
 * Dots are no help with a twelve-character minimum on a phone keyboard. The
 * button toggles the input's type; nothing else about the field changes, so
 * password managers see the same control.
 */
export function PasswordInput({
  className,
  wrapperClassName,
  ...input
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /** Classes for the box around the input and button: the field's margins go here. */
  wrapperClassName?: string;
}) {
  const [shown, setShown] = useState(false);
  return (
    <span className={cn('relative block', wrapperClassName)}>
      <input
        {...input}
        type={shown ? 'text' : 'password'}
        // eslint-disable-next-line no-restricted-syntax -- --tap-min is a named token: room for the button
        className={cn(className, 'pr-[var(--tap-min)]')}
      />
      <button
        type="button"
        onClick={() => setShown((value) => !value)}
        aria-label={shown ? 'Hide password' : 'Show password'}
        aria-pressed={shown}
        className={cn(
          'absolute inset-y-0 right-0 flex w-[var(--tap-min)] cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-text-muted hover:text-text-primary',
          focusRingClassName,
        )}
      >
        {shown ? (
          <EyeOff className="size-[18px]" aria-hidden="true" />
        ) : (
          <Eye className="size-[18px]" aria-hidden="true" />
        )}
      </button>
    </span>
  );
}

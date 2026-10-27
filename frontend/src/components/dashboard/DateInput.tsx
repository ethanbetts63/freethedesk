'use client';

import { CalendarDays } from 'lucide-react';
import { useRef, type ComponentPropsWithRef, type ReactNode, type Ref } from 'react';

import { adminFormControlClassName, adminFormLabelClassName } from '@/components/ui/formControl';
import { focusRingClassName } from '@/lib/controlState';
import { dateInputValue, formatDayMonthYear } from '@/lib/formatting';
import { cn } from '@/lib/utils';

/**
 * A dashboard date: typed as DD/MM/YYYY, or picked from the browser's calendar.
 *
 * The visible control stays a text input, so the field reads and validates the same whether the
 * date was typed or picked, and a Track A form registers it like any other input. The calendar
 * button opens a native date picker (`showPicker()`) on an invisible `<input type="date">` laid
 * over the button, so the popup anchors there. Picking fires `onPick` with the DD/MM/YYYY string;
 * the caller writes it back however it holds the value.
 */
export function DateInput({
  label,
  error,
  onPick,
  className,
  ref,
  ...input
}: {
  label: ReactNode;
  error?: ReactNode;
  /** Receives the chosen date as DD/MM/YYYY. */
  onPick: (value: string) => void;
  className?: string;
} & Omit<ComponentPropsWithRef<'input'>, 'className' | 'type'>) {
  const textRef = useRef<HTMLInputElement | null>(null);
  const pickerRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => {
    const picker = pickerRef.current;
    if (!picker) return;
    // Open on the typed date when there is one, so the calendar starts where the user is.
    const typed = dateInputValue(textRef.current?.value.trim() ?? '');
    picker.value = /^\d{4}-\d{2}-\d{2}$/.test(typed) ? typed : '';
    if (typeof picker.showPicker === 'function') {
      try {
        picker.showPicker();
        return;
      } catch {
        // Falls through to focusing the control, which older browsers open on their own.
      }
    }
    picker.focus();
    picker.click();
  };

  return (
    <label className={cn(adminFormLabelClassName, className)}>
      {label}
      <span className="relative block">
        <input
          {...input}
          ref={mergeRefs(textRef, ref)}
          type="text"
          inputMode="numeric"
          placeholder="DD/MM/YYYY"
          className={cn(adminFormControlClassName, 'pr-xl')}
        />
        <button
          type="button"
          aria-label="Choose a date"
          onClick={openPicker}
          className={cn(
            focusRingClassName,
            'absolute top-2xs right-0 bottom-0 flex w-xl cursor-pointer items-center justify-center',
            'rounded-xs border-0 bg-transparent text-text-muted hover:text-text-primary',
          )}
        >
          <CalendarDays aria-hidden size={18} />
        </button>
        <input
          ref={pickerRef}
          type="date"
          tabIndex={-1}
          aria-hidden
          className="pointer-events-none absolute top-2xs right-0 bottom-0 w-xl opacity-0"
          onChange={(event) => {
            if (event.target.value) onPick(formatDayMonthYear(event.target.value));
          }}
        />
      </span>
      {error && (
        <span className="mt-3xs block text-label font-normal text-text-danger">{error}</span>
      )}
    </label>
  );
}

/** Today as DD/MM/YYYY, in the browser's own calendar day. */
export function todayDayMonthYear(): string {
  const now = new Date();
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
}

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    });
  };
}

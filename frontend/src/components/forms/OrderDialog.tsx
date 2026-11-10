'use client';

import { X } from 'lucide-react';
import { type FormEventHandler, type ReactNode, type RefObject, useId } from 'react';

import {
  choiceCardVariants,
  choiceInputClassName,
  fieldInputClassName,
  fieldLabelClassName,
  fieldLabelSpanClassName,
  formErrorClassName,
  submitClassName,
} from '@/components/forms/selectionFormClassNames';
import { MovingColourButton } from '@/components/MovingColourButton';
import { focusRingClassName } from '@/lib/controlState';
import { cn } from '@/lib/utils';

export interface OrderChoice<Code extends string> {
  code: Code;
  label: string;
  /** Under the label, smaller: the price. */
  detail: string;
}

/**
 * The order form, in a modal the package cards open (owner, 2026-11-07, for the SEO audits;
 * 2026-11-10, for every package): a buyer picks first and gives their details second, so the
 * fields are not on the page beside a choice not yet made. The chosen item is the title, and with
 * more than one it can be changed under it without closing. A centred box from `sm`; on a phone, a
 * sheet from the foot of the screen.
 *
 * Presentational: the fields, schema and action belong to the dialog that renders this.
 */
export function OrderDialog<Code extends string>({
  dialogRef,
  heading,
  choices,
  onSubmit,
  children,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  /** What is being bought, with its price: the dialog's title. */
  heading: ReactNode;
  /** The cards' choice again, as chips; left out when there is only one thing to buy. */
  choices?: {
    legend: string;
    name: string;
    options: readonly OrderChoice<Code>[];
    selectedCode: Code;
    onChoose: (code: Code) => void;
  };
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
}) {
  const titleId = useId();
  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      // A tap on the backdrop reaches the dialog itself; one inside lands on a child.
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
      className={cn(
        'w-full border-0 bg-transparent p-0 text-inherit',
        // The sheet, over the browser's centred box: full width, from the foot of the screen.
        'max-sm:m-0 max-sm:max-h-[92dvh] max-sm:max-w-none max-sm:overflow-y-auto max-sm:[inset:auto_0_0_0]',
        // Preflight zeroes every margin, the dialog's centring `margin: auto` with it.
        'sm:m-auto sm:max-h-[92dvh] sm:max-w-measure-tight sm:overflow-y-auto',
        'backdrop:bg-[color-mix(in_srgb,var(--surface-dark)_60%,transparent)]',
      )}
    >
      <form
        className="relative flex flex-col bg-surface-page px-ml py-xl sm:p-2xl"
        onSubmit={onSubmit}
      >
        <header className="mb-l pr-xl">
          <p className="m-0 mb-2xs text-label font-black tracking-label-wide text-action-primary uppercase">
            Your details
          </p>
          {/* The dialog's name, not a heading of the page it opens over. */}
          <p
            id={titleId}
            className="m-0 text-title-sm leading-tight tracking-[-0.04em] text-text-primary"
          >
            {heading}
          </p>
        </header>

        {choices && (
          <fieldset
            className={cn(
              'm-0 mb-l grid gap-xs border-0 p-0',
              choices.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2',
            )}
          >
            <legend className="mb-xs block text-body font-control text-text-control">
              {choices.legend}
            </legend>
            {choices.options.map((option) => {
              const isSelected = option.code === choices.selectedCode;
              return (
                <label key={option.code} className={choiceCardVariants({ selected: isSelected })}>
                  <input
                    className={choiceInputClassName}
                    type="radio"
                    name={choices.name}
                    value={option.code}
                    checked={isSelected}
                    onChange={() => choices.onChoose(option.code)}
                  />
                  {option.label}
                  <small>{option.detail}</small>
                </label>
              );
            })}
          </fieldset>
        )}

        {children}

        {/* Last in the DOM so the dialog opens with the first field focused, not this. */}
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className={cn(
            'absolute top-s right-s flex size-[var(--tap-min)] cursor-pointer items-center justify-center border-0 bg-transparent text-text-muted hover:text-text-primary',
            focusRingClassName,
          )}
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </form>
    </dialog>
  );
}

/** Every order's first two fields. The dialog opens on the email, not on the chips above it. */
export function OrderContactFields() {
  return (
    <>
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>Email</span>
        <input
          className={fieldInputClassName}
          name="email"
          type="email"
          placeholder="e.g. email@example.com"
          autoComplete="email"
          autoFocus
          required
        />
      </label>
      <label className={fieldLabelClassName}>
        <span className={fieldLabelSpanClassName}>Phone (optional)</span>
        <input
          className={fieldInputClassName}
          name="phone"
          type="tel"
          placeholder="e.g. 0400 000 000"
          autoComplete="tel"
        />
      </label>
    </>
  );
}

/** The order's foot: what went wrong, if anything, over the button that goes to payment. */
export function OrderSubmit({
  error,
  disabled,
  children,
}: {
  error?: ReactNode;
  disabled: boolean;
  /** The button's words: "Continue to payment", "Buy now · $1,500 today". */
  children: ReactNode;
}) {
  return (
    <>
      {error && (
        <p className={formErrorClassName} role="alert">
          {error}
        </p>
      )}
      <MovingColourButton
        type="submit"
        className={submitClassName}
        direction="right"
        size="large"
        fullWidth
        disabled={disabled}
      >
        {children}
      </MovingColourButton>
    </>
  );
}

'use client';

import { X } from 'lucide-react';
import { useRef, type FormEventHandler, type ReactNode } from 'react';

import { MovingColourButton } from '@/components/MovingColourButton';
import { focusRingClassName } from '@/lib/controlState';
import { cn } from '@/lib/utils';
import { chooserClassName, formClassName as sharedFormClassName } from './selectionFormClassNames';
import { selectionPanelClassName } from './selectionFormClassNames';

/**
 * The chooser beside the form from `lg` up. Below it, the chooser has the panel to itself and
 * the form is a sheet that a button opens: on a phone the fields took a screen and a half under
 * the choices, and the choice was out of sight by the time the fields were.
 *
 * One `<form>` either way. Below `lg` its `<dialog>` is a modal sheet; from `lg` the dialog is
 * `display: contents`, so the form is the grid's second column and the dialog is never shown.
 */
export function SelectionFormPanel({
  chooser,
  children,
  onSubmit,
  chooserClassName: chooserClassNameProp,
  formClassName: formClassNameProp,
  openLabel = 'Continue',
}: {
  chooser: ReactNode;
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  chooserClassName?: string;
  formClassName?: string;
  /** The button under the chooser on a phone, which opens the form. */
  openLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = () => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  };
  const close = () => dialogRef.current?.close();

  return (
    <div
      data-selection-panel=""
      className={cn(
        selectionPanelClassName,
        // A negative page gutter, derived from --gutter itself: the panel bleeds to
        // the screen edge below sm.
        // eslint-disable-next-line no-restricted-syntax -- token read, not a literal
        'mx-[calc(var(--gutter)*-1)] [--selection-input-font-size:1rem] [--selection-panel-min-height:560px] [--selection-total-size:2.4rem] sm:mx-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]',
      )}
    >
      <aside className={cn(chooserClassName, chooserClassNameProp)}>
        {chooser}
        <div className="mt-xl lg:hidden">
          <MovingColourButton type="button" onClick={open} direction="right" size="large" fullWidth>
            {openLabel}
          </MovingColourButton>
        </div>
      </aside>
      <dialog
        ref={dialogRef}
        aria-label="Your details"
        // A tap on the backdrop reaches the dialog itself; one inside lands on a child.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className={cn(
          // The sheet, over the browser's centred box: full width, from the foot of the screen.
          'm-0 w-full max-w-none border-0 bg-transparent p-0 text-inherit',
          'max-lg:fixed max-lg:inset-x-0 max-lg:top-auto max-lg:bottom-0 max-lg:max-h-[92dvh] max-lg:overflow-y-auto',
          'backdrop:bg-[color-mix(in_srgb,var(--surface-dark)_60%,transparent)]',
          'lg:contents',
        )}
      >
        <form
          className={cn(
            sharedFormClassName,
            'relative lg:border-t-0 lg:border-l lg:border-l-border-subtle',
            formClassNameProp,
          )}
          onSubmit={onSubmit}
        >
          {children}
          {/* Last in the DOM so the sheet opens with the first field focused, not this. */}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className={cn(
              'absolute top-s right-s flex size-[var(--tap-min)] cursor-pointer items-center justify-center border-0 bg-transparent text-text-muted hover:text-text-primary lg:hidden',
              focusRingClassName,
            )}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </form>
      </dialog>
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { focusRowClassName } from '@/lib/controlState';
import { cn } from '@/lib/utils';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * The shell every timed prompt opens in: a backdrop, a dark card, a close
 * button, focus trapped inside and the page scroll locked. Mounted only while
 * open, so the effect that locks the page and listens for Escape runs for
 * exactly that window.
 */
export function PromptDialog({
  onClose,
  labelledBy,
  className,
  children,
}: {
  onClose: () => void;
  labelledBy: string;
  /** Extra classes on the backdrop, e.g. a breakpoint the prompt is limited to. */
  className?: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      ).filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      // The backdrop insets its dialog by the page gutter.
      className={cn(
        // eslint-disable-next-line no-restricted-syntax -- p-[var(--gutter)] is a token read
        'fixed inset-0 z-[1000] grid items-center justify-items-center bg-[color-mix(in_srgb,var(--surface-navy)_72%,transparent)] p-[var(--gutter)]',
        className,
      )}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        className="relative max-h-[calc(100dvh-(var(--gutter)*2))] w-[min(100%,440px)] overflow-auto shadow-contrast-l"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        <button
          ref={closeRef}
          className={cn(
            'absolute top-[8px] right-[10px] z-1 flex h-[var(--tap-min)] w-[var(--tap-min)] cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-title text-text-on-dark-muted hover:text-text-on-dark',
            focusRowClassName,
          )}
          type="button"
          onClick={onClose}
        >
          <span aria-hidden="true">×</span>
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

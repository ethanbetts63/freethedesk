'use client';

/* Component registry: freetheplatform/frontend/registry/src/hooks/useDisclosure.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The four dismissals a nav disclosure needs: outside `mousedown`, outside `touchstart`, Escape, and link click.
 * `touchstart` is needed because iOS does not reliably fire `mousedown` for a tap on a non-interactive region.
 * `closeOnNavigate` is one delegated listener, since client-side navigation would leave the panel open.
 */
export interface DismissOptions {
  closeOnNavigate?: boolean;
}

export function attachDismiss(
  root: HTMLElement | null,
  close: () => void,
  { closeOnNavigate = true }: DismissOptions = {},
): () => void {
  const closeOnOutside = (event: Event) => {
    if (!root?.contains(event.target as Node)) close();
  };
  const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close();
  };
  const closeOnLink = (event: Event) => {
    if ((event.target as HTMLElement | null)?.closest('a')) close();
  };

  document.addEventListener('mousedown', closeOnOutside);
  // Passive: a non-passive document touchstart listener costs scroll performance.
  document.addEventListener('touchstart', closeOnOutside, { passive: true });
  document.addEventListener('keydown', closeOnEscape);
  if (closeOnNavigate) root?.addEventListener('click', closeOnLink);

  return () => {
    document.removeEventListener('mousedown', closeOnOutside);
    document.removeEventListener('touchstart', closeOnOutside);
    document.removeEventListener('keydown', closeOnEscape);
    root?.removeEventListener('click', closeOnLink);
  };
}

export interface Disclosure<T extends HTMLElement> {
  open: boolean;
  toggle: () => void;
  close: () => void;
  /** Goes on the element containing both the trigger and the panel. */
  ref: React.RefObject<T | null>;
}

/**
 * React-state disclosure, for a panel whose open state also drives CSS classes.
 * Listeners are attached only while open, so a closed disclosure costs nothing.
 */
export function useDisclosure<T extends HTMLElement = HTMLDivElement>(
  options: DismissOptions = {},
): Disclosure<T> {
  const [open, setOpen] = useState(false);
  const ref = useRef<T>(null);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((value) => !value), []);

  const { closeOnNavigate = true } = options;
  useEffect(() => {
    if (!open) return;
    return attachDismiss(ref.current, () => setOpen(false), { closeOnNavigate });
  }, [open, closeOnNavigate]);

  return { open, toggle, close, ref };
}

/** The same dismissals for a native `<details>` panel, which owns its open state and works without JavaScript. */
export function useDetailsDismiss(options: DismissOptions = {}) {
  const anchor = useRef<HTMLSpanElement>(null);

  const { closeOnNavigate = true } = options;
  useEffect(() => {
    const panel = anchor.current?.closest('details');
    if (!panel) return;

    let detach: (() => void) | undefined;
    const sync = () => {
      detach?.();
      detach = panel.open
        ? attachDismiss(panel, () => (panel.open = false), { closeOnNavigate })
        : undefined;
    };

    sync();
    panel.addEventListener('toggle', sync);
    return () => {
      panel.removeEventListener('toggle', sync);
      detach?.();
    };
  }, [closeOnNavigate]);

  return anchor;
}

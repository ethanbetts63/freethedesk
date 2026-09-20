'use client';

/* Component registry: freetheplatform/frontend/registry/src/hooks/useDisclosure.ts
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The four dismissals a nav disclosure needs, in one place. Four partial
 * implementations across the three sites each omitted a different one.
 *
 * `touchstart` alongside `mousedown` is the one worth keeping: iOS does not
 * reliably fire `mousedown` for a tap on a non-interactive region, so a
 * mousedown-only outside handler leaves the panel open when a finger taps the
 * page behind it. Both fire for a real desktop click, and closing twice is a
 * no-op.
 *
 * `closeOnNavigate` exists because Next navigates client side: without it a
 * panel stays open over the page the link just went to. One delegated listener
 * on the root rather than an `onClick` per link.
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
  // Passive: this never calls preventDefault, and a non-passive touchstart
  // listener on document costs scroll performance on every touch.
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

/**
 * The same dismissals for a native `<details>` panel, which owns its own open
 * state. Nothing here renders: the panel is server markup that already works
 * with JavaScript off, and this only adds the closing behaviours the element
 * has no opinion about.
 */
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

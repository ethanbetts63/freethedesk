'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Opens a prompt once per session, `delayMs` after the visitor first arrived.
 *
 * The start time is kept in sessionStorage under `${storageKey}-started`, so
 * navigating between pages does not restart the clock; `${storageKey}-shown`
 * stops it opening twice. With `mediaQuery` the prompt only ever opens while
 * the query matches, and closes if the viewport stops matching.
 *
 * It never opens over a form: while any form is on screen, or a field has
 * focus, the prompt waits and opens once the visitor has scrolled on. A prompt
 * that lands while someone is typing their email is the moment they stop.
 */
export function useTimedPrompt({
  storageKey,
  delayMs,
  mediaQuery,
}: {
  storageKey: string;
  delayMs: number;
  mediaQuery?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const startedKey = `${storageKey}-started`;
    const shownKey = `${storageKey}-shown`;
    const media = mediaQuery ? window.matchMedia(mediaQuery) : null;
    const allowed = () => media?.matches ?? true;
    let timer = 0;
    let waiting = false;

    const overForm = () => {
      const active = document.activeElement;
      if (active instanceof HTMLElement && active.closest('form')) return true;
      return Array.from(document.querySelectorAll('form')).some((form) => {
        const rect = form.getBoundingClientRect();
        return rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
      });
    };

    const show = () => {
      sessionStorage.setItem(shownKey, 'true');
      setOpen(true);
    };

    // Focus has not settled when focusout fires, so the check waits a tick.
    const recheck = () => window.setTimeout(check, 0);
    const stopWaiting = () => {
      if (!waiting) return;
      waiting = false;
      window.removeEventListener('scroll', recheck);
      document.removeEventListener('focusout', recheck);
    };
    function check() {
      if (!allowed() || overForm()) return;
      stopWaiting();
      show();
    }
    const waitForFormToLeave = () => {
      waiting = true;
      window.addEventListener('scroll', recheck, { passive: true });
      document.addEventListener('focusout', recheck);
    };

    const schedule = () => {
      window.clearTimeout(timer);
      stopWaiting();
      if (!allowed()) {
        setOpen(false);
        return;
      }
      if (sessionStorage.getItem(shownKey)) return;

      const storedStart = Number(sessionStorage.getItem(startedKey));
      const startedAt = Number.isFinite(storedStart) && storedStart > 0 ? storedStart : Date.now();
      sessionStorage.setItem(startedKey, String(startedAt));

      timer = window.setTimeout(
        () => {
          if (!allowed()) return;
          if (overForm()) {
            waitForFormToLeave();
            return;
          }
          show();
        },
        Math.max(0, delayMs - (Date.now() - startedAt)),
      );
    };

    schedule();
    media?.addEventListener('change', schedule);

    return () => {
      window.clearTimeout(timer);
      stopWaiting();
      media?.removeEventListener('change', schedule);
    };
  }, [storageKey, delayMs, mediaQuery]);

  return { open, close };
}

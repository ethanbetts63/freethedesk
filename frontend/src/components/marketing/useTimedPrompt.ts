'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Opens a prompt once per session, `delayMs` after the visitor first arrived.
 *
 * The start time is kept in sessionStorage under `${storageKey}-started`, so
 * navigating between pages does not restart the clock; `${storageKey}-shown`
 * stops it opening twice. With `mediaQuery` the prompt only ever opens while
 * the query matches, and closes if the viewport stops matching.
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

    const schedule = () => {
      window.clearTimeout(timer);
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
          sessionStorage.setItem(shownKey, 'true');
          setOpen(true);
        },
        Math.max(0, delayMs - (Date.now() - startedAt)),
      );
    };

    schedule();
    media?.addEventListener('change', schedule);

    return () => {
      window.clearTimeout(timer);
      media?.removeEventListener('change', schedule);
    };
  }, [storageKey, delayMs, mediaQuery]);

  return { open, close };
}

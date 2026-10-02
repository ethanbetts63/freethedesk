'use client';

import dynamic from 'next/dynamic';

import { useTimedPrompt } from './useTimedPrompt';

/* The prompt only ever opens on a narrow viewport, a minute in. Fetching it on
   demand keeps the dialog, the banner and its form out of the initial download
   on every page - and off desktop entirely, where the timer never fires. */
const AiReadinessDialog = dynamic(
  () => import('./AiReadinessDialog').then((m) => m.AiReadinessDialog),
  {
    ssr: false,
  },
);

export function AiReadinessModal() {
  const { open, close } = useTimedPrompt({
    storageKey: 'freethedesk-ai-readiness',
    delayMs: 60_000,
    mediaQuery: '(max-width: 639px)',
  });

  return open ? <AiReadinessDialog onClose={close} /> : null;
}

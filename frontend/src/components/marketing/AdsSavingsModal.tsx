'use client';

import dynamic from 'next/dynamic';

import { useTimedPrompt } from './useTimedPrompt';

/* Fetched only when the timer fires, so the calculator stays out of the SEO
   page's initial download. */
const AdsSavingsDialog = dynamic(
  () => import('./AdsSavingsDialog').then((m) => m.AdsSavingsDialog),
  { ssr: false },
);

/**
 * The SEO page's one-minute prompt, on every viewport. SiteChrome leaves the
 * AI readiness prompt off this page so the two never compete for the same
 * minute.
 */
export function AdsSavingsModal() {
  const { open, close } = useTimedPrompt({
    storageKey: 'freethedesk-click-value',
    delayMs: 60_000,
  });

  return open ? <AdsSavingsDialog onClose={close} /> : null;
}

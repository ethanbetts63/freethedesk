'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';

/**
 * An address to paste into someone else's admin screen, with a copy button.
 * The service account is long and easy to mistype, and a typo looks exactly
 * like success on Google's side.
 */
export function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refused (permissions, insecure origin): the address is still
      // on screen to select by hand.
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-s">
      <code className="rounded-xs border border-border-default bg-surface-tint px-s py-2xs text-body-sm break-all">
        {address}
      </code>
      <Button variant="quiet" type="button" onClick={copy}>
        {copied ? 'Copied' : 'Copy'}
      </Button>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Address copied' : ''}
      </span>
    </div>
  );
}

'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';

/**
 * A value to paste somewhere else (the code, the link, a paragraph for the show notes) with a
 * copy button. The same shape as the SEO setup page's CopyAddress; `block` sets a paragraph in
 * ordinary type rather than as code.
 */
export function CopyValue({
  value,
  label = 'Copy',
  block = false,
}: {
  value: string;
  label?: string;
  block?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refused (permissions, insecure origin): the value is still
      // on screen to select by hand.
    }
  };

  if (block)
    return (
      <div className="flex flex-col gap-s">
        <p className="m-0 rounded-xs border border-border-default bg-surface-tint px-m py-s text-body leading-[1.65] whitespace-pre-wrap">
          {value}
        </p>
        <div>
          <Button variant="quiet" type="button" onClick={copy}>
            {copied ? 'Copied' : label}
          </Button>
        </div>
        <span className="sr-only" aria-live="polite">
          {copied ? 'Copied' : ''}
        </span>
      </div>
    );

  return (
    <div className="flex flex-wrap items-center gap-s">
      <code className="rounded-xs border border-border-default bg-surface-tint px-s py-2xs text-body-sm break-all">
        {value}
      </code>
      <Button variant="quiet" type="button" onClick={copy}>
        {copied ? 'Copied' : label}
      </Button>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied' : ''}
      </span>
    </div>
  );
}

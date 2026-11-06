'use client';

import { useRef } from 'react';

import { MovingColourButton } from '@/components/MovingColourButton';
import { onDarkFieldClassName } from '@/components/marketing/AiReadinessForm';
import { trackEvent } from '@/lib/analytics';

/** PageSpeed's analysis page runs the test on the address in `url`. */
const PAGESPEED_ANALYSIS = 'https://pagespeed.web.dev/analysis';

/** A bare host becomes an https address: PageSpeed rejects one without a scheme. */
export function withScheme(site: string): string {
  const trimmed = site.trim();
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * The visitor's own site into Google's PageSpeed Insights, in a new tab. A
 * plain GET form, so it works without script; the script only completes a
 * host the visitor typed without its scheme, and counts the click.
 */
export function SpeedCheckForm() {
  const input = useRef<HTMLInputElement>(null);

  return (
    <form
      className="grid min-w-0 grid-cols-[minmax(0,1fr)] items-center gap-xs sm:grid-cols-[minmax(200px,1fr)_auto]"
      action={PAGESPEED_ANALYSIS}
      method="get"
      target="_blank"
      rel="noopener"
      onSubmit={() => {
        if (input.current) input.current.value = withScheme(input.current.value);
        trackEvent('pagespeed_check');
      }}
    >
      <label className="block min-w-0">
        <span className="sr-only">Your website</span>
        {/* Not type="url": it rejects a scheme-less host before withScheme adds one. */}
        <input
          ref={input}
          className={onDarkFieldClassName}
          name="url"
          type="text"
          inputMode="url"
          placeholder="e.g. www.yoursite.com.au"
          autoComplete="url"
          required
        />
      </label>
      <MovingColourButton
        type="submit"
        className="justify-center whitespace-nowrap sm:justify-start"
        direction="right"
        size="compact"
      >
        Check my site
      </MovingColourButton>
      <p className="col-[1/-1] m-0 text-caption text-[color-mix(in_srgb,var(--surface-page)_62%,transparent)]">
        Opens Google&apos;s PageSpeed Insights in a new tab. Nothing is sent to us.
      </p>
    </form>
  );
}

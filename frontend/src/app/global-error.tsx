'use client';

import { Button } from '@/components/ui/Button';

import './globals.css';

/**
 * The last resort: an error thrown by the root layout itself, which the
 * per-route `error.tsx` cannot catch because it lives inside that layout.
 *
 * It replaces the whole document, so it declares its own <html> and <body> and
 * cannot use the header, the footer, or anything that reads the app's context.
 * Tokens still apply -- globals.css is imported here directly.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell py-24">
          <h1 className="text-title font-semibold text-text-primary">Something went wrong</h1>
          <p className="mt-4 text-body text-text-secondary">
            The site failed to load. Trying again often works.
          </p>
          <Button className="mt-8" onClick={reset}>
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}

'use client';

import { Button } from '@/components/ui/Button';

/**
 * The route-level error boundary.
 *
 * Without it, an exception thrown while rendering any server or client
 * component in this tree produced Next's stock "Application error: a
 * client-side exception has occurred" -- no chrome, no wording, and no way back
 * except the browser's back button. `reset()` re-renders the segment, which is
 * the right first thing to try for a failed data fetch.
 *
 * The header and footer survive, because this replaces the page and not the
 * layout. `global-error.tsx` is the one that has to stand alone.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="site-shell py-16 sm:py-24">
      <h1 className="text-title font-semibold text-text-primary">Something went wrong</h1>
      <p className="mt-4 text-body text-text-secondary">
        The page did not load. Trying again often works; if it does not, the problem is at our end
        and we are the ones who need to fix it.
      </p>
      <Button className="mt-8" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}

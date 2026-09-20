'use client';

/* Component registry: freetheplatform/frontend/registry/src/components/analytics/ClarityAnalytics.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

import { shouldRunClarity } from '@/lib/routePolicy';

const CLARITY_SCRIPT_ID = 'clarity-analytics';

type ClarityFunction = {
  (...args: unknown[]): void;
  q?: unknown[][];
};

declare global {
  interface Window {
    clarity?: ClarityFunction;
  }
}

function installClarity(projectId: string) {
  if (window.clarity) {
    window.clarity('start');
    return;
  }

  // Queue calls made before the tag downloads; the real tag drains `q`.
  const clarity: ClarityFunction = (...args: unknown[]) => {
    (clarity.q ??= []).push(args);
  };

  window.clarity = clarity;

  const script = document.createElement('script');
  script.id = CLARITY_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`;
  document.head.appendChild(script);
}

/**
 * Starts session recording on the routes that allow it, and stops it on the
 * ones that do not.
 *
 * `stop` rather than simply not starting: the tag survives client-side
 * navigation, so a visitor who lands on a public page and then opens an order
 * would otherwise carry a live recording into it. `useLayoutEffect` runs before
 * paint, so the stop lands before the excluded screen is on the glass.
 *
 * Section 7 of _docs/security-standard.md; the route list and the reasoning per
 * route stay with each site, in `lib/routePolicy.ts`.
 */
export function ClarityAnalytics({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!shouldRunClarity(pathname)) {
      window.clarity?.('stop');
      return;
    }

    installClarity(projectId);
  }, [pathname, projectId]);

  return null;
}

export default ClarityAnalytics;

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
 * Starts session recording on routes that allow it and stops it on the rest (security-standard.md section 7).
 * It must `stop`, not just skip starting: the tag survives client-side navigation. `useLayoutEffect` stops it before paint.
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

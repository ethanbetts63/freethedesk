'use client';

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

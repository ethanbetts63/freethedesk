'use client';

/* Component registry: freetheplatform/frontend/registry/src/components/analytics/GoogleAnalytics.tsx
   Copied, not imported. Edit the registry and re-sync; a deliberate local
   change here must be marked. See _docs/component-registry.md. */
import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const GA_SCRIPT_ID = 'google-analytics';

type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

function isRouteOrDescendant(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

/** Installs gtag.js once. `send_page_view: false` because the built-in view fires once per load and App Router navigations are not loads; the route effect sends every view. */
function installGtag(measurementId: string) {
  if (window.gtag) return;

  const dataLayer = (window.dataLayer ??= []);

  window.gtag = function gtag() {
    // `arguments`, not a rest array: gtag.js silently drops plain arrays from the queue.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });

  const script = document.createElement('script');
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

function GoogleAnalyticsTracker({
  measurementId,
  excludedRoutes,
}: {
  measurementId: string;
  excludedRoutes: readonly string[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // A string dependency: an inline `excludedRoutes` array is new every render.
  const excluded = excludedRoutes.join('\n');

  /** The last URL reported, so re-renders and strict-mode double effects do not double-count. */
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    const routes = excluded ? excluded.split('\n') : [];
    if (routes.some((route) => isRouteOrDescendant(pathname, route))) return;

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    if (lastSent.current === path) return;
    lastSent.current = path;

    installGtag(measurementId);

    // Absolute `page_location` and relative `page_path`, as gtag sends on a document load; gtag reads the title itself.
    window.gtag?.('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
    });
  }, [pathname, searchParams, measurementId, excluded]);

  return null;
}

/**
 * Google Analytics 4, one page view per client-side navigation.
 *
 * `excludedRoutes` is prefix-based and keeps internal screens (staff portal) out of the numbers. It is not the
 * session-recording list, which is a security decision in `lib/routePolicy.ts`.
 *
 * The Suspense boundary is required: `useSearchParams` would otherwise turn every static page into an empty shell.
 */
export function GoogleAnalytics({
  measurementId,
  excludedRoutes = [],
}: {
  measurementId: string;
  excludedRoutes?: readonly string[];
}) {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsTracker measurementId={measurementId} excludedRoutes={excludedRoutes} />
    </Suspense>
  );
}

export default GoogleAnalytics;

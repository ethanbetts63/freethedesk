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

/**
 * Installs gtag.js once, with automatic page views turned off.
 *
 * `send_page_view: false` is the whole reason this is a component rather than
 * a script tag. gtag's built-in page view fires when the tag loads and never
 * again; in an App Router site the tag loads once and then the visitor moves
 * through a dozen routes without a single document request, so the default
 * setting measures the landing page and nothing after it. The route effect
 * below sends every view instead, including the first.
 */
function installGtag(measurementId: string) {
  if (window.gtag) return;

  const dataLayer = (window.dataLayer ??= []);

  window.gtag = function gtag() {
    // `arguments` itself, not a rest array. gtag.js drains the queue by reading
    // each entry as an `arguments` object; a plain array is silently dropped,
    // which costs the `js` and `config` calls queued before the tag downloads.
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

  // Depended on as a string: a consumer writing `excludedRoutes={['/dashboard']}`
  // inline hands a new array every render, and the array's contents are what
  // the effect actually reads.
  const excluded = excludedRoutes.join('\n');

  /**
   * The last URL reported, so a re-render that does not change the URL does not
   * double-count. React runs effects twice in development's strict mode, and a
   * duplicate page view is not visible in GA until the numbers are wrong.
   */
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    const routes = excluded ? excluded.split('\n') : [];
    if (routes.some((route) => isRouteOrDescendant(pathname, route))) return;

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    if (lastSent.current === path) return;
    lastSent.current = path;

    installGtag(measurementId);

    // `page_location` absolute and `page_path` relative, matching what gtag
    // sends for a real document load. Title is left to gtag, which reads
    // `document.title` as it sends — by this effect the App Router has already
    // committed the new route's metadata.
    window.gtag?.('event', 'page_view', {
      page_path: path,
      page_location: window.location.href,
    });
  }, [pathname, searchParams, measurementId, excluded]);

  return null;
}

/**
 * Google Analytics 4, sending one page view per client-side navigation.
 *
 * `excludedRoutes` is prefix-based and matches descendants. It exists for
 * internal screens — a staff portal is hours of engaged sessions by the three
 * people who are not the audience, and left in it dominates every engagement
 * and retention number on the property. It is not the session-recording
 * exclusion list: GA sends URLs and event names, not a copy of the screen, so
 * checkout and order pages stay measured. Session recording's list is a
 * security decision and lives separately — see `lib/routePolicy.ts`.
 *
 * The Suspense boundary is required, not decorative. `useSearchParams` makes
 * everything above it render on the client; without the boundary that is every
 * page of the site, and a static marketing page would start shipping as an
 * empty shell. It lives here rather than in each layout so that a consumer
 * cannot forget it.
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

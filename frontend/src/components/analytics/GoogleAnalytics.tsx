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
 * Installs gtag.js once. `send_page_view: false` because the built-in view fires once per load and App Router
 * navigations are not loads; the route effect sends every view. `page_location` is given from the
 * first command, so no hit falls back to `document.location` and its query.
 */
function installGtag(measurementId: string, pageLocation: string) {
  if (window.gtag) return;

  const dataLayer = (window.dataLayer ??= []);

  window.gtag = function gtag() {
    // `arguments`, not a rest array: gtag.js silently drops plain arrays from the queue.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false, page_location: pageLocation });

  const script = document.createElement('script');
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

/**
 * The only query parameters GA ever sees. GA4 reads campaign attribution (`utm_*`) and ad-click
 * identifiers (`gclid` and its iOS/web variants, which Google Ads conversions depend on) from
 * `page_location`'s query, so these pass through; everything else is dropped, because a query can
 * carry secrets (`payment_intent_client_secret`) and nothing else here is worth the risk.
 */
const ALLOWED_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'gclid',
  'gbraid',
  'wbraid',
  'dclid',
]);

function allowedQuery(searchParams: URLSearchParams): string {
  const kept = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (ALLOWED_PARAMS.has(key)) kept.append(key, value);
  });
  const query = kept.toString();
  return query ? `?${query}` : '';
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

    // Only allow-listed parameters leave the browser: a query can carry secrets.
    const pageLocation = `${window.location.origin}${pathname}${allowedQuery(new URLSearchParams(searchParams.toString()))}`;
    if (lastSent.current === pageLocation) return;
    lastSent.current = pageLocation;

    installGtag(measurementId, pageLocation);

    // Later hits (enhanced measurement, user_engagement) take the location from `set`, not the address bar.
    window.gtag?.('set', { page_location: pageLocation });
    window.gtag?.('event', 'page_view', {
      page_path: pathname,
      page_location: pageLocation,
    });
  }, [pathname, searchParams, measurementId, excluded]);

  return null;
}

/**
 * Google Analytics 4, one page view per client-side navigation.
 *
 * Only the origin, the path and allow-listed campaign and ad-click parameters are sent (integrations-standard.md section 8). `excludedRoutes` is
 * prefix-based and keeps internal screens (staff portal) and credential or token routes (login, password reset,
 * payment return) out of GA entirely. It is not the session-recording list, which is a security decision in `lib/routePolicy.ts`.
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

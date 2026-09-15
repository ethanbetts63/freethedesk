function isRouteOrDescendant(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

const STANDALONE_CHROME_ROUTES = ["/login", "/licensing/payment"] as const;

const APPLICATION_ROUTES = [
  "/dashboard",
  "/portal",
  "/seo-portal",
  "/seo/payment",
  "/dealership-website-builder",
] as const;

const CLARITY_EXCLUDED_ROUTES = [
  "/dashboard",
  "/portal",
  "/seo-portal",
  "/login",
  "/licensing/payment",
  "/seo/payment",
] as const;

function matchesAnyRoute(pathname: string, routes: readonly string[]) {
  return routes.some((route) => isRouteOrDescendant(pathname, route));
}

export function usesStandaloneChrome(pathname: string) {
  return matchesAnyRoute(pathname, STANDALONE_CHROME_ROUTES);
}

export function isApplicationRoute(pathname: string) {
  return matchesAnyRoute(pathname, APPLICATION_ROUTES);
}

export function shouldRunClarity(pathname: string) {
  return !matchesAnyRoute(pathname, CLARITY_EXCLUDED_ROUTES);
}

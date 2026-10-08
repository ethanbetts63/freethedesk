/**
 * Every signed-in portal, credential page, and payment or customer-order page.
 *
 * The site-specific half of `lib/routePolicy`, which is where the reasoning
 * and the matcher live. `scripts/check-customer-routes.mjs` asserts each of
 * these is still here, so removing one is a build failure rather than a quiet
 * change to what a third party records.
 */
export const CLARITY_EXCLUDED_ROUTES = [
  // The staff and dealer portals.
  '/dashboard',
  '/portal',
  '/seo-portal',
  // A customer-order page, and this one shows a date of birth and a driver's
  // licence number.
  '/sale',
  // Credential and payment pages.
  '/login',
  '/licensing/payment',
  '/seo/payment',
  '/order',
] as const;

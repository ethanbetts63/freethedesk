import type { Plan } from '@/lib/plans';

export type GbpPlanCode = 'gbp_optimisation';

/** What the call-back note and the schema offer call it. */
export const GBP_PRODUCT_NAME = 'Google Business Profile optimisation';

/**
 * The one thing this page sells: the profile filled in and set up, by us, paid once, at the
 * admin's price. The ticks are the work done on freethedesk's own profile on 2026-11-15 and on
 * Scooter Shop's in October 2026, which is the scope the page promises.
 */
export function gbpPlan(price: string): Plan<GbpPlanCode> {
  return {
    code: 'gbp_optimisation',
    name: 'Profile optimisation',
    price,
    cadence: 'paid once',
    summary: 'Your Business Profile, filled in and set up properly by us.',
    features: [
      'Categories, services and prices',
      'Description, attributes, hours and service area',
      'Photos, a first post and replies to your reviews',
      'Booking link and a tracked website link',
      'Name, address and phone matching your website',
    ],
  };
}

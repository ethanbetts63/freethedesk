import type { Plan } from '@/lib/plans';
import { GBP_OPTIMISATION_PRICE, money } from '@/lib/servicePricing';

export type GbpPlanCode = 'gbp_optimisation';

/** What the enquiry calls it, and the schema offer's name. */
export const GBP_PRODUCT_NAME = 'Google Business Profile optimisation';

export const gbpPrice = money(GBP_OPTIMISATION_PRICE);

/**
 * The one thing this page sells: the profile filled in and set up, by us, paid once. The ticks are
 * the work done on freethedesk's own profile on 2026-11-15, which is the scope the page promises.
 */
export const GBP_PLAN: Plan<GbpPlanCode> = {
  code: 'gbp_optimisation',
  name: 'Profile optimisation',
  price: gbpPrice,
  cadence: 'paid once',
  summary: 'Your Business Profile, filled in and set up properly by us.',
  features: [
    'Categories, services and prices',
    'Description, attributes, hours and area',
    'Photos, posts and replies to reviews',
    'Booking link and a tracked website link',
    'Your website and profile agreeing',
  ],
};

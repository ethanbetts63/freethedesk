import { type PublicSiteSettings } from '@/lib/api';
import { planByCode, type Plan } from '@/lib/plans';
import type { SeoPlanCode } from '@/lib/seoApi';
import { formatMoney } from '@/lib/formatting';

export type { SeoPlanCode };
export type SeoPlan = Plan<SeoPlanCode> & {
  /** What checkout calls it: "Quarterly SEO subscription", "SEO audit". */
  productName: string;
};
export { planByCode };

const FEATURES = [
  'Search Console, Profile and analytics',
  '23 foundation checks',
  'Fixes ranked by value',
];
const RECURRING_FEATURES = [...FEATURES, 'Every change measured'];

const price = (value: string) => formatMoney(value, { cents: 'auto' });

/**
 * What a customer can buy. The pace is theirs to pick, by how fast they can
 * act on an audit; each plan has its own price.
 */
export function buildSeoPlans(settings: PublicSiteSettings): SeoPlan[] {
  return [
    {
      code: 'oneoff',
      name: 'One-off SEO Audit',
      productName: 'SEO audit',
      price: price(settings.seo_oneoff_price),
      cadence: 'once, no subscription',
      summary: 'One full round of analysis and ranked recommendations.',
      features: FEATURES,
    },
    {
      code: 'monthly',
      name: 'Monthly Audit Subscription',
      productName: 'Monthly SEO subscription',
      price: price(settings.seo_monthly_price),
      cadence: 'per audit, every month',
      summary:
        'For a business that can make changes within weeks. Each audit measures what last month’s changes earned.',
      features: RECURRING_FEATURES,
    },
    {
      code: 'quarterly',
      name: 'Quarterly Audit Subscription',
      productName: 'Quarterly SEO subscription',
      price: price(settings.seo_quarterly_price),
      cadence: 'per audit, every 3 months',
      summary:
        'For changes that go through an agency or an IT queue: time to act on one audit before the next.',
      features: RECURRING_FEATURES,
    },
    {
      code: 'yearly',
      name: 'Yearly Audit Subscription',
      productName: 'Yearly SEO subscription',
      price: price(settings.seo_yearly_price),
      cadence: 'per audit, every year',
      summary: 'An annual check-up, measuring what the year’s changes earned.',
      features: RECURRING_FEATURES,
    },
  ];
}

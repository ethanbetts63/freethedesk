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
  'Search Console, Business Profile and analytics read together',
  '23 foundation checks, pass, warn or fail',
  'Ranked recommendations with impact and cost',
];
const RECURRING_FEATURES = [...FEATURES, 'Every change tracked as an experiment'];

const price = (value: string) => formatMoney(value, { cents: 'auto' });

/**
 * What a customer can buy. The pace is theirs to pick, by how fast they can
 * act on an audit; each plan has its own price.
 */
export function buildSeoPlans(settings: PublicSiteSettings): SeoPlan[] {
  return [
    {
      code: 'monthly',
      name: 'Monthly audits',
      productName: 'Monthly SEO subscription',
      price: price(settings.seo_monthly_price),
      cadence: 'per audit, every month',
      summary:
        'For a business that can make changes within weeks. Each audit measures what last month’s changes earned.',
      features: RECURRING_FEATURES,
      recommended: true,
    },
    {
      code: 'quarterly',
      name: 'Quarterly audits',
      productName: 'Quarterly SEO subscription',
      price: price(settings.seo_quarterly_price),
      cadence: 'per audit, every 3 months',
      summary:
        'For changes that go through an agency or an IT queue: time to act on one audit before the next.',
      features: RECURRING_FEATURES,
    },
    {
      code: 'yearly',
      name: 'Yearly audit',
      productName: 'Yearly SEO subscription',
      price: price(settings.seo_yearly_price),
      cadence: 'per audit, every year',
      summary: 'An annual check-up, measuring what the year’s changes earned.',
      features: RECURRING_FEATURES,
    },
    {
      code: 'oneoff',
      name: 'One-off SEO audit',
      productName: 'SEO audit',
      price: price(settings.seo_oneoff_price),
      cadence: 'once, no subscription',
      summary: 'One full round of analysis and ranked recommendations.',
      features: FEATURES,
    },
  ];
}

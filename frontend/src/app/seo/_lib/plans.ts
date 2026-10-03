import { type PublicSiteSettings } from '@/lib/api';
import { planByCode, type Plan } from '@/lib/plans';
import type { SeoPlanCode } from '@/lib/seoApi';
import { formatMoney } from '@/lib/formatting';

export type { SeoPlanCode };
export type SignupPlanCode = Extract<SeoPlanCode, 'monthly' | 'oneoff'>;
export type SeoPlan = Plan<SignupPlanCode>;
export { planByCode };

const FEATURES = [
  'Search Console, Business Profile and analytics read together',
  '23 foundation checks, pass, warn or fail',
  'Ranked recommendations with impact and cost',
];

/**
 * The two things a customer can buy. A subscription always starts monthly and
 * slows when there's less new data to judge changes by; the price of each cycle
 * stays the same, so one card covers every cadence.
 */
export function buildSeoPlans(settings: PublicSiteSettings): SeoPlan[] {
  return [
    {
      code: 'monthly',
      name: 'Subscription',
      price: formatMoney(settings.seo_subscription_price, { cents: 'auto' }),
      cadence: 'per report',
      summary: 'Analyse, recommend and experiment every cycle, measuring what each change earned.',
      features: [...FEATURES, 'Every change tracked as an experiment'],
      recommended: true,
    },
    {
      code: 'oneoff',
      name: 'SEO audit',
      price: formatMoney(settings.seo_oneoff_price, { cents: 'auto' }),
      cadence: 'once, no subscription',
      summary: 'One full round of analysis and ranked recommendations.',
      features: FEATURES,
    },
  ];
}

/** The signup card a stored plan belongs to: every recurring cadence is the subscription. */
export function signupPlanFor(plan: SeoPlanCode): SignupPlanCode {
  return plan === 'oneoff' ? 'oneoff' : 'monthly';
}

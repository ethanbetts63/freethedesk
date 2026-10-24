import { type PublicSiteSettings } from '@/lib/api';
import { planByCode, type Plan } from '@/lib/plans';
import type { SeoPlanCode } from '@/lib/seoApi';
import { formatMoney } from '@/lib/formatting';

export type { SeoPlanCode };
export type SeoPlan = Plan<SeoPlanCode> & {
  /** What checkout calls it: "Plus SEO audit". */
  productName: string;
};
export { planByCode };

const price = (value: string) => formatMoney(value, { cents: 'auto' });

/** The admin setting each audit is priced from. */
export const PRICE_FIELD = {
  essentials: 'seo_essentials_price',
  plus: 'seo_plus_price',
  complete: 'seo_complete_price',
} as const satisfies Record<SeoPlanCode, keyof PublicSiteSettings>;

/** Each audit's price, for copy that names all three beside a call to buy. */
export function seoAuditPrices(settings: PublicSiteSettings) {
  return {
    essentials: price(settings.seo_essentials_price),
    plus: price(settings.seo_plus_price),
    complete: price(settings.seo_complete_price),
  };
}

export type SeoAuditPrices = ReturnType<typeof seoAuditPrices>;

/**
 * What a customer can buy: one audit, paid once, in three tiers by what it
 * reads. Essentials reads what is public and Search Console; Plus adds the
 * Business Profile, reviews and analytics; Complete reads everything and looks
 * again three months on. Mirrors SeoSubscriber.Plan and the SEO Audit Terms.
 */
export function buildSeoPlans(settings: PublicSiteSettings): SeoPlan[] {
  return [
    {
      code: 'essentials',
      name: 'Essentials',
      productName: 'Essentials SEO audit',
      price: price(settings.seo_essentials_price),
      cadence: 'paid once',
      summary: 'Your site, your rivals and your Search Console data.',
      features: [
        'Your site, on a computer and a phone',
        'Your Search Console data',
        'The sites that outrank you',
        'Page speed and 23 foundation checks',
      ],
    },
    {
      code: 'plus',
      name: 'Plus',
      productName: 'Plus SEO audit',
      price: price(settings.seo_plus_price),
      cadence: 'paid once',
      summary: 'Essentials, with your Business Profile, reviews and visitor analytics.',
      features: [
        'Everything in Essentials',
        'Your Google Business Profile',
        'Your reviews and your rivals’',
        'Your visitor analytics',
      ],
      recommended: true,
    },
    {
      code: 'complete',
      name: 'Complete',
      productName: 'Complete SEO audit',
      price: price(settings.seo_complete_price),
      cadence: 'paid once',
      summary: 'Everything we read, and a second look three months on.',
      features: [
        'Everything in Plus',
        'Your Google Ads account',
        'A legal check of your site',
        'A second look three months on',
      ],
    },
  ];
}

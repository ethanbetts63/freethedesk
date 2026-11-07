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
        'How your site looks and works to a visitor',
        'Your Search Console data',
        'The sites that outrank you',
        'Page speed and data-backed SEO checks',
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
      summary: 'Plus, with your Google Ads, a legal check and a second look three months on.',
      features: [
        'Everything in Plus',
        'Your Google Ads account',
        'A legal check of your site',
        'A second look three months on',
      ],
    },
  ];
}

/** The tier a source is first read in: Plus reads everything Essentials does, Complete everything Plus does. */
export const TIER_ORDER: readonly SeoPlanCode[] = ['essentials', 'plus', 'complete'];

/**
 * Every source an audit reads, in the order the report reads them, each with the
 * first audit that reads it. One row of the comparison table each; the cards'
 * `features` say the same thing tier by tier.
 */
export const AUDIT_READS: readonly { label: string; from: SeoPlanCode }[] = [
  { label: 'How your site looks and works, on a phone and a desktop', from: 'essentials' },
  { label: 'Page speed', from: 'essentials' },
  { label: 'The search results and the sites that outrank you', from: 'essentials' },
  { label: 'Data-backed SEO checks', from: 'essentials' },
  { label: 'Your Search Console data', from: 'essentials' },
  { label: 'Your Google Business Profile', from: 'plus' },
  { label: 'Your reviews and your rivals’', from: 'plus' },
  { label: 'Your visitor analytics', from: 'plus' },
  { label: 'Your Google Ads account', from: 'complete' },
  { label: 'A legal check of your site', from: 'complete' },
  { label: 'A second look three months on', from: 'complete' },
];

/** Whether an audit reads a source: it does if its tier is the source's first tier or a later one. */
export function reads(code: SeoPlanCode, from: SeoPlanCode) {
  return TIER_ORDER.indexOf(code) >= TIER_ORDER.indexOf(from);
}

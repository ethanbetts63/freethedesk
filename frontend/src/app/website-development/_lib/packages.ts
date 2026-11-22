import type { Plan } from '@/lib/plans';
import { money, WEBSITE_PACKAGE_PRICES, type WebsitePackageCode } from '@/lib/servicePricing';
import type { FaqItem } from '@/types/FaqItem';

/** The three packages, by what the site does rather than how many pages it has (owner, 2026-11-21). */
export const WEBSITE_PLANS: Plan<WebsitePackageCode>[] = [
  {
    code: 'basic',
    name: 'Basic',
    price: money(WEBSITE_PACKAGE_PRICES.basic),
    cadence: 'fixed price',
    summary: 'Your current site, rebuilt to bring in enquiries.',
    features: [
      'Home, a page for each service, about and contact',
      'Your own words and photos, laid out for phones first',
      'Enquiry form and tap-to-call on every page',
      'SEO foundations, and your old addresses redirected',
      'Search Console and Analytics set up',
    ],
  },
  {
    code: 'growth',
    name: 'Growth',
    price: money(WEBSITE_PACKAGE_PRICES.growth),
    cadence: 'fixed price',
    summary: 'More pages to land on, for more of the searches you want.',
    features: [
      'Everything in Basic',
      'Up to five suburb pages',
      'Three homepage variations, each for a search you want',
      'A page for each of your five best jobs',
      'Google Business Profile optimised, with a review link and QR cards',
    ],
    recommended: true,
  },
  {
    code: 'complete',
    name: 'Complete',
    price: money(WEBSITE_PACKAGE_PRICES.complete),
    cadence: 'fixed price',
    summary: 'Growth, plus guides and a search audit after launch.',
    features: [
      'Everything in Growth',
      'Five guides answering what your customers search',
      'An SEO audit at three months, and its fixes made',
    ],
  },
];

/** The link under a section to the site the case study is about. In a new tab: the reader is mid-page. */
export const BUILT_SITE_LINK = {
  label: 'See a site we built',
  href: '/portfolio/scooter-shop',
  newTab: true,
} as const;

/** The same call and the same payment on every website page. */
export const HOW_IT_WORKS_FAQ: FaqItem = {
  question: 'How does it work, and when do I pay?',
  answer:
    'It starts with a short call about what you do, where you work and the jobs you want more of. You pay half upfront, we build the site, and you review it on a private link, with one round of changes included. You pay the rest before it goes live on your own domain.',
};

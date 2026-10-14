import type { IndexedFeature } from '@/components/marketing/IndexedFeatureSection';
import { money, type ServicePrices } from '@/lib/servicePricing';
import type { FaqItem } from '@/types/FaqItem';

/* Why a rebuild off WordPress, in the terms the WordPress cost guide sets out. */
export const WORDPRESS_REASONS: readonly IndexedFeature[] = [
  [
    'No plugins to keep updated',
    'Most published WordPress security problems are in plugins, not WordPress itself. With no plugin layer there is nothing to patch each month, and no update that quietly breaks the contact form.',
  ],
  [
    'No licences to renew',
    'Page builders, SEO plugins and form plugins are often yearly licences priced in US dollars. Those jobs are built into the site instead, so the bill stops.',
  ],
  [
    'Fast without the tuning',
    'A WordPress site can be fast, but it takes caching plugins and care. A custom build loads only what each page needs, which visitors on phones notice first.',
  ],
];

/* How the searches a site already wins survive the move. */
export const RANKING_STEPS: readonly IndexedFeature[] = [
  [
    'Read the search data first',
    'Before anything is built, we pull every page that Google shows today from your Search Console, and the searches each one is found for.',
  ],
  [
    'Map every old address',
    'Each old page gets a permanent redirect to the page that replaces it, and the titles and wording that already rank are kept unless there is a reason to change them.',
  ],
  [
    'Check it after launch',
    'The new sitemap goes to Google on launch day, and Search Console is watched in the weeks after, so a missing redirect is caught early rather than months later.',
  ],
];

/** Prices come from the admin, so the cost answer is built per request. */
export function redesignFaqs(prices: ServicePrices): FaqItem[] {
  const [small, large] = prices.packages;
  return [
    {
      question: 'How much does a website redesign cost in Perth?',
      answer: `A redesign is priced like a new build: our ${small.name} is ${money(small.price)} and our ${large.name} is ${money(large.price)}, each priced per page, half when you buy and the rest before launch. Moving your existing pages across and redirecting the old addresses is part of the build.`,
      links: [{ phrase: 'priced like a new build', href: '#packages' }],
    },
    {
      question: 'Will a redesign hurt my Google rankings?',
      answer:
        "It can, when pages that rank disappear without a redirect. That's why the move starts from your Search Console data: every page Google shows today is redirected to its replacement, and the wording it ranks for is kept.",
    },
    {
      question: 'Can you move my WordPress content across?',
      answer:
        'Yes. Pages, posts and images come across, and what a plugin did, such as a form, a booking calendar or a gallery, is built into the site. If a plugin does something that would cost more to rebuild than it is worth, we say so before you buy.',
    },
    {
      question: "What if I don't have Search Console?",
      answer:
        'We set it up for you first, and read what it reports before anything moves. Search Console is free, and it is the only place Google lists the searches your current site is found for.',
    },
    {
      question: 'Do I keep my domain and email?',
      answer:
        'Yes. Your domain stays yours, and email hosted elsewhere, such as Google Workspace or Microsoft 365, is left alone. Only the records that point at the website change.',
    },
    {
      question: 'Should every business move off WordPress?',
      answer:
        'No. If you publish every day, several people edit the site, or a well-supported plugin already does what you need, WordPress may suit you better. Our guide to what a WordPress website really costs sets out when to stay.',
      links: [
        {
          phrase: 'what a WordPress website really costs',
          href: '/wordpress-website-cost-perth',
        },
      ],
    },
  ];
}

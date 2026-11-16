import { packageByCode, money, type ServicePrices } from '@/lib/servicePricing';
import type { FaqItem } from '@/types/FaqItem';

/** Prices come from the admin, so the cost answer is built per request. */
export function redesignFaqs(prices: ServicePrices): FaqItem[] {
  const [one, small, large] = (['website_one_page', 'website_small', 'website_large'] as const).map(
    (code) => packageByCode(prices.packages, code),
  );
  return [
    {
      question: 'How much does a website redesign cost in Perth?',
      answer: `A redesign is priced like a new build: our ${one.name} is ${money(one.price)}, our ${small.name} ${money(small.price)} and our ${large.name} ${money(large.price)}, each priced per page, half when you buy and the rest before launch. Moving your existing pages across and redirecting the old addresses is part of the build.`,
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
      question: "My site isn't on WordPress. Can you still redesign it?",
      answer:
        'Yes. Wix, Squarespace, GoDaddy and hand-built sites move the same way: we read what your current site is found for, rebuild each page, and redirect every old address to its replacement.',
    },
    {
      question: 'Will the new site work properly on phones?',
      answer:
        'Yes. It is designed for phones first, then uses the extra room on larger screens, and its forms, menus and pages are tested at the sizes people actually use.',
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

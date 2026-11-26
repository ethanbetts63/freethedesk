import {
  BUILT_SITE_LINK,
  HOW_IT_WORKS_FAQ,
  WEBSITE_PLANS,
} from '@/app/website-development/_lib/packages';
import type { WebsitePageCopy } from '@/app/website-development/_lib/pageCopy';
import { SCOOTER_SHOP_GROWTH } from '@/lib/caseStudies';
import type { ServicePrices } from '@/lib/servicePricing';
import type { FaqItem } from '@/types/FaqItem';

const WORDPRESS_COST_GUIDE = '/wordpress-website-cost-perth';

/**
 * The WordPress variation's words. The searches are Support Perth's and ours in Search Console
 * (2026-11-21): "wordpress web design perth", "wordpress website design perth", "wordpress
 * support perth", "wordpress help perth", "wordpress developers perth". The sections on why to
 * leave, the redirects and the questions are /website-redesign-perth's, which this replaced.
 */
export const WORDPRESS_COPY: WebsitePageCopy = {
  hero: {
    titleLines: ['WordPress website redesign Perth:'],
    accentTitle: 'load faster, rank higher.',
    lead: 'Web design for Perth businesses still on WordPress. We rebuild your WordPress website as an industry-grade website, built to load fast, rank higher and convert more.',
    trustLine: 'Fixed prices · Perth-based',
  },
  packages: {
    keyword: 'WordPress web design',
    title: 'WordPress website redesign packages',
    lead: 'Fixed prices: half upfront, the rest before launch. Moving your pages and redirecting the old addresses is included.',
  },
  nudge: 'Not sure which package fits your WordPress site?',
  introduction: {
    eyebrow: 'How our WordPress website redesign works',
    title: 'What is in a',
    accentTitle: 'WordPress website redesign?',
    body: 'A WordPress website redesign replaces your site with a custom-coded one. Every page is rebuilt and every old address redirected, so your Google rankings come too.',
  },
  sections: [
    {
      id: 'seo',
      label: 'WordPress SEO',
      title: 'SEO optimised redesign:',
      accentTitle: 'Google rankings improved',
      description:
        'We redirect every old address so the rankings you have carry over, then build a page for each search you want.',
      picture: '/images/guides/business-not-showing-up-on-google.webp',
      link: BUILT_SITE_LINK,
    },
    {
      id: 'speed',
      label: 'WordPress speed',
      title: 'Faster than WordPress:',
      accentTitle: 'no plugins to load',
      description:
        'The theme, page builder and plugins stacked on WordPress slow every page. A custom-coded site loads only what it needs.',
      picture: '/images/redesign/why-not-wordpress.webp',
      link: { label: 'What WordPress really costs', href: WORDPRESS_COST_GUIDE },
    },
    {
      id: 'design',
      label: 'WordPress web design',
      title: 'Sales-first web design:',
      accentTitle: 'from click to sale',
      description:
        'Every page is rebuilt for the phone first, with your reviews, your work and a call button within reach.',
      picture: '/images/pages/website-development.webp',
      link: BUILT_SITE_LINK,
    },
  ],
  caseStudy: {
    label: 'Website redesign case study',
    title: `Website redesign results for a Perth business: organic clicks up ${SCOOTER_SHOP_GROWTH.percent}%.`,
    body: `We rebuilt a Perth scooter dealership's site as one custom-coded site. Its organic clicks grew ${SCOOTER_SHOP_GROWTH.percent}% in ${SCOOTER_SHOP_GROWTH.span}.`,
    points: [
      'Old addresses redirected',
      'Intent-focused pages',
      'Structured data',
      'Measured in Search Console',
    ],
  },
  faq: {
    label: 'WordPress questions',
    title: 'WordPress web design Perth: common questions.',
    items: wordpressFaqs,
  },
  call: {
    title: 'Ready to move off WordPress?',
    picture: '/images/pages/website-redesign-perth.webp',
  },
};

function wordpressFaqs(prices: ServicePrices): FaqItem[] {
  const [basic, growth, complete] = WEBSITE_PLANS;
  return [
    {
      question: 'Do you build WordPress websites?',
      answer:
        'No. We are web designers and developers who rebuild WordPress websites as custom-coded sites: the same pages and words, with no theme, page builder or plugins underneath. If WordPress is the better tool for you we say so on the call.',
    },
    {
      question: 'How much does a WordPress website redesign cost in Perth?',
      answer: `Basic is ${basic.price}, Growth ${growth.price} and Complete ${complete.price}, each a fixed price. Moving your existing pages across and redirecting the old addresses is part of every package. Our guide to what a WordPress website really costs sets these beside what a WordPress site costs to keep running.`,
      links: [{ phrase: 'what a WordPress website really costs', href: WORDPRESS_COST_GUIDE }],
    },
    {
      question: 'Do you offer WordPress support or WordPress help in Perth?',
      answer: `Not as a monthly plan. If your WordPress site is slow, broken or hacked, what we offer is the rebuild, which removes the plugins and updates that cause most of the trouble. After launch, faults reported in the first 30 days are fixed free, and changes are ${prices.hourlyRate} an hour, quoted before we start.`,
    },
    HOW_IT_WORKS_FAQ,
    {
      question: 'Will moving off WordPress hurt my Google rankings?',
      answer:
        "It can, when pages that rank disappear without a redirect. That's why the move starts from your Search Console data: every page Google shows today is redirected to its replacement, and the wording it ranks for is kept.",
    },
    {
      question: 'Can you move my WordPress content across?',
      answer:
        'Yes. Pages, posts and images come across, and what a plugin did, such as a form, a booking calendar or a gallery, is built into the site. If a plugin does something that would cost more to rebuild than it is worth, we say so before you go ahead.',
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
      links: [{ phrase: 'what a WordPress website really costs', href: WORDPRESS_COST_GUIDE }],
    },
  ];
}

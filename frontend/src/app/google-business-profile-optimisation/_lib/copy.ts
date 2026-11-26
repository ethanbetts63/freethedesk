import { SCOOTER_SHOP_GROWTH } from '@/lib/caseStudies';
import type { FaqItem } from '@/types/FaqItem';

/** One of the three numbered sections under the introduction, as on the /seo page. */
export interface GbpSectionCopy {
  id: string;
  /** The numbered eyebrow, carrying one of the page's searches. */
  label: string;
  title: string;
  accentTitle: string;
  description: string;
  link: { label: string; href: string; newTab?: boolean };
}

/**
 * Every word on the Business Profile page. Every heading carries a search with impressions in
 * Search Console (owner, 2026-11-26): local SEO Perth, local SEO services Perth, Google My Business,
 * Google Maps and Google Business Profile optimisation.
 * laid out as the /seo page is (owner, 2026-11-26).
 * The title leads with "local SEO", which Support Perth's Search Console shows about twenty times
 * the impressions of the Business Profile searches. The heading and words carry Google Business
 * Profile, Google My Business and Google Maps: the searches this page has had impressions for.
 * See _docs/gbp-page-research.md.
 */
export const GBP_COPY = {
  hero: {
    titleLines: ['Local SEO Perth:'],
    accentTitle: 'improved Google Business Profile rankings',
    lead: 'We fill in your Google Business Profile, from categories to photos and review replies, so you show up on Google Maps. One job, one fixed price, paid once.',
    trustLine: 'Paid once, no subscription · Perth-based',
  },
  packages: {
    eyebrow: 'Business Profile optimisation price',
    title: 'Google Business Profile optimisation',
    accentTitle: 'pricing.',
  },
  introduction: {
    eyebrow: 'How Business Profile optimisation works',
    title: 'What is Google Business Profile',
    accentTitle: 'optimisation?',
    body: 'Your Business Profile is the panel and map pin people see when they search for you or what you sell nearby. Google fills the map with the most relevant, closest and best-known businesses. We make yours complete and accurate.',
  },
  sections: [
    {
      id: 'audit',
      label: 'Local SEO audit',
      title: 'Local SEO services in Perth',
      accentTitle: 'start with your rivals',
      description:
        'We search for what you sell and read the profiles that beat you to the map: their categories, services, photos and reviews. Then we fill the gaps in yours, biggest first.',
      link: {
        label: 'Why a business is missing from Google',
        href: '/business-not-showing-up-on-google',
      },
    },
    {
      id: 'profile',
      label: 'Google Business Profile optimisation',
      title: 'Google My Business optimisation:',
      accentTitle: 'every field filled in',
      description:
        'The right categories, a service for everything you sell with its price, your hours, area and attributes, a description written for customers, photos and review replies. Every fact comes from you.',
      link: { label: 'See what an SEO audit reads', href: '/seo/sample-report', newTab: true },
    },
    {
      id: 'website',
      label: 'Google Maps SEO',
      title: 'Google Maps optimisation:',
      accentTitle: 'your profile and website agree',
      description:
        'Your name, phone and hours match on the profile and the site, the booking button opens the right page, and the website link is tagged so your analytics counts every visit it sends.',
      link: { label: 'Compare the SEO audits', href: '/seo#signup' },
    },
  ],
  caseStudy: {
    label: 'Local SEO case study',
    title: `Local SEO results in Perth: organic clicks up ${SCOOTER_SHOP_GROWTH.percent}%.`,
    body: `We look after a Perth scooter dealer's website and Business Profile: a service under each category, the booking button fixed and a tagged website link. Its organic clicks grew ${SCOOTER_SHOP_GROWTH.percent}% in ${SCOOTER_SHOP_GROWTH.span}.`,
    points: [
      'Services under each category',
      'Booking link corrected',
      'Tracked website link',
      'Measured in Search Console',
    ],
  },
  faq: {
    label: 'Local SEO questions',
    title: 'Google Business Profile optimisation: common questions.',
  },
  call: {
    title: 'Ready to rank on Google Maps?',
    picture: '/images/pages/google-business-profile-optimisation.webp',
  },
} as const;

/** The first and third sections' pictures; the second is a drawn card, as on /seo. */
export const GBP_AUDIT_PICTURE = '/images/guides/business-not-showing-up-on-google.webp';
export const GBP_WEBSITE_PICTURE = '/images/guides/how-to-choose-a-web-designer-perth.webp';

/** Built per request, so the cost answer quotes the price the admin has set. */
export function gbpFaqs(price: string): FaqItem[] {
  return [
    {
      question: 'How much does Google Business Profile optimisation cost in Perth?',
      answer: `${price}, paid once, with no subscription. Perth agencies that publish prices charge from $500 a month to manage a profile or run local SEO.`,
    },
    {
      question: 'Is Business Profile optimisation the same as local SEO?',
      answer:
        'It is the biggest part. Local SEO covers your profile, your reviews and your website. This job does the profile and makes your site agree with it; for the website itself, an SEO audit says what to change.',
      links: [{ phrase: 'SEO audit', href: '/seo' }],
    },
    {
      question: 'Is this the same as Google My Business?',
      answer:
        'Yes. Google renamed Google My Business to Google Business Profile in 2021. GMB and Google Maps optimisation are this job.',
    },
    {
      question: 'Will this get me into the top three on Google Maps?',
      answer:
        'No one can promise that. Google ranks local results on relevance, distance and prominence, and nobody can change distance. A complete, accurate profile is the part we can do properly.',
    },
    {
      question: 'How long until I see results?',
      answer:
        "Most edits show within days; some wait on Google's review. Your place on the map moves over weeks, depending on your rivals and reviews. The profile's Performance panel counts calls, directions and website clicks, so you can compare before and after.",
    },
    {
      question: 'Can you get me more reviews, or remove bad ones?',
      answer:
        "We reply to your reviews and give you your review link to send customers after a job. We don't write, buy or filter reviews; Google removes them. A review comes down only if it breaks Google's rules, and we can report those.",
    },
    {
      question: 'Will you put keywords in my business name?',
      answer:
        'No. Google can suspend a profile with keywords added to its name. Your name stays as it is on your sign.',
    },
    {
      question: "I don't have a shopfront. Can I still have a profile?",
      answer:
        'Yes. A service-area business hides its address and lists the suburbs it travels to. We set yours up that way.',
    },
    {
      question: 'Do I need a website?',
      answer:
        'No. A profile works on its own. A website gives it somewhere to send people and helps Google trust both; see our website packages.',
      links: [{ phrase: 'website packages', href: '/website-development' }],
    },
    {
      question: 'My profile is suspended, or there is a duplicate. Can you fix it?',
      answer:
        "Tell us on the call, before you pay. A duplicate can usually be removed; a suspension needs an appeal with proof of the business. Google decides both, so we'll say plainly if we can help.",
    },
    {
      question: 'What access do you need?',
      answer:
        "Manager access, which you add in the profile's settings and remove when we're done. A manager can't remove the profile or its owners, so it stays yours.",
    },
    {
      question: 'Do you manage the profile every month?',
      answer:
        'No. It is one job. Afterwards, keeping it current takes a few minutes: reply to reviews, add a photo, update your hours.',
    },
    {
      question: 'How is this different from the Plus SEO audit?',
      answer:
        'The Plus audit reads your profile beside your website and Search Console and says what to change; this job makes the changes. Not sure the profile is the problem? Start with an SEO audit.',
      links: [{ phrase: 'SEO audit', href: '/seo' }],
    },
  ];
}

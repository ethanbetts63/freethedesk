import { SCOOTER_SHOP_GROWTH } from '@/lib/caseStudies';
import type { FaqItem } from '@/types/FaqItem';

/** One of the three numbered sections under the introduction, as on the website page. */
export interface GbpSectionCopy {
  id: string;
  /** The numbered eyebrow, carrying one of the page's searches. */
  label: string;
  title: string;
  accentTitle: string;
  description: string;
  picture: string;
  link: { label: string; href: string; newTab?: boolean };
}

/**
 * Every word on the Business Profile page, laid out as the website page is (owner, 2026-11-26).
 * The title leads with "local SEO", which Support Perth's Search Console shows about twenty times
 * the impressions of the Business Profile searches. The heading and words carry Google Business
 * Profile, Google My Business and Google Maps: the searches this page has had impressions for.
 * See _docs/gbp-page-research.md.
 */
export const GBP_COPY = {
  hero: {
    titleLines: ['Local SEO Perth:'],
    accentTitle: 'your Google Business Profile, done properly',
    lead: 'We fill in your Google Business Profile, from categories and services to photos and review replies, so you show up on Google Maps for what you sell. One job, at one fixed price, paid once.',
    trustLine: 'Paid once, no subscription · Manager access only · Perth-based',
  },
  packages: {
    eyebrow: 'Business Profile optimisation price',
    title: 'Google Business Profile optimisation',
    accentTitle: 'and price.',
    lead: 'One job, done in your profile by us, paid once. No monthly plan to cancel.',
  },
  nudge: 'More than one location, or a suspended profile?',
  introduction: {
    eyebrow: 'How Business Profile optimisation works',
    title: 'What is Google Business Profile',
    accentTitle: 'optimisation?',
    body: 'Your Business Profile is the panel and map pin people see when they search for you, or for what you sell nearby. Google fills the map with the businesses it judges most relevant, closest and best known. We make your profile complete and accurate, so it is a fair match for every search it should win.',
  },
  sections: [
    {
      id: 'audit',
      label: 'Local SEO audit',
      title: 'Local SEO starts with',
      accentTitle: 'the businesses above you',
      description:
        'Before we change anything, we search for what you sell and read the profiles that beat you to the map: their categories, their services, their photos and their reviews. Then we fill the gaps in yours, the ones that matter most first.',
      picture: '/images/guides/business-not-showing-up-on-google.webp',
      link: {
        label: 'Why a business is missing from Google',
        href: '/business-not-showing-up-on-google',
      },
    },
    {
      id: 'profile',
      label: 'Google Business Profile optimisation',
      title: 'Every part of your profile,',
      accentTitle: 'filled in properly',
      description:
        'The right main and extra categories, a service for everything you sell with its price, your hours, area and attributes, a description written for customers, photos of your work and replies to your reviews. Every fact comes from you, and none of it is stuffed with keywords.',
      picture: '/images/seo/what-google-looks-at.webp',
      link: { label: 'See what an SEO audit reads', href: '/seo/sample-report', newTab: true },
    },
    {
      id: 'website',
      label: 'Google Maps optimisation',
      title: 'Your profile and your website,',
      accentTitle: 'telling Google the same story',
      description:
        'Your name, address and phone number match on the profile and the site, your booking button opens the right page, and the website link is tagged so your analytics counts every visit the profile sends. You can see what the work did, not just that it was done.',
      picture: '/images/guides/small-business-seo-perth.webp',
      link: { label: 'Compare the SEO audits', href: '/seo#signup' },
    },
  ],
  caseStudy: {
    label: 'Local SEO case study',
    title: `Local SEO for a Perth dealer: organic clicks up ${SCOOTER_SHOP_GROWTH.percent}%.`,
    body: `We look after a Perth scooter dealership's website and its Business Profile: a service listed under each of its categories, its booking button pointed at the right page, and a tagged website link so its analytics counts what the profile sends. Its organic clicks grew ${SCOOTER_SHOP_GROWTH.percent}% in ${SCOOTER_SHOP_GROWTH.span}.`,
    points: [
      'Services under each category',
      'Booking link corrected',
      'Tracked website link',
      'Measured in Search Console',
    ],
  },
  faq: {
    label: 'Local SEO questions',
    title: 'Business Profile optimisation: common questions.',
  },
  call: {
    title: 'Ready to show up on Google Maps?',
    picture: '/images/pages/google-business-profile-optimisation.webp',
  },
} as const;

/** Built per request, so the cost answer quotes the price the admin has set. */
export function gbpFaqs(price: string): FaqItem[] {
  return [
    {
      question: 'How much does Google Business Profile optimisation cost in Perth?',
      answer: `${price}, paid once, with no subscription. The Perth agencies that publish their prices charge from $500 a month to manage a profile or run local SEO.`,
    },
    {
      question: 'Is Business Profile optimisation the same as local SEO?',
      answer:
        'It is the biggest part of it. Local SEO is everything that decides whether you show up for searches near you: your Business Profile, your reviews and your website. This job does the profile and makes your site agree with it. For the website itself, an SEO audit says what to change.',
      links: [{ phrase: 'SEO audit', href: '/seo' }],
    },
    {
      question: 'Is this the same as Google My Business?',
      answer:
        'Yes. Google renamed Google My Business to Google Business Profile in 2021. GMB optimisation, Google Maps optimisation and Business Profile optimisation are all this job.',
    },
    {
      question: 'Will this get me into the top three on Google Maps?',
      answer:
        'No one can promise that. Google ranks local results on relevance, distance and prominence, and nobody can change how far a searcher is from you. A complete, accurate profile is the part we can do properly, and it is the part most profiles are missing.',
    },
    {
      question: 'How long until I see results?',
      answer:
        "Most edits show on Google within days; some go to Google for review first, which can take a little longer. Where you sit on the map moves over weeks, and how far depends on your rivals and your reviews. Your profile's Performance panel counts calls, direction requests and website clicks, so you can compare the months before and after.",
    },
    {
      question: 'Can you get me more reviews, or remove bad ones?',
      answer:
        "We reply to the reviews you have and give you your profile's review link, to send customers after a job. We don't write, buy or filter reviews: Google removes them and can restrict the profile. A review can only come down if it breaks Google's rules, and we can report those for you.",
    },
    {
      question: 'Will you put keywords in my business name?',
      answer:
        'No. Google can suspend a profile whose name has keywords added. Your name stays exactly as it is on your sign; the categories, services and description carry what you sell.',
    },
    {
      question: "I don't have a shopfront. Can I still have a profile?",
      answer:
        'Yes. A service-area business hides its address and lists the suburbs it travels to instead, as Google asks. We set yours up that way.',
    },
    {
      question: 'Do I need a website?',
      answer:
        "No. A profile works on its own and we fill it in the same way. A website gives the profile somewhere to send people and helps Google trust both, so if you don't have one, see our website packages.",
      links: [{ phrase: 'website packages', href: '/website-development' }],
    },
    {
      question: 'My profile is suspended, or there is a duplicate. Can you fix it?',
      answer:
        "Tell us on the call, before you pay. A duplicate can usually be reported and removed; a suspension needs an appeal to Google with proof of the business. Google decides both, so we will say plainly whether it's a job we can take on.",
    },
    {
      question: 'What access do you need?',
      answer:
        "Manager access, which you add in the profile's settings and remove when we're done. A manager can edit the profile but can't remove it or its owners, so it stays yours.",
    },
    {
      question: 'Do you manage the profile every month?',
      answer:
        'No. It is one job. Afterwards, keeping it current takes a few minutes now and then: reply to reviews, add a photo, update your hours.',
    },
    {
      question: 'How is this different from the Plus SEO audit?',
      answer:
        'The Plus audit reads your profile beside your website and Search Console and says what to change. Profile optimisation makes the changes. Not sure the profile is the problem? Start with an SEO audit.',
      links: [{ phrase: 'SEO audit', href: '/seo' }],
    },
  ];
}

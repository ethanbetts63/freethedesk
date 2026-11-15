import type { FaqItem } from '@/types/FaqItem';

import { gbpPrice } from './plan';

export const gbpFaqs: FaqItem[] = [
  {
    question: 'How much does Google Business Profile optimisation cost?',
    answer: `${gbpPrice}, paid once, with no subscription. Most agencies only sell profile work inside a monthly retainer.`,
  },

  {
    question: 'What access do you need?',
    answer:
      "Manager access, which you add in the profile's settings and remove when we're done. A manager can edit the profile but can't remove it or its owners, so it stays yours.",
  },

  {
    question: 'Will this get me to the top of Google Maps?',
    answer:
      'No one can promise that. Google ranks local results on relevance, distance and prominence, and nobody can change distance. A complete, accurate profile is the part we can do properly.',
  },

  {
    question: 'How is this different from the Plus SEO audit?',
    answer:
      'The Plus audit reads your profile beside your website and Search Console and says what to change. Profile optimisation makes the changes. Not sure the profile is the problem? Start with an SEO audit.',
    links: [{ phrase: 'SEO audit', href: '/seo' }],
  },

  {
    question: 'Will you add keywords to my name, write reviews or build links?',
    answer:
      'No. Google can suspend a profile with keywords in its name, removes paid or gated reviews, and treats bought links as spam. We reply to the reviews you have.',
  },

  {
    question: 'Do you manage the profile every month?',
    answer:
      'No. It is one job. Afterwards, keeping it current takes a few minutes now and then: reply to reviews, add a photo, update the hours.',
  },

  {
    question: 'How long until the changes show on Google?',
    answer:
      'Most edits show soon after. Some go to Google for review first, which can take a few days.',
  },
];

import type { FaqItem } from '@/types/FaqItem';

import { gbpPrice } from './plan';

export const gbpFaqs: FaqItem[] = [
  {
    question: 'How much does Google Business Profile optimisation cost?',
    answer: `${gbpPrice}, paid once. There's no subscription and no monthly fee. Profile work is usually sold inside a monthly SEO retainer; this is the same setup done once, at a price you can see before you ask.`,
  },

  {
    question: 'What do you change on my profile?',
    answer:
      'Everything Google lets a business fill in: the primary and secondary categories, your services with a description and price for each, the business description, attributes such as online appointments or on-site services, your hours and service area, a booking link, a website link tagged so your analytics can count the visits it sends, photos, posts and replies to your reviews. Every fact comes from you; we write it up and put it in.',
  },

  {
    question: 'What access do you need?',
    answer:
      "Manager access to your Business Profile. You add us as a manager in the profile's settings and remove us when we're done. A manager can edit the profile, but can't add or remove users or remove the profile, so it stays yours.",
  },

  {
    question: 'Will this get me to the top of Google Maps?',
    answer:
      "No one can promise that, and we don't. Google ranks local results on relevance, distance and prominence. Distance is where the person searching is, which nobody can change. A complete and accurate profile is what Google says helps it match you to the right searches, and that is the part we do properly.",
  },

  {
    question: 'How is this different from the Plus SEO audit?',
    answer:
      "The Plus audit reads your profile beside your website, Search Console, reviews and analytics, and writes up what to change; it never changes anything. Profile optimisation is the work itself: we make the changes in your profile. If you're not sure the profile is what's holding you back, start with an SEO audit.",
    links: [{ phrase: 'SEO audit', href: '/seo' }],
  },

  {
    question: 'What if my website and profile disagree?',
    answer:
      "Google checks your profile against what it finds elsewhere, starting with your own website. If the site gives a different business name, address or phone number, we match the profile to the site where the site is right, and tell you exactly what to change on the site where it isn't.",
  },

  {
    question: 'Will you put keywords in my business name or write reviews?',
    answer:
      "No. Google's rules say the name must be your real-world business name, with nothing added, and a name with extras in it can get the profile suspended. Its review policy bans paid or incentivised reviews, reviews posted for the business, and asking only happy customers for one, which is called review gating. Reviews that break it are removed. We reply to the reviews you have.",
  },

  {
    question: 'Do you build links to my website?',
    answer:
      "No. Buying or swapping links is what Google's spam policies call link spam, and a site that relies on it can rank lower or drop out of results. We don't sell it on its own or as part of anything else.",
  },

  {
    question: 'Do you manage the profile every month?',
    answer:
      'No. It is one job, paid once, with no retainer. Once the profile is set up, keeping it current takes a few minutes now and then: reply to new reviews, add a post or a photo, and change the hours when they change.',
  },

  {
    question: 'How long until the changes show on Google?',
    answer:
      'Many edits show soon after they are made. Google reviews some before they go live, and those can take a few days.',
  },

  {
    question: "Can you optimise my profile if I'm not in Perth?",
    answer:
      'Yes. A Business Profile is edited online, so we can do it for a business anywhere in Australia, the same way we do it in Perth.',
  },
];

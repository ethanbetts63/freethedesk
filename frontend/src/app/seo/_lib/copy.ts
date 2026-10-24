import { type PublicSiteSettings } from '@/lib/api';
import type { FaqItem } from '@/types/FaqItem';

import { seoAuditPrices } from './plans';

/** Built per request so the cost answer quotes the prices the admin has set. */
export function seoFaqs(settings: PublicSiteSettings): FaqItem[] {
  const prices = seoAuditPrices(settings);

  return [
    {
      question: 'Can I do SEO myself?',
      answer:
        "Yes, and that's the idea. Every recommendation is written in plain English so you, your IT person or whatever platform you already use (GoDaddy, Wix, Squarespace and the rest) can make the change. If you'd rather we did it, each one can come with a fixed implementation price.",
    },

    {
      question: 'How much does SEO cost in Perth?',
      answer: `An Essentials audit is ${prices.essentials}, Plus is ${prices.plus} and Complete is ${prices.complete}, each paid once with no subscription. It's a fraction of a typical agency retainer.`,
    },

    {
      question: "Why isn't my business showing up on Google?",
      answer:
        "Usually one of a few things: Google can't reach or add the page, it can't tell your site and your Business Profile are the same business, or the page doesn't answer what people are searching. The 23 foundation checks look for exactly these, and the audit ranks what to fix first. Our guide to why a business isn't showing up on Google covers each one.",
      links: [
        {
          phrase: "why a business isn't showing up on Google",
          href: '/business-not-showing-up-on-google',
        },
      ],
    },

    {
      question: 'Is SEO still worth it now AI answers questions?',
      answer:
        'Yes. AI answers are built from the same pages search ranks, and they cite the sites that are clear, fast and easy to read. Every audit checks whether AI crawlers can read your site and whether AI answers mention you. Our guide to showing up in AI search has the checklist.',
      links: [{ phrase: 'showing up in AI search', href: '/how-to-show-up-in-ai-search' }],
    },

    {
      question: "What's the difference between Essentials, Plus and Complete?",
      answer:
        "What each one reads. Essentials reads your site on a computer and a phone, its speed, the search results and the sites that outrank you, and your Search Console. Plus adds your Google Business Profile, your reviews and your rivals', and your website analytics. Complete adds your Google Ads account and a check of your site against the Australian rules that apply to it, then looks again three months later to show what the changes you made earned.",
    },

    {
      question: 'What access do you actually need?',
      answer:
        "Essentials needs only Google Search Console and a short brief about what you sell and where. Plus also needs your Google Business Profile and your website analytics. Complete adds your Google Ads account and, if you can share it, a count of the enquiries or sales that came in. Everything is read-only: we can't edit your site, your profile or your ads, and we don't install anything.",
    },

    {
      question: 'Should we keep paying for Google Ads?',
      answer:
        "Ads are useful while your rankings catch up, but every ad click is rented: it stops when the budget does. Each audit shows the searches you're closest to winning organically. If you're also paying for clicks on those searches, they're the first places to earn the click instead of buying it.",
    },

    {
      question: 'Do you only work with Perth businesses?',
      answer:
        'No. We work primarily in Perth, and we also have clients in cities across Australia. Local results, Google Maps and the suburbs or regions you serve are part of every audit, wherever you are.',
    },
  ];
}

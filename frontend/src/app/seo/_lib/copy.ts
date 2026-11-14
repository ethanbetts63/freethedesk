import { type PublicSiteSettings } from '@/lib/api';
import type { FaqItem } from '@/types/FaqItem';

import { seoAuditPrices } from './plans';

/** Built per request so the cost answer quotes the prices the admin has set. */
export function seoFaqs(settings: PublicSiteSettings): FaqItem[] {
  const prices = seoAuditPrices(settings);

  return [
    {
      question: 'Is there a money-back guarantee?',
      answer:
        "Yes. Make at least three of the report's ranking recommendations within 30 days and tell us the date they went live. We then compare your Google clicks, as your own Search Console counts them, for the next 90 days with the same 90 days a year earlier. If they aren't higher, ask and we refund the full price. It covers every audit; the SEO audit terms set it out in full.",
      links: [{ phrase: 'SEO audit terms', href: '/legal/seo-audit-terms' }],
    },

    {
      question: 'Can I do SEO myself?',
      answer:
        "Yes, and that's the idea. Every recommendation is written in plain English so you, your IT person or whatever platform you already use (GoDaddy, Wix, Squarespace and the rest) can make the change. If you'd rather we did it, each one can come with a fixed implementation price.",
    },

    {
      question: 'Is a free SEO audit worth anything?',
      answer:
        "A free audit is usually a tool's scan: a score, a list of warnings and a sales call. It can't tell you which searches you're losing or what a fix is worth, because it never reads your Search Console. Ours does, and every recommendation comes ranked by value. Read the sample report and judge for yourself.",
      links: [{ phrase: 'sample report', href: '/seo/sample-report' }],
    },

    {
      question: 'How much does SEO cost in Perth?',
      answer: `An Essentials audit is ${prices.essentials}, Plus is ${prices.plus} and Complete is ${prices.complete}, each paid once with no subscription. It's a fraction of a typical agency retainer. Our guide to what SEO costs in Perth sets the audits beside the monthly retainers and paid clicks Perth firms publish prices for.`,
      links: [{ phrase: 'what SEO costs in Perth', href: '/seo-cost-perth' }],
    },

    {
      question: 'Do you offer ongoing SEO packages or services?',
      answer:
        "No retainers. Each audit is one written report, paid once. If you'd rather not make the changes yourself, any recommendation can come with a fixed implementation price, and a Complete audit looks again three months on to show what the changes earned.",
    },

    {
      question: "Why isn't my business showing up on Google?",
      answer:
        "Usually one of a few things: Google can't reach or add the page, it can't tell your site and your Business Profile are the same business, or the page doesn't answer what people are searching. Every audit checks for exactly these and ranks what to fix first. Our guide to why a business isn't showing up on Google covers each one.",
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
      question: 'What does each SEO audit include?',
      answer:
        "What each one reads. Essentials reads your site on a computer and a phone, its speed, the search results and the sites that outrank you, and your Search Console. Plus adds your Google Business Profile, your reviews and your rivals', and your website analytics. Complete adds your Google Ads account and a check of your site against the Australian rules that apply to it, then looks again three months later to show what the changes you made earned.",
    },

    {
      question: 'Does the audit cover technical SEO?',
      answer:
        'Yes. Every audit reads your site on a computer and a phone and checks whether Google can reach and index each page, how fast the pages load, structured data, broken links and redirects, and what Search Console reports about them. Each fault found becomes a recommendation, ranked beside the rest.',
    },

    {
      question: 'What access do you actually need?',
      answer:
        "Essentials needs only Google Search Console and a short brief about what you sell and where. Plus also needs your Google Business Profile and your website analytics. Complete adds your Google Ads account and, if you can share it, a count of the enquiries or sales that came in. Everything is read-only: we can't edit your site, your profile or your ads, and we don't install anything.",
    },

    {
      question: 'How long does an SEO audit take?',
      answer:
        'Usually the report is back within seven days of getting access. A larger site, or one with a lot of search traffic to read, can take longer, and we say so up front.',
    },

    {
      question: 'Should we keep paying for Google Ads?',
      answer:
        "Ads are useful while your rankings catch up, but every ad click is rented: it stops when the budget does. Each audit shows the searches you're closest to winning organically. If you're also paying for clicks on those searches, they're the first places to earn the click instead of buying it.",
    },

    {
      question: "Can I get an SEO audit if I'm not in Perth?",
      answer:
        "Yes. The audit is written from your site and your search data, so it's delivered the same way anywhere in Australia. We work primarily in Perth and have clients in cities across the country. Local results, Google Maps and the suburbs or regions you serve are part of every audit, wherever you are.",
    },
  ];
}

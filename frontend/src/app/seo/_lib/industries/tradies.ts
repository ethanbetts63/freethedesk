import { SCOOTER_SHOP_GROWTH } from '@/lib/caseStudies';
import { GBP_OPTIMISATION_PRICE, money } from '@/lib/servicePricing';

import type { SeoPageCopy } from '../pageCopy';

/** /seo/tradies: the /seo page's words, said for plumbers, electricians and the other trades. */
export const TRADIES_COPY: SeoPageCopy = {
  hero: {
    titleLines: ['SEO for tradies Perth:', 'technical, local and'],
    accentTitle: 'AI search reports.',
    lead: "A written SEO report of your trade website: the local jobs you're losing on Google, what to fix and what each fix is worth. For plumbers, electricians and every trade in Perth and across Australia.",
  },
  packages: {
    title: 'SEO audits for tradies',
    lead: 'One written report of your trade website, paid once. The three differ in what they read.',
    audience: 'tradies',
  },
  introduction: {
    title: 'What is in an SEO audit',
    accentTitle: 'for tradies?',
    body: 'A tradie SEO audit is a written report of your website: what Google, Google Maps and AI search see when they read it, the "near me" searches you\'re losing and to which other trades, and a ranked list of fixes with what each one is worth. Every recommendation starts in your own search data and ends with a measurement.',
  },
  analyse: {
    title: 'What a tradie SEO audit checks:',
    accentTitle: 'technical, Maps and AI search',
    description:
      'Whether Google can reach and index every service page, how fast the pages load on a phone, structured data, broken links and redirects, your Google Business Profile, service area and reviews, and whether AI crawlers can read the site. Many sources go in; one ranked list of recommendations comes out.',
  },
  recommend: {
    title: 'SEO recommendations for tradies,',
    accentTitle: 'ranked by what each is worth',
    description:
      'Every recommendation says what to change, why the data points to it and how to do it. Written so you can make the change between jobs, or hand it to whoever built your site.',
  },
  experiment: {
    title: 'Every change is',
    accentTitle: 'an SEO experiment',
    description:
      "Every recommendation you implement becomes an experiment, measured in the clicks and calls it brings in. We track our decisions numerically. What earns is kept and built on; what doesn't is dropped.",
  },
  caseStudy: {
    title: `SEO results for a Perth business: organic clicks up ${SCOOTER_SHOP_GROWTH.percent}%.`,
    body: `Scooter Shop is a Perth scooter dealership with its own service workshop. Its website combines inventory, parts, purchasing and service bookings in one connected experience. Fast structured pages and search content aimed at what Perth customers search for grew its organic clicks ${SCOOTER_SHOP_GROWTH.percent}% in ${SCOOTER_SHOP_GROWTH.span}.`,
  },
  faqTitle: 'SEO for tradies Perth: common questions.',
  faqs: (prices) => [
    {
      question: 'Is there a money-back guarantee on tradie SEO?',
      answer:
        "Yes. Make at least three of the report's ranking recommendations within 30 days and tell us the date they went live. We then compare your Google clicks, as your own Search Console counts them, for the next 90 days with the same 90 days a year earlier. If they aren't higher, ask and we refund the full price. It covers every audit; the SEO audit terms set it out in full.",
      links: [{ phrase: 'SEO audit terms', href: '/legal/seo-audit-terms' }],
    },
    {
      question: 'Can a tradie do their own SEO?',
      answer:
        "Yes, and that's the idea. Every recommendation is written in plain English so you, whoever built your site or the platform it runs on (GoDaddy, Wix, Squarespace and the rest) can make the change. If you'd rather we did it, each one can come with a fixed implementation price.",
    },
    {
      question: 'Is a free SEO audit for my trade business worth anything?',
      answer:
        "A free audit is usually a tool's scan: a score, a list of warnings and a sales call. It can't tell you which local searches you're losing to other trades or what a fix is worth, because it never reads your Search Console. Ours does, and every recommendation comes ranked by value. Read the sample report, written for a Perth plumber, and judge for yourself.",
      links: [{ phrase: 'sample report', href: '/seo/sample-report' }],
    },
    {
      question: 'How much does SEO cost for a tradie in Perth?',
      answer: `An Essentials audit is ${prices.essentials}, Plus is ${prices.plus} and Complete is ${prices.complete}, each paid once with no subscription. It's a fraction of the monthly retainer most agencies charge trades. Our guide to what SEO costs in Perth sets the audits beside the monthly retainers and paid clicks Perth firms publish prices for.`,
      links: [{ phrase: 'what SEO costs in Perth', href: '/seo-cost-perth' }],
    },
    {
      question: 'Do you offer monthly SEO packages for tradies?',
      answer:
        "No retainers and no lock-in contract. Each audit is one written report, paid once. If you'd rather not make the changes yourself, any recommendation can come with a fixed implementation price.",
    },
    {
      question: "Why isn't my trade business showing up on Google Maps?",
      answer:
        "Usually one of a few things: Google can't reach or add the page, it can't tell your site and your Business Profile are the same business, your service area isn't set to the suburbs you work in, or the page doesn't answer what people are searching. The audits check for exactly these and rank what to fix first. Our guide to why a business isn't showing up on Google covers each one.",
      links: [
        {
          phrase: "why a business isn't showing up on Google",
          href: '/business-not-showing-up-on-google',
        },
      ],
    },
    {
      question: 'Is SEO still worth it for tradies now AI answers questions?',
      answer:
        'Yes. When someone asks an AI for a plumber or an electrician nearby, the answer is built from the same pages search ranks, and it cites the sites that are clear, fast and easy to read. Every audit checks whether AI crawlers can read your site and whether AI answers mention you. Our guide to showing up in AI search has the checklist.',
      links: [{ phrase: 'showing up in AI search', href: '/how-to-show-up-in-ai-search' }],
    },
    {
      question: 'What does each tradie SEO audit include?',
      answer:
        "What each one reads. Essentials reads your site on a computer and a phone, its speed, the search results and the trades that outrank you, and your Search Console. Plus adds your Google Business Profile, your reviews and your rivals', and your website analytics. Complete adds your Google Ads account and an audit of your site for legal concerns under the Australian rules that apply to it.",
    },
    {
      question: 'Can you optimise the Google Business Profile for my trade?',
      answer: `Yes, as a separate job. The Plus audit reads your Business Profile and says what to change; Google Business Profile optimisation is the change itself, made in your profile by us for ${money(GBP_OPTIMISATION_PRICE)}, paid once: categories, services and prices, photos of your work, posts, review replies and links that agree with your site.`,
      links: [
        {
          phrase: 'Google Business Profile optimisation',
          href: '/google-business-profile-optimisation',
        },
      ],
    },
    {
      question: 'Does a tradie SEO audit cover technical SEO?',
      answer:
        'Yes. Every audit reads your site on a computer and a phone and checks whether Google can reach and index each service page, how fast the pages load, structured data, broken links and redirects, and what Search Console reports about them. Each fault found becomes a recommendation, ranked beside the rest.',
    },
    {
      question: 'What access do you need to my trade website?',
      answer:
        "Essentials needs only Google Search Console and a short brief about the work you do and the suburbs you cover. Plus also needs your Google Business Profile and your website analytics. Complete adds your Google Ads account and, if you can share it, a count of the calls or jobs that came in. Everything is read-only: we can't edit your site, your profile or your ads, and we don't install anything.",
    },
    {
      question: 'How long does an SEO audit for a trade business take?',
      answer:
        'Usually the report is back within seven days of getting access. A larger site, or one with a lot of search traffic to read, can take longer, and we say so up front.',
    },
    {
      question: 'Should tradies keep paying for Google Ads?',
      answer:
        "Ads are useful while your rankings catch up, but every ad click is rented: it stops when the budget does. Each audit shows the local searches you're closest to winning organically. If you're also paying for clicks on those searches, they're the first places to earn the job instead of buying it.",
    },
    {
      question: "Can I get a tradie SEO audit if I'm not in Perth?",
      answer:
        "Yes. The audit is written from your site and your search data, so it's delivered the same way anywhere in Australia. We work primarily in Perth and have clients in cities across the country. Local results, Google Maps and the suburbs or regions you work in are part of every audit, wherever you are.",
    },
  ],
  callTitle: 'Ready for more jobs from Google?',
};

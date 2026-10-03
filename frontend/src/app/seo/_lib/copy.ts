import { type PublicSiteSettings } from '@/lib/api';
import { formatMoney } from '@/lib/formatting';
import type { FaqItem } from '@/types/FaqItem';

/** Built per request so the cost answer quotes the prices the admin has set. */
export function seoFaqs(settings: PublicSiteSettings): FaqItem[] {
  const audit = formatMoney(settings.seo_oneoff_price, { cents: 'auto' });
  const cycle = formatMoney(settings.seo_subscription_price, { cents: 'auto' });

  return [
    {
      question: 'Can I do SEO myself?',
      answer:
        "Yes, and that's the idea. Every recommendation is written in plain English so you, your IT person or whatever platform you already use (GoDaddy, Wix, Squarespace and the rest) can make the change. If you'd rather we did it, each one can come with a fixed implementation price.",
    },

    {
      question: 'How much does SEO cost in Perth?',
      answer: `An SEO audit is ${audit}, once. A subscription is ${cycle} a report. Either way, it's a fraction of a typical agency retainer.`,
    },

    {
      question: "Why isn't my business showing up on Google?",
      answer:
        "Usually one of a few things: Google can't reach or add the page, it can't tell your site and your Business Profile are the same business, or the page doesn't answer what people are searching. The 23 foundation checks look for exactly these, and the first cycle ranks what to fix first.",
    },

    {
      question: 'Is SEO still worth it now AI answers questions?',
      answer:
        'Yes. AI answers are built from the same pages search ranks, and they cite the sites that are clear, fast and easy to read. Every cycle checks whether AI crawlers can read your site and whether AI answers mention you.',
    },

    {
      question: "What's the difference between an SEO audit and a subscription?",
      answer:
        'An SEO audit is a single full round: the analysis, the foundation checks and ranked recommendations. A subscription repeats it, and every recommendation you implement becomes an experiment, so each cycle shows what worked and what to drop. It also costs less per cycle.',
    },

    {
      question: 'What access do you actually need?',
      answer:
        "Google Search Console, your Google Business Profile and your website analytics, plus a count of the enquiries or sales that came in and a short brief about what you sell and where. Everything is read-only: we can't edit your site, your profile or your ads, and we don't install anything.",
    },

    {
      question: 'Should we keep paying for Google Ads?',
      answer:
        "Ads are useful while your rankings catch up, but every ad click is rented: it stops when the budget does. Each cycle shows the searches you're closest to winning organically. If you're also paying for clicks on those searches, they're the first places to earn the click instead of buying it.",
    },

    {
      question: 'Do you only work with Perth businesses?',
      answer:
        'No. We work primarily in Perth, and we also have clients in cities across Australia. Local results, Google Maps and the suburbs or regions you serve are part of every cycle, wherever you are.',
    },
  ];
}

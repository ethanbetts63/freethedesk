import { type PublicSiteSettings } from '@/lib/api';
import { formatMoney } from '@/lib/formatting';
import type { FaqItem } from '@/types/FaqItem';

import { buildSeoPlans } from '@/app/seo/_lib/plans';

/** The share a partner keeps of each audit sold with their code. */
export const PARTNER_SHARE = 0.5;

/** The audit a partner gets free: the recommended one. */
export const FREE_AUDIT_CODE = 'plus';

export interface PartnerEarning {
  code: string;
  name: string;
  /** What the listener pays. */
  price: string;
  /** What the partner keeps of it. */
  share: string;
}

/** Each audit beside the partner's half of it, from the prices the admin has set. */
export function partnerEarnings(settings: PublicSiteSettings): PartnerEarning[] {
  return buildSeoPlans(settings).map((plan) => ({
    code: plan.code,
    name: plan.name,
    price: plan.price,
    share: formatMoney(Number(settings[`seo_${plan.code}_price`]) * PARTNER_SHARE, {
      cents: 'auto',
    }),
  }));
}

export function partnerFaqs(settings: PublicSiteSettings): FaqItem[] {
  const earnings = partnerEarnings(settings);
  const byCode = Object.fromEntries(earnings.map((earning) => [earning.code, earning]));
  const lowest = earnings[0];
  const highest = earnings[earnings.length - 1];
  const free = byCode[FREE_AUDIT_CODE];

  return [
    {
      question: 'How much do I earn?',
      answer: `Half of every audit bought with your code: ${earnings
        .map((earning) => `${earning.share} for ${earning.name}`)
        .join(', ')}. It's paid out through Stripe once the audit is paid for.`,
    },
    {
      question: 'Is my own audit really free?',
      answer: `Yes. Sign up and we write you the ${free.name} audit, which customers pay ${free.price} for, about whichever website you give us. You're not committing to recommend us afterwards. Read it first, then decide.`,
    },
    {
      question: 'What do my listeners get?',
      answer:
        "A written SEO report of their website: where they show up on Google and in AI answers, who's beating them and why, and the changes worth making first, in order. Every recommendation is written so they or their IT person can make the change. The sample report shows a whole one.",
      links: [{ phrase: 'sample report', href: '/seo/sample-report' }],
    },
    {
      question: 'How do you know a sale came from me?',
      answer:
        'Your listeners enter your code at checkout. It gives them a discount and marks the audit as yours, so every one bought with it counts, whenever they buy it.',
    },
    {
      question: 'Do my listeners have to be in Australia?',
      answer: `No. We're in Perth, Western Australia, and the audit works for any English-language website anywhere. Prices are in Australian dollars, from ${lowest.price} to ${highest.price}.`,
    },
    {
      question: "What if there's no business behind my podcast?",
      answer:
        "Then we audit the podcast's own website. A show is found on Google the same way a business is, and the report says what would bring more listeners in from search.",
    },
    {
      question: 'Does it cost me anything?',
      answer:
        'No. There is no fee to join, no minimum to sell and nothing to buy. The only thing we ask is that you read your own audit before you recommend one.',
    },
  ];
}

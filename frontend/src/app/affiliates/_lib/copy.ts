import { type PublicSiteSettings } from '@/lib/api';
import { formatMoney } from '@/lib/formatting';
import type { FaqItem } from '@/types/FaqItem';

import { buildSeoPlans } from '@/app/seo/_lib/plans';

/**
 * The share an affiliate keeps of each audit sold with their code, as a fraction. The live
 * number is the admin's `affiliate_share_percent`; this is what the copy assumes when the
 * settings have not loaded, and what "Keep half" is written around.
 */
export const AFFILIATE_SHARE = 0.5;

/** The affiliate's share as a fraction, from the admin's setting. */
export function shareFraction(settings: PublicSiteSettings): number {
  const percent = Number(settings.affiliate_share_percent);
  return Number.isFinite(percent) && percent > 0 ? percent / 100 : AFFILIATE_SHARE;
}

/** "Half" when the share is half, else the percentage, for sentences that name it. */
export function shareWord(settings: PublicSiteSettings): string {
  const fraction = shareFraction(settings);
  return fraction === 0.5 ? 'Half' : `${Math.round(fraction * 100)}%`;
}

/** The listener's discount off an audit bought with a code, a whole percentage. */
export function discountPercent(settings: PublicSiteSettings): number {
  return Number(settings.affiliate_discount_percent) || 20;
}

/** The audit an affiliate gets free: the recommended one. */
export const FREE_AUDIT_CODE = 'plus';

export interface AffiliateEarning {
  code: string;
  name: string;
  /** What the listener pays. */
  price: string;
  /** What the affiliate keeps of it. */
  share: string;
}

/** What the listener pays for an audit with a code: the price less the discount. */
export function paidWithCode(settings: PublicSiteSettings, price: number): number {
  return price * (1 - discountPercent(settings) / 100);
}

/** Each audit beside the affiliate's half of what the listener pays for it, from the admin's prices. */
export function affiliateEarnings(settings: PublicSiteSettings): AffiliateEarning[] {
  return buildSeoPlans(settings).map((plan) => ({
    code: plan.code,
    name: plan.name,
    price: plan.price,
    share: formatMoney(
      paidWithCode(settings, Number(settings[`seo_${plan.code}_price`])) * shareFraction(settings),
      { cents: 'auto' },
    ),
  }));
}

export function affiliateFaqs(settings: PublicSiteSettings): FaqItem[] {
  const earnings = affiliateEarnings(settings);
  const byCode = Object.fromEntries(earnings.map((earning) => [earning.code, earning]));
  const lowest = earnings[0];
  const highest = earnings[earnings.length - 1];
  const free = byCode[FREE_AUDIT_CODE];

  return [
    {
      question: 'How much do I earn?',
      answer: `${shareWord(settings)} of what they pay for every audit bought with your code, after their ${discountPercent(settings)}% off: ${earnings
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
      answer: `Your listeners enter your code at checkout. It gives them ${discountPercent(settings)}% off and marks the audit as yours, so every one bought with it counts, whenever they buy it.`,
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

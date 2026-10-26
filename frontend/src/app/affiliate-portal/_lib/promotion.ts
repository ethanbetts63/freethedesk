import type { AffiliateAccount } from '@/lib/affiliateApi';
import type { PublicSiteSettings } from '@/lib/api';
import { formatMoney } from '@/lib/formatting';

import { buildSeoPlans } from '@/app/seo/_lib/plans';

export interface PromotionPiece {
  title: string;
  /** Where it goes and how long it is. */
  note: string;
  text: string;
}

const money = (value: string) => formatMoney(value, { cents: 'auto' });

/**
 * Marketing material, written around the affiliate's own code and the live prices. Plain text
 * so it pastes anywhere.
 */
export function promotionPieces(
  account: AffiliateAccount,
  settings: PublicSiteSettings,
): PromotionPiece[] {
  const plans = buildSeoPlans(settings);
  const lowest = plans[0];
  const highest = plans[plans.length - 1];
  const { code, discount_percent: discount, share_link: link } = account;
  const prices = `from ${money(settings.seo_essentials_price)} to ${money(settings.seo_complete_price)}`;

  return [
    {
      title: 'The on-air read',
      note: 'About 30 seconds. Say the code twice.',
      text:
        `If you run a business, here's something worth a look. freethedesk writes SEO audits: a written report on where your website shows up on Google and in AI answers, who's beating you and why, and the changes worth making first, in order. Every recommendation is written so you or your IT person can make the change.\n\n` +
        `Listeners of this show get ${discount}% off with the code ${code}. That's ${code} at freethedesk.com.au.`,
    },
    {
      title: 'Show notes',
      note: 'Two sentences and the link.',
      text: `SEO audit for your business: freethedesk writes a report on where your site shows up on Google, who outranks you and the fixes that matter most. ${discount}% off with the code ${code}: ${link}`,
    },
    {
      title: 'Newsletter',
      note: 'A paragraph for the next issue.',
      text: `A quick one for anyone with a business website. freethedesk, a Perth SEO studio, writes audits: a report on where your website appears on Google and in AI search, which competitors are ahead and why, and the changes worth making first. The audits are ${prices} and bought once, no subscription. Use the code ${code} for ${discount}% off at ${link}.`,
    },
    {
      title: 'Social post',
      note: 'Fits in one post. Add your own line about why you rate it.',
      text: `Want to know why your competitors outrank you? freethedesk writes SEO audits that tell you, with the fixes in order. ${discount}% off with my code ${code}: ${link}`,
    },
    {
      title: 'The one-liner',
      note: 'For a quick mention or a reply.',
      text: `${discount}% off a freethedesk SEO audit with ${code}: ${link}. Audits run ${lowest.price} to ${highest.price}.`,
    },
  ];
}

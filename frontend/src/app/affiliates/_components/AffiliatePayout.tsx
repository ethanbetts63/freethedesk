import { SplitFeatureSection } from '@/components/SplitFeatureSection';
import { type PublicSiteSettings } from '@/lib/api';
import { formatMoney } from '@/lib/formatting';

import { PRICE_FIELD, type SeoPlanCode } from '@/app/seo/_lib/plans';
import { AFFILIATE_SHARE, affiliateEarnings } from '../_lib/copy';
import { AffiliatePayoutCard } from './AffiliatePayoutCard';

export function AffiliatePayout({
  eyebrow,
  settings,
}: {
  eyebrow: string;
  settings: PublicSiteSettings;
}) {
  const earnings = affiliateEarnings(settings);
  // The card shows one of each audit: the total is half of all three prices.
  const total = formatMoney(
    earnings.reduce(
      (sum, earning) => sum + Number(settings[PRICE_FIELD[earning.code as SeoPlanCode]]),
      0,
    ) * AFFILIATE_SHARE,
    { cents: 'auto' },
  );
  return (
    <SplitFeatureSection
      id="paid"
      eyebrow={eyebrow}
      title="Paid monthly."
      accentTitle="Through Stripe."
      description="Every audit bought with your code is listed against it the day it's paid for. At the start of each month, half of the month's sales goes to your bank account through Stripe, with a statement of which audits it came from. No invoices to send and no minimum to reach."
      visual={<AffiliatePayoutCard earnings={earnings} total={total} />}
      textSide="left"
      background="white"
      spacing="joined"
    />
  );
}

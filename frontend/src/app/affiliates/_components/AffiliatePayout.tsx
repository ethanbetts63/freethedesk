import { SplitFeatureSection } from '@/components/SplitFeatureSection';
import { type PublicSiteSettings } from '@/lib/api';
import { formatMoney } from '@/lib/formatting';

import { buildSeoPlans, PRICE_FIELD } from '@/app/seo/_lib/plans';
import { shareFraction } from '../_lib/copy';
import { AffiliatePayoutCard, type PayoutRow } from './AffiliatePayoutCard';

/** The example fortnight: how many of each audit the code sold. */
const QUANTITY: Record<string, number> = { essentials: 5, plus: 2, complete: 1 };

export function AffiliatePayout({
  eyebrow,
  settings,
}: {
  eyebrow: string;
  settings: PublicSiteSettings;
}) {
  const share = shareFraction(settings);
  let sum = 0;
  const rows: PayoutRow[] = buildSeoPlans(settings).map((plan) => {
    const quantity = QUANTITY[plan.code] ?? 1;
    const amount = Number(settings[PRICE_FIELD[plan.code]]) * share * quantity;
    sum += amount;
    return {
      name: `${plan.name} audit`,
      quantity,
      amount: formatMoney(amount, { cents: 'auto' }),
    };
  });
  const total = formatMoney(sum, { cents: 'auto' });

  return (
    <SplitFeatureSection
      id="paid"
      eyebrow={eyebrow}
      title="Paid fortnightly."
      accentTitle="Through Stripe."
      description="Every sale with your code is listed the day it's paid for. Every second Friday, half goes to your bank through Stripe. No invoices, no minimum."
      visual={<AffiliatePayoutCard rows={rows} total={total} />}
      textSide="right"
      background="white"
      spacing="joined"
    />
  );
}

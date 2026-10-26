import type { AffiliateCommission } from '@/lib/affiliateApi';
import { monthOf, recentMonths } from '@/components/dashboard/charts/format';

/** How far back the portal's charts look. */
export const CHART_MONTHS = 12;

/** The affiliate's sales by month: how many earned something, and what they earned. */
export function monthlySales(commissions: AffiliateCommission[]) {
  const months = recentMonths(CHART_MONTHS);
  const count = months.map(() => 0);
  const earned = months.map(() => 0);
  for (const commission of commissions) {
    if (commission.status === 'void') continue;
    const index = months.indexOf(monthOf(commission.created_at));
    if (index === -1) continue;
    count[index] += 1;
    earned[index] += Number(commission.amount);
  }
  return { months, count, earned };
}

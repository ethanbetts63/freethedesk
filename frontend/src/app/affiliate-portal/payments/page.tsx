'use client';

import {
  adminTableClassName,
  adminTableWrapClassName,
  adminThClassName,
} from '@/components/dashboard/AdminList';
import { LineChart } from '@/components/dashboard/charts/LineChart';
import { recentMonths } from '@/components/dashboard/charts/format';
import { cardClassName, cardTitleClassName } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';
import { formatMoney } from '@/lib/formatting';

import { CHART_MONTHS } from '../_lib/monthly';
import { useAffiliateAccount } from '../_lib/useAffiliateAccount';

const money = (value: string) => formatMoney(value, { cents: 'auto' });

/**
 * Payouts are not built yet (see the Commission model's note): nothing has been
 * transferred, so the table and the chart are empty. When payouts exist they
 * list here, one row per Stripe transfer, with the sales each one settled.
 */
export default function AffiliatePortalPaymentsPage() {
  const { account, error, loading } = useAffiliateAccount();

  if (loading)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading your payments…</p>
      </div>
    );
  if (error && !account)
    return (
      <div className={pageClassName}>
        <Notice tone="danger">{error}</Notice>
      </div>
    );
  if (!account) return null;

  const months = recentMonths(CHART_MONTHS);

  return (
    <div className={pageClassName}>
      <PageHeader
        title="Payments"
        subtitle={`${money(account.earnings.owed)} owed to you, ${money(account.earnings.paid)} paid out so far. Payouts go out every second Friday through Stripe.`}
      />

      <LineChart
        title="Paid to you each month"
        description="Every payout to your bank, by the month it was sent."
        months={months}
        lines={[{ key: 'paid', label: 'Paid out', values: months.map(() => 0) }]}
        format="money"
        emptyMessage="No payouts yet. The first goes out the fortnight after your first sale is owed."
      />

      <section className={cardClassName}>
        <h2 className={cardTitleClassName}>Every payout</h2>
        <div className={adminTableWrapClassName}>
          <table className={adminTableClassName}>
            <thead>
              <tr>
                <th className={adminThClassName}>Date</th>
                <th className={adminThClassName}>Amount</th>
                <th className={adminThClassName}>Sales covered</th>
                <th className={adminThClassName}>Reference</th>
              </tr>
            </thead>
          </table>
        </div>
        <p className="m-0 mt-m text-label text-text-subtle">
          No payouts yet. We will email you to set up your payout account before the first one.
        </p>
      </section>
    </div>
  );
}

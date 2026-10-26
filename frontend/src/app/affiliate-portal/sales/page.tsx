'use client';

import { StatusPill } from '@/components/dashboard/StatusPill';
import {
  adminTableClassName,
  adminTableWrapClassName,
  adminTdClassName,
  adminThClassName,
} from '@/components/dashboard/AdminList';
import { LineChart } from '@/components/dashboard/charts/LineChart';
import { cardClassName, cardTitleClassName } from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';
import { formatDate, formatMoney } from '@/lib/formatting';

import { monthlySales } from '../_lib/monthly';
import { useAffiliateAccount } from '../_lib/useAffiliateAccount';

const money = (value: string) => formatMoney(value, { cents: 'auto' });

export default function AffiliatePortalSalesPage() {
  const { account, error, loading } = useAffiliateAccount();

  if (loading)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading your sales…</p>
      </div>
    );
  if (error && !account)
    return (
      <div className={pageClassName}>
        <Notice tone="danger">{error}</Notice>
      </div>
    );
  if (!account) return null;

  const { months, earned } = monthlySales(account.commissions);
  const { sales, owed, paid } = account.earnings;

  return (
    <div className={pageClassName}>
      <PageHeader
        title="Sales"
        subtitle={`${sales} audit${sales === 1 ? '' : 's'} bought with your codes. ${money(owed)} owed to you, ${money(paid)} paid out.`}
      />

      <LineChart
        title="What you earned each month"
        description={`Your ${account.share_percent}% of every audit bought with your codes, by the month it was paid for.`}
        months={months}
        lines={[{ key: 'earned', label: 'Earned', values: earned }]}
        format="money"
        emptyMessage="No sales yet. Each one appears here the moment it is paid for."
      />

      <section className={cardClassName}>
        <h2 className={cardTitleClassName}>Every sale</h2>
        {account.commissions.length ? (
          <div className={adminTableWrapClassName}>
            <table className={adminTableClassName}>
              <thead>
                <tr>
                  <th className={adminThClassName}>Date</th>
                  <th className={adminThClassName}>Audit</th>
                  <th className={adminThClassName}>They paid</th>
                  <th className={adminThClassName}>Your share</th>
                  <th className={adminThClassName}>Status</th>
                  <th className={adminThClassName}>Note</th>
                </tr>
              </thead>
              <tbody>
                {account.commissions.map((commission) => (
                  <tr key={commission.id}>
                    <td className={adminTdClassName}>{formatDate(commission.created_at)}</td>
                    <td className={adminTdClassName}>{commission.description}</td>
                    <td className={adminTdClassName}>{money(commission.sale_amount)}</td>
                    <td className={`${adminTdClassName} font-heavy text-text-primary`}>
                      {money(commission.amount)}
                    </td>
                    <td className={adminTdClassName}>
                      <StatusPill status={commission.status} />
                    </td>
                    <td className={adminTdClassName}>{commission.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="m-0 text-label text-text-subtle">
            No audits bought with your codes yet. Each one appears here the moment it is paid for,
            and we email you too.
          </p>
        )}
      </section>
    </div>
  );
}

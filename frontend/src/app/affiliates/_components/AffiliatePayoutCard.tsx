import { LiveDot } from '@/components/visuals/ChecklistCard';

import type { AffiliateEarning } from '../_lib/copy';

/**
 * A month's payout as the affiliate sees it: one row per audit bought with
 * their code, and the total that Stripe pays out. The amounts are the live
 * shares, so the card follows the admin's prices.
 */
export function AffiliatePayoutCard({
  earnings,
  total,
}: {
  earnings: readonly AffiliateEarning[];
  total: string;
}) {
  const byCode = Object.fromEntries(earnings.map((earning) => [earning.code, earning]));
  const rows = [
    { earning: byCode.plus, day: '3 Oct' },
    { earning: byCode.essentials, day: '11 Oct' },
    { earning: byCode.complete, day: '24 Oct' },
  ].filter((row) => row.earning);

  return (
    <div
      className="moving-colour-border bg-surface-page"
      role="img"
      aria-label={`An example month: three audits bought with the code, paying ${total} in total.`}
    >
      <div className="flex items-center gap-s border-b border-border-subtle px-l py-m">
        <LiveDot />
        <span className="text-label font-strong tracking-label text-text-muted uppercase">
          October
        </span>
        <span className="ml-auto text-label font-strong tracking-label text-text-subtle uppercase">
          Code TRADIE20
        </span>
      </div>
      <ol className="m-0 list-none p-0">
        {rows.map(({ earning, day }) => (
          <li
            key={earning.code}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-m border-b border-border-subtle px-l py-m"
          >
            <span>
              <strong className="block text-body-sm text-text-secondary">
                {earning.name} audit
              </strong>
              <small className="mt-4xs block text-label leading-[1.4] text-text-muted">
                {earning.price} paid · {day}
              </small>
            </span>
            <span className="text-lead tracking-[-0.03em] text-text-secondary">
              {earning.share}
            </span>
          </li>
        ))}
      </ol>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-m bg-surface-tint px-l py-m">
        <span>
          <strong className="block text-body-sm text-text-secondary">Paid to you</strong>
          <small className="mt-4xs block text-label leading-[1.4] text-text-muted">
            1 November · Stripe
          </small>
        </span>
        <span className="text-title leading-none tracking-[-0.05em]">
          <span className="moving-colour-text">{total}</span>
        </span>
      </div>
    </div>
  );
}

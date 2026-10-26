'use client';

import { Button } from '@/components/ui/Button';
import {
  DetailItem,
  cardClassName,
  cardTitleClassName,
  cardWideClassName,
  detailGridClassName,
  detailListClassName,
  messageBodyClassName,
} from '@/components/ui/Card';
import { Notice } from '@/components/ui/Notice';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';
import { useAuth } from '@/context/AuthContext';
import type { AffiliateAccount } from '@/lib/affiliateApi';
import { formatDateTime, formatMoney } from '@/lib/formatting';
import { cn } from '@/lib/utils';

import { useAffiliateAccount } from '../_lib/useAffiliateAccount';

/** Only the statuses that need explaining; an active affiliate just gets on with it. */
const statusCopy: Partial<Record<AffiliateAccount['status'], { heading: string; body: string }>> = {
  suspended: {
    heading: 'This account is suspended.',
    body: 'Your code no longer works at checkout and nothing new is earned. Reply to our email or contact us and we will sort out what happened.',
  },
  denied: {
    heading: 'We could not keep this account open.',
    body: 'That is usually something specific. Reply to our email or contact us and we will explain where it stands.',
  },
};

const money = (value: string) => formatMoney(value, { cents: 'auto' });

export default function AffiliatePortalOverviewPage() {
  const { user } = useAuth();
  const { account, error, loading } = useAffiliateAccount();

  if (loading)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading your account…</p>
      </div>
    );
  if (error && !account)
    return (
      <div className={pageClassName}>
        <Notice tone="danger">{error}</Notice>
      </div>
    );
  if (!account) return null;

  const message = statusCopy[account.status];
  const recent = account.commissions.slice(0, 5);

  return (
    <div className={pageClassName}>
      <PageHeader title={account.business_name} subtitle={`Signed in as ${user?.email}`} />

      <div className={detailGridClassName}>
        {message && (
          <section className={cn(cardClassName, cardWideClassName)}>
            <h2 className={cardTitleClassName}>{message.heading}</h2>
            <p className={messageBodyClassName}>{message.body}</p>
          </section>
        )}

        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Earnings</h2>
          <dl className={detailListClassName}>
            <DetailItem term="Audits sold">{account.earnings.sales}</DetailItem>
            <DetailItem term="Your share">{account.share_percent}% of what they pay</DetailItem>
            <DetailItem term="Owed to you">{money(account.earnings.owed)}</DetailItem>
            <DetailItem term="Paid out">{money(account.earnings.paid)}</DetailItem>
          </dl>
          <p className="text-label text-text-subtle">
            Paid out through Stripe. We will email you to set up your payout account before the
            first one.
          </p>
        </section>

        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Your free audit</h2>
          <p className={messageBodyClassName}>
            The Plus audit, about your own website. It starts once you give us read-only access to
            Search Console; the rest of the tools make it better.
          </p>
          <Button href="/affiliate-portal/audit">Set up your audit →</Button>
        </section>

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Recent sales</h2>
          {recent.length ? (
            <ul className="m-0 flex list-none flex-col gap-s p-0">
              {recent.map((commission) => (
                <li
                  key={commission.id}
                  className="flex flex-wrap items-baseline justify-between gap-s border-t border-border-default pt-s text-body"
                >
                  <span>
                    {commission.description}
                    <span className="ml-s text-label text-text-subtle">
                      {formatDateTime(commission.created_at)}
                    </span>
                  </span>
                  <span className="font-heavy">
                    {money(commission.amount)}{' '}
                    <span className="font-normal text-text-subtle">
                      · {commission.status_label.toLowerCase()}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-label text-text-subtle">
              No audits bought with your code yet. Each one appears here the moment it is paid, and
              we email you too.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

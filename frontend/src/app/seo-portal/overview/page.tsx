'use client';

import { useEffect, useState } from 'react';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { useAuth } from '@/context/AuthContext';

import { getSeoAccount, getSeoSetup, type SeoAccount, type SeoSetup } from '@/lib/seoApi';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Notice';
import {
  DetailItem,
  cardClassName,
  cardLabelClassName,
  cardTitleClassName,
  cardWideClassName,
  detailGridClassName,
  detailListClassName,
  messageBodyClassName,
  statusCardClassName,
  statusCardLabelGroupClassName,
} from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';
import { formatDateTime } from '@/lib/formatting';

/** Only the statuses that need explaining; an active account just gets on with setup. */
const statusCopy: Partial<Record<SeoAccount['status'], { heading: string; body: string }>> = {
  suspended: {
    heading: 'This account is suspended.',
    body: 'You can still sign in, but audits are paused. Get in touch and we will sort out what happened.',
  },
  denied: {
    heading: 'We could not approve this account.',
    body: 'That is usually something specific and fixable. Reply to our email or contact us and we will explain where it stands.',
  },
};

export default function SeoPortalOverviewPage() {
  const { user } = useAuth();
  const [account, setAccount] = useState<SeoAccount | null>(null);
  const [setup, setSetup] = useState<SeoSetup | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSeoAccount()
      .then(async (loaded) => {
        setAccount(loaded);
        if (loaded.payment_status === 'active' || loaded.payment_status === 'paid')
          setSetup(await getSeoSetup());
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Your account could not be loaded.'),
      )
      .finally(() => setLoading(false));
  }, []);

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
  const done = setup?.steps.filter((step) => step.state !== 'not_started').length ?? 0;

  return (
    <div className={pageClassName}>
      <PageHeader
        kicker="SEO portal"
        title={account.business_name}
        subtitle={`Signed in as ${user?.email}`}
      />

      <div className={detailGridClassName}>
        <section className={statusCardClassName}>
          <div className={statusCardLabelGroupClassName}>
            <p className={cardLabelClassName}>Account status</p>
            <StatusPill status={account.status} />
          </div>
        </section>

        {message && (
          <section className={cn(cardClassName, cardWideClassName)}>
            <h2 className={cardTitleClassName}>{message.heading}</h2>
            <p className={messageBodyClassName}>{message.body}</p>
          </section>
        )}

        {setup && (
          <section className={cn(cardClassName, cardWideClassName)}>
            <h2 className={cardTitleClassName}>Setup</h2>
            <p className={messageBodyClassName}>
              {setup.complete
                ? 'Search Console is connected, so your first audit is under way.'
                : 'Your first audit starts once Search Console is connected.'}{' '}
              {done} of {setup.steps.length} tools set up.
            </p>
            <Button href="/seo-portal/setup">
              {setup.complete ? 'Review setup →' : 'Continue setup →'}
            </Button>
          </section>
        )}

        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Your details</h2>
          <dl className={detailListClassName}>
            <DetailItem term="Business">{account.business_name}</DetailItem>
            <DetailItem term="Contact">{account.contact_name}</DetailItem>
            <DetailItem term="Email">{account.email}</DetailItem>
            <DetailItem term="Phone">{account.phone || 'Not supplied'}</DetailItem>
            <DetailItem term="Website">{account.website || 'Not supplied'}</DetailItem>
          </dl>
          <Button variant="secondary" href="/seo-portal/account">
            Edit details
          </Button>
        </section>

        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Account</h2>
          <dl className={detailListClassName}>
            <DetailItem term="Plan">{account.plan_label}</DetailItem>
            <DetailItem term="Payment">{account.payment_status_label}</DetailItem>
            <DetailItem term="Status">{account.status_label}</DetailItem>
            <DetailItem term="Signed up">{formatDateTime(account.created_at)}</DetailItem>
            <DetailItem term="Last updated">{formatDateTime(account.updated_at)}</DetailItem>
          </dl>
          <p className="text-label text-text-subtle">
            Questions? <a href="mailto:hello@freethedesk.com.au">hello@freethedesk.com.au</a>
          </p>
        </section>
      </div>
    </div>
  );
}

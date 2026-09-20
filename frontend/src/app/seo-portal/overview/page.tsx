'use client';

import { useEffect, useState } from 'react';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { useAuth } from '@/context/AuthContext';

import { getSeoAccount, type SeoAccount } from '@/lib/seoApi';
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
import { PortalStep, PortalSteps } from '@/components/dashboard/PortalSteps';
import { PageHeader } from '@/components/ui/PageHeader';
import { pageClassName } from '@/components/ui/layout';
import { formatDateTime } from '@/lib/formatting';

const statusCopy: Record<SeoAccount['status'], { heading: string; body: string }> = {
  pending: {
    heading: 'We are getting your account ready.',
    body: 'We check every new account by hand before switching it on — usually within a business day. There is nothing for you to do in the meantime, and we will email you the moment it is done.',
  },
  active: {
    heading: 'Your account is active.',
    body: 'Connect your Search Console data and tell us what to focus the reporting on. Your first report follows once that is in.',
  },
  suspended: {
    heading: 'This account is suspended.',
    body: 'You can still sign in, but reporting is paused. Get in touch and we will sort out what happened.',
  },
  denied: {
    heading: 'We could not approve this account.',
    body: 'That is usually something specific and fixable. Reply to our email or contact us and we will explain where it stands.',
  },
};

export default function SeoPortalOverviewPage() {
  const { user } = useAuth();
  const [account, setAccount] = useState<SeoAccount | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSeoAccount()
      .then(setAccount)
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

  const hasPaid = account.payment_status === 'active' || account.payment_status === 'paid';
  const isGbpAudit = account.report_type === 'gbp';
  const copy =
    account.payment_status === 'payment_pending'
      ? {
          heading: 'Your account is saved.',
          body: `Your selected ${isGbpAudit ? 'audit' : 'plan'} has not been paid yet. Continue when you are ready; you will not need to enter these signup details again.`,
        }
      : hasPaid && account.status === 'pending'
        ? {
            heading: `Payment confirmed. ${isGbpAudit ? 'Send us your profile.' : 'Connect your data.'}`,
            body: isGbpAudit
              ? 'Add your Google Business Profile link and any local-search context we should know. We can then begin the audit.'
              : 'Add your Search Console property and tell us what to focus on. Your first report follows once we have reviewed the account.',
          }
        : statusCopy[account.status];
  const firstName = account.contact_name.trim().split(/\s+/)[0] || account.contact_name;

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

        {account.payment_status === 'payment_pending' && (
          <section className={cn(cardClassName, cardWideClassName)}>
            <h2 className={cardTitleClassName}>Finish secure payment</h2>
            <p className={messageBodyClassName}>
              Your account is saved. Complete payment to unlock your{' '}
              {isGbpAudit ? 'audit' : 'reporting setup'}.
            </p>
            <Button href="/seo/payment">Continue to payment →</Button>
          </section>
        )}

        {hasPaid && !account.has_usable_password && (
          <section className={cn(cardClassName, cardWideClassName)}>
            <h2 className={cardTitleClassName}>Complete your account</h2>
            <p className={messageBodyClassName}>
              Add your business and contact names, then choose your sign-in password.
            </p>
            <Button href="/seo-portal/account">Complete account setup →</Button>
          </section>
        )}

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Hello {firstName}.</h2>
          <p className={messageBodyClassName}>
            <strong>{copy.heading}</strong>
          </p>
          <p className={messageBodyClassName}>{copy.body}</p>
        </section>

        {hasPaid && (
          <section className={cn(cardClassName, cardWideClassName)}>
            <h2 className={cardTitleClassName}>What happens next</h2>
            <PortalSteps>
              <PortalStep title={isGbpAudit ? 'Send your profile' : 'Connect your data'}>
                {isGbpAudit
                  ? 'Add your Google Business Profile link and primary service location.'
                  : 'Grant access to Search Console and, if relevant, Analytics and your Google Business Profile.'}
              </PortalStep>
              <PortalStep title={isGbpAudit ? 'We review it' : 'Tell us the focus'}>
                {isGbpAudit
                  ? 'We check visibility, completeness, categories, content, reviews and local-search signals.'
                  : 'Target locations, the searches you care about and who you compete with.'}
              </PortalStep>
              <PortalStep title={isGbpAudit ? 'Your audit arrives' : 'Your first report'}>
                A plain-English, ranked action list lands in your inbox.
              </PortalStep>
            </PortalSteps>
            <Button href="/seo-portal/connect">
              {isGbpAudit ? 'Add profile details' : 'Connect your data'} →
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
            <DetailItem term="Report">{account.report_type_label}</DetailItem>
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

'use client';

import { useEffect, useState } from 'react';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { useAuth } from '@/context/AuthContext';

import { getDealerAccount, type DealerAccount } from '@/lib/dealerApi';
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
import { pageClassName } from '@/components/ui/layout';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatDateTime } from '@/lib/formatting';

const statusCopy: Record<DealerAccount['status'], { heading: string; body: string }> = {
  pending: {
    heading: 'We are reviewing your account.',
    body: 'Every dealership is checked by hand before we switch an account on — usually within a business day. There is nothing for you to do in the meantime, and we will email you the moment it is done.',
  },
  active: {
    heading: 'Your account is active.',
    body: 'Setup is the next step: your dealership details, the paperwork we prefill on your behalf and the sale conditions you want to use. We will open that up as each part is ready.',
  },
  suspended: {
    heading: 'This account is suspended.',
    body: 'You can still sign in, but sales are paused. Get in touch and we will sort out what happened.',
  },
  denied: {
    heading: 'We could not approve this account.',
    body: 'That is usually something specific and fixable. Reply to our email or contact us and we will explain where it stands.',
  },
};

export default function PortalOverviewPage() {
  const { user } = useAuth();
  const [account, setAccount] = useState<DealerAccount | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDealerAccount()
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

  const copy =
    account.payment_status === 'active' && account.status === 'pending'
      ? {
          heading: 'Payment confirmed. Set up your dealership.',
          body: 'Add the licence, business and authorised-officer details we need to verify the dealership. Your account can be used for live transactions once that review is complete.',
        }
      : account.payment_status === 'payment_pending'
        ? {
            heading: 'Your account is saved.',
            body: 'Your selected subscription has not been paid yet. Continue when you are ready; you will not need to enter these signup details again.',
          }
        : statusCopy[account.status];
  const firstName = account.contact_name.trim().split(/\s+/)[0] || account.contact_name;

  return (
    <div className={pageClassName}>
      <PageHeader
        kicker="Dealer portal"
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
              Your account is saved. Complete payment to unlock dealership setup and verification.
            </p>
            <Button href="/licensing/payment">Continue to payment →</Button>
          </section>
        )}

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Hello {firstName}.</h2>
          <p className={messageBodyClassName}>
            <strong>{copy.heading}</strong>
          </p>
          <p className={messageBodyClassName}>{copy.body}</p>
        </section>

        {account.payment_status === 'active' && (
          <section className={cn(cardClassName, cardWideClassName)}>
            <h2 className={cardTitleClassName}>What happens next</h2>
            <PortalSteps>
              <PortalStep title="Dealership setup">
                Your licence details and the information that fills the dealer side of every form,
                entered once.
              </PortalStep>
              <PortalStep title="Your sale conditions">
                Read and approve each of our default special conditions, remove any that do not fit
                your dealership and add your own.
              </PortalStep>
              <PortalStep title="Your first sale">
                Enter the vehicle, send the buyer a link, and get back a signed pack ready to lodge.
              </PortalStep>
            </PortalSteps>
            <Button href="/portal/setup">Start dealership setup →</Button>
          </section>
        )}

        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Your details</h2>
          <dl className={detailListClassName}>
            <DetailItem term="Business">{account.business_name}</DetailItem>
            <DetailItem term="Contact">{account.contact_name}</DetailItem>
            <DetailItem term="Email">{account.email}</DetailItem>
            <DetailItem term="Phone">{account.phone || 'Not supplied'}</DetailItem>
            <DetailItem term="State">{account.state_label}</DetailItem>
          </dl>
          <Button variant="secondary" href="/portal/account">
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

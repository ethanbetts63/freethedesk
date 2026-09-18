'use client';

import { useEffect, useState } from 'react';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime } from '@/lib/api';
import { getSeoAccount, type SeoAccount } from '@/lib/seoApi';
import { AdminButton } from '@/components/dashboard/AdminButton';
import { AdminNotice } from '@/components/dashboard/AdminNotice';
import {
  AdminDetailItem,
  adminCardClassName,
  adminCardLabelClassName,
  adminCardTitleClassName,
  adminCardWideClassName,
  adminDetailGridClassName,
  adminDetailListClassName,
  adminMessageBodyClassName,
  adminStatusCardClassName,
  adminStatusCardLabelGroupClassName,
} from '@/components/dashboard/AdminCard';
import { cn } from '@/lib/utils';
import { PortalStep, PortalSteps } from '@/components/dashboard/PortalSteps';
import { AdminPageHeader } from '@/components/dashboard/AdminPageHeader';
import { adminPageClassName } from '@/components/dashboard/adminLayout';

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
      <div className={adminPageClassName}>
        <p className="text-text-subtle">Loading your account…</p>
      </div>
    );
  if (error && !account)
    return (
      <div className={adminPageClassName}>
        <AdminNotice tone="danger">{error}</AdminNotice>
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
    <div className={adminPageClassName}>
      <AdminPageHeader
        kicker="SEO portal"
        title={account.business_name}
        subtitle={`Signed in as ${user?.email}`}
      />

      <div className={adminDetailGridClassName}>
        <section className={adminStatusCardClassName}>
          <div className={adminStatusCardLabelGroupClassName}>
            <p className={adminCardLabelClassName}>Account status</p>
            <StatusPill status={account.status} />
          </div>
        </section>

        {account.payment_status === 'payment_pending' && (
          <section className={cn(adminCardClassName, adminCardWideClassName)}>
            <h2 className={adminCardTitleClassName}>Finish secure payment</h2>
            <p className={adminMessageBodyClassName}>
              Your account is saved. Complete payment to unlock your{' '}
              {isGbpAudit ? 'audit' : 'reporting setup'}.
            </p>
            <AdminButton href="/seo/payment">Continue to payment →</AdminButton>
          </section>
        )}

        {hasPaid && !account.has_usable_password && (
          <section className={cn(adminCardClassName, adminCardWideClassName)}>
            <h2 className={adminCardTitleClassName}>Complete your account</h2>
            <p className={adminMessageBodyClassName}>
              Add your business and contact names, then choose your sign-in password.
            </p>
            <AdminButton href="/seo-portal/account">Complete account setup →</AdminButton>
          </section>
        )}

        <section className={cn(adminCardClassName, adminCardWideClassName)}>
          <h2 className={adminCardTitleClassName}>Hello {firstName}.</h2>
          <p className={adminMessageBodyClassName}>
            <strong>{copy.heading}</strong>
          </p>
          <p className={adminMessageBodyClassName}>{copy.body}</p>
        </section>

        {hasPaid && (
          <section className={cn(adminCardClassName, adminCardWideClassName)}>
            <h2 className={adminCardTitleClassName}>What happens next</h2>
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
            <AdminButton href="/seo-portal/connect">
              {isGbpAudit ? 'Add profile details' : 'Connect your data'} →
            </AdminButton>
          </section>
        )}

        <section className={adminCardClassName}>
          <h2 className={adminCardTitleClassName}>Your details</h2>
          <dl className={adminDetailListClassName}>
            <AdminDetailItem term="Business">{account.business_name}</AdminDetailItem>
            <AdminDetailItem term="Contact">{account.contact_name}</AdminDetailItem>
            <AdminDetailItem term="Email">{account.email}</AdminDetailItem>
            <AdminDetailItem term="Phone">{account.phone || 'Not supplied'}</AdminDetailItem>
            <AdminDetailItem term="Website">{account.website || 'Not supplied'}</AdminDetailItem>
          </dl>
          <AdminButton variant="secondary" href="/seo-portal/account">
            Edit details
          </AdminButton>
        </section>

        <section className={adminCardClassName}>
          <h2 className={adminCardTitleClassName}>Account</h2>
          <dl className={adminDetailListClassName}>
            <AdminDetailItem term="Report">{account.report_type_label}</AdminDetailItem>
            <AdminDetailItem term="Plan">{account.plan_label}</AdminDetailItem>
            <AdminDetailItem term="Payment">{account.payment_status_label}</AdminDetailItem>
            <AdminDetailItem term="Status">{account.status_label}</AdminDetailItem>
            <AdminDetailItem term="Signed up">{formatDateTime(account.created_at)}</AdminDetailItem>
            <AdminDetailItem term="Last updated">
              {formatDateTime(account.updated_at)}
            </AdminDetailItem>
          </dl>
          <p className="text-label text-text-subtle">
            Questions? <a href="mailto:hello@freethedesk.com.au">hello@freethedesk.com.au</a>
          </p>
        </section>
      </div>
    </div>
  );
}

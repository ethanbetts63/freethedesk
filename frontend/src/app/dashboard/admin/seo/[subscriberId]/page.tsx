'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';

import {
  AccountBillingCard,
  AccountContactCard,
  AccountDetailHeader,
  AccountStatusCard,
  RelatedMessagesCard,
  StaffNotesCard,
} from '@/components/dashboard/AccountDetail';
import { useAccountDetail } from '@/components/dashboard/useAccountDetail';
import {
  formatDateTime,
  getSeoSubscriber,
  SEO_SUBSCRIBER_TYPE,
  updateSeoSubscriber,
  type SeoSubscriber,
} from '@/lib/adminApi';
import { Notice } from '@/components/ui/Notice';
import { detailGridClassName } from '@/components/ui/Card';
import { backClassName, pageClassName } from '@/components/ui/layout';
import { SeoSetupCard } from './_components/SeoSetupCard';
import { newInvoiceHref } from '@/app/dashboard/admin/invoices/_lib/invoiceStatus';
import { cardLinkClassName } from '@/components/ui/Card';
import { formatMoney } from '@/lib/formatting';
import type { SeoSale } from '@/lib/seoApi';

const money = (value: string) => formatMoney(value, { cents: 'auto' });

/** What the audit sold for, and the code and affiliate behind the price, once a payment succeeded. */
function saleRows(sale: SeoSale | null | undefined): [string, ReactNode][] {
  if (!sale) return [];
  const rows: [string, ReactNode][] = [
    ['Paid', `${money(sale.amount_paid)} on ${formatDateTime(sale.paid_at)}`],
  ];
  if (sale.discount_code) {
    rows.push([
      'Discount code',
      <span key="code">
        {sale.discount_code} took {money(sale.discount_amount)} off
        {sale.affiliate && (
          <>
            {' · '}
            <Link
              className={cardLinkClassName}
              href={`/dashboard/admin/affiliates/${sale.affiliate.id}`}
            >
              {sale.affiliate.business_name}
            </Link>
          </>
        )}
      </span>,
    ]);
  }
  return rows;
}

export default function SeoSubscriberDetailPage() {
  const id = Number(useParams<{ subscriberId: string }>().subscriberId);
  const { account, messages, notes, setNotes, loading, saving, notice, error, replyHref, save } =
    useAccountDetail<SeoSubscriber>({
      id,
      fetch: getSeoSubscriber,
      update: updateSeoSubscriber,
      relatedType: SEO_SUBSCRIBER_TYPE,
      replySubject: 'Your freethedesk SEO account',
      loadError: 'SEO customer could not be loaded.',
      saveError: 'The SEO customer could not be updated.',
    });

  if (loading)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading SEO customer…</p>
      </div>
    );
  if (error && !account)
    return (
      <div className={pageClassName}>
        <Link className={backClassName} href="/dashboard/admin/seo">
          ← SEO customers
        </Link>
        <Notice tone="danger">{error}</Notice>
      </div>
    );
  if (!account) return null;

  return (
    <div className={pageClassName}>
      <AccountDetailHeader
        backHref="/dashboard/admin/seo"
        backLabel="Back to SEO customers"
        kicker={`SEO customer #${account.id}`}
        title={account.business_name}
        subtitle={
          account.contact_name
            ? `${account.contact_name} · signed up ${formatDateTime(account.created_at)}`
            : `Signed up ${formatDateTime(account.created_at)}`
        }
        actionHref={replyHref}
        actionLabel="Email customer →"
        invoiceHref={newInvoiceHref(SEO_SUBSCRIBER_TYPE, account.id)}
      />

      {error && <Notice tone="danger">{error}</Notice>}
      {notice && <Notice tone="success">{notice}</Notice>}

      <div className={detailGridClassName}>
        <AccountStatusCard
          status={account.status}
          saving={saving}
          onChange={(status) => save({ status }, `Status set to ${status}.`)}
        />

        {/* Payment switches the account on; there is no approval step. */}
        {account.setup && <SeoSetupCard subscriberId={account.id} initial={account.setup} />}

        <AccountContactCard
          account={account}
          extra={[
            ['Website', account.website || 'Not supplied'],
            ['Plan', account.plan_label],
          ]}
        />
        <AccountBillingCard
          account={account}
          statusChangedAt={account.status_changed_at}
          extra={saleRows(account.sale)}
        />

        <StaffNotesCard
          notes={notes}
          saved={account.staff_notes}
          saving={saving}
          onChange={setNotes}
          onSave={() => save({ staff_notes: notes }, 'Notes saved.')}
        />

        <RelatedMessagesCard
          messages={messages}
          replyHref={replyHref}
          emptyLabel="No messages yet."
        />
      </div>
    </div>
  );
}

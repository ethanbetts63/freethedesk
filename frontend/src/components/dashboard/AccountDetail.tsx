'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { formatDateTime, type AdminMessage } from '@/lib/adminApi';
import type { AccountBase, DealerStatus } from '@/lib/api';

import { dealerStatuses, StatusPill, statusLabel } from './StatusPill';
import { Button } from '@/components/ui/Button';
import { formControlClassName } from '@/components/ui/formControl';
import {
  DetailItem,
  cardClassName,
  cardHeadingClassName,
  cardLabelClassName,
  cardLinkClassName,
  cardTitleClassName,
  cardWideClassName,
  detailListClassName,
  statusCardClassName,
  statusCardLabelGroupClassName,
  statusCardSelectClassName,
} from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { backClassName } from '@/components/ui/layout';
import { adminRelatedMessagesClassName } from './adminLayout';

export function AccountStatusCard({
  status,
  saving,
  onChange,
}: {
  status: DealerStatus;
  saving: boolean;
  onChange: (status: DealerStatus) => void;
}) {
  return (
    <section className={statusCardClassName}>
      <div className={statusCardLabelGroupClassName}>
        <p className={cardLabelClassName}>Account status</p>
        <StatusPill status={status} />
      </div>
      <select
        className={statusCardSelectClassName}
        aria-label="Account status"
        value={status}
        disabled={saving}
        onChange={(event) => onChange(event.target.value as DealerStatus)}
      >
        {dealerStatuses.map((value) => (
          <option key={value} value={value}>
            {statusLabel(value)}
          </option>
        ))}
      </select>
    </section>
  );
}

export function AccountApprovalCard({
  heading,
  explanation,
  saving,
  onApprove,
  onDeny,
}: {
  heading: string;
  explanation: string;
  saving: boolean;
  onApprove: () => void;
  onDeny: () => void;
}) {
  return (
    <section className={cn(cardClassName, cardWideClassName)}>
      <h2 className={cardTitleClassName}>{heading}</h2>
      <p className="text-label text-text-subtle">{explanation}</p>
      <div className="flex flex-col flex-wrap items-start gap-l sm:flex-row sm:items-center">
        <Button type="button" disabled={saving} onClick={onApprove}>
          Approve
        </Button>
        <Button variant="secondary" type="button" disabled={saving} onClick={onDeny}>
          Deny
        </Button>
      </div>
    </section>
  );
}

export function DetailCard({ title, rows }: { title: string; rows: [string, ReactNode][] }) {
  return (
    <section className={cardClassName}>
      <h2 className={cardTitleClassName}>{title}</h2>
      <dl className={detailListClassName}>
        {rows.map(([term, value]) => (
          <DetailItem key={term} term={term}>
            {value}
          </DetailItem>
        ))}
      </dl>
    </section>
  );
}

export function AccountContactCard({
  account,
  extra = [],
}: {
  account: AccountBase;
  extra?: [string, ReactNode][];
}) {
  return (
    <DetailCard
      title="Contact"
      rows={[
        ['Business', account.business_name],
        ['Contact', account.contact_name],
        [
          'Email',
          <a className={cardLinkClassName} key="email" href={`mailto:${account.email}`}>
            {account.email}
          </a>,
        ],
        [
          'Phone',
          account.phone ? (
            <a className={cardLinkClassName} key="phone" href={`tel:${account.phone}`}>
              {account.phone}
            </a>
          ) : (
            'Not supplied'
          ),
        ],
        ...extra,
      ]}
    />
  );
}

/** Plan, billing and lifecycle dates. `extra` appends rows. */
export function AccountBillingCard({
  account,
  statusChangedAt,
  extra = [],
}: {
  account: AccountBase;
  statusChangedAt: string | null;
  extra?: [string, ReactNode][];
}) {
  return (
    <DetailCard
      title="Account"
      rows={[
        ['Plan', account.plan_label],
        ['Payment', account.payment_status_label],
        ['Current period ends', formatDateTime(account.subscription_current_period_end)],
        ['Cancels at period end', account.cancel_at_period_end ? 'Yes' : 'No'],
        ['Status', account.status_label],
        ['Status changed', formatDateTime(statusChangedAt)],
        ['Signed up', formatDateTime(account.created_at)],
        ['Last updated', formatDateTime(account.updated_at)],
        ...extra,
      ]}
    />
  );
}

/** Free-text staff notes with a dirty-checked save. */
export function StaffNotesCard({
  notes,
  saved,
  saving,
  onChange,
  onSave,
}: {
  notes: string;
  saved: string;
  saving: boolean;
  onChange: (notes: string) => void;
  onSave: () => void;
}) {
  return (
    <section className={cn(cardClassName, cardWideClassName)}>
      <div className={cardHeadingClassName}>
        <h2 className={cardTitleClassName}>Internal notes</h2>
      </div>
      <textarea
        className={cn(formControlClassName, 'mb-s resize-y p-s')}
        rows={5}
        value={notes}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Anything worth recording about this account — checks, phone calls, why they were denied."
      />
      <Button
        variant="secondary"
        type="button"
        disabled={saving || notes === saved}
        onClick={onSave}
      >
        {saving ? 'Saving…' : 'Save notes'}
      </Button>
    </section>
  );
}

/** Recent related messages, with a link into the composer. */
export function RelatedMessagesCard({
  messages,
  replyHref,
  emptyLabel,
}: {
  messages: AdminMessage[];
  replyHref: string;
  emptyLabel: string;
}) {
  return (
    <section className={cn(cardClassName, cardWideClassName)}>
      <div className={cardHeadingClassName}>
        <h2 className={cardTitleClassName}>Recent messages</h2>
        <Link className={cardLinkClassName} href={replyHref}>
          Compose email
        </Link>
      </div>
      {messages.length ? (
        <div className={adminRelatedMessagesClassName}>
          {messages.map((message) => (
            <Link key={message.id} href={`/dashboard/admin/messages/${message.id}`}>
              <span>
                {message.channel.toUpperCase()} · {message.status}
              </span>
              <strong>{message.subject || 'SMS notification'}</strong>
              <small>{formatDateTime(message.sent_at || message.created_at)}</small>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-label text-text-subtle">{emptyLabel}</p>
      )}
    </section>
  );
}

/** Back link, heading, kicker and the primary email action. */
export function AccountDetailHeader({
  backHref,
  backLabel,
  kicker,
  title,
  subtitle,
  actionHref,
  actionLabel,
}: {
  backHref: string;
  backLabel: string;
  kicker: string;
  title: string;
  subtitle: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <>
      <Link className={backClassName} href={backHref}>
        ← {backLabel}
      </Link>
      <PageHeader align="center" kicker={kicker} title={title} subtitle={subtitle}>
        <Button href={actionHref}>{actionLabel}</Button>
      </PageHeader>
    </>
  );
}

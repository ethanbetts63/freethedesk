'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { formatDateTime, type AdminMessage } from '@/lib/adminApi';
import type { AccountBase, DealerStatus } from '@/lib/api';

import { dealerStatuses, StatusPill, statusLabel } from './StatusPill';
import { AdminButton } from '@/components/dashboard/AdminButton';
import { formControlClassName } from '@/components/dashboard/formControl';
import {
  AdminDetailItem,
  adminCardClassName,
  adminCardHeadingClassName,
  adminCardLabelClassName,
  adminCardLinkClassName,
  adminCardTitleClassName,
  adminCardWideClassName,
  adminDetailListClassName,
  adminStatusCardClassName,
  adminStatusCardLabelGroupClassName,
  adminStatusCardSelectClassName,
} from '@/components/dashboard/AdminCard';
import { cn } from '@/lib/utils';
import { AdminPageHeader } from '@/components/dashboard/AdminPageHeader';
import { adminBackClassName, adminRelatedMessagesClassName } from './adminLayout';

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
    <section className={adminStatusCardClassName}>
      <div className={adminStatusCardLabelGroupClassName}>
        <p className={adminCardLabelClassName}>Account status</p>
        <StatusPill status={status} />
      </div>
      <select
        className={adminStatusCardSelectClassName}
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
    <section className={cn(adminCardClassName, adminCardWideClassName)}>
      <h2 className={adminCardTitleClassName}>{heading}</h2>
      <p className="text-ui text-text-subtle">{explanation}</p>
      <div className="flex flex-col flex-wrap items-start gap-l sm:flex-row sm:items-center">
        <AdminButton type="button" disabled={saving} onClick={onApprove}>
          Approve
        </AdminButton>
        <AdminButton variant="secondary" type="button" disabled={saving} onClick={onDeny}>
          Deny
        </AdminButton>
      </div>
    </section>
  );
}

export function DetailCard({ title, rows }: { title: string; rows: [string, ReactNode][] }) {
  return (
    <section className={adminCardClassName}>
      <h2 className={adminCardTitleClassName}>{title}</h2>
      <dl className={adminDetailListClassName}>
        {rows.map(([term, value]) => (
          <AdminDetailItem key={term} term={term}>
            {value}
          </AdminDetailItem>
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
          <a className={adminCardLinkClassName} key="email" href={`mailto:${account.email}`}>
            {account.email}
          </a>,
        ],
        [
          'Phone',
          account.phone ? (
            <a className={adminCardLinkClassName} key="phone" href={`tel:${account.phone}`}>
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
    <section className={cn(adminCardClassName, adminCardWideClassName)}>
      <div className={adminCardHeadingClassName}>
        <h2 className={adminCardTitleClassName}>Internal notes</h2>
      </div>
      <textarea
        className={cn(formControlClassName, 'mb-s resize-y p-s')}
        rows={5}
        value={notes}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Anything worth recording about this account — checks, phone calls, why they were denied."
      />
      <AdminButton
        variant="secondary"
        type="button"
        disabled={saving || notes === saved}
        onClick={onSave}
      >
        {saving ? 'Saving…' : 'Save notes'}
      </AdminButton>
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
    <section className={cn(adminCardClassName, adminCardWideClassName)}>
      <div className={adminCardHeadingClassName}>
        <h2 className={adminCardTitleClassName}>Recent messages</h2>
        <Link className={adminCardLinkClassName} href={replyHref}>
          Compose email
        </Link>
      </div>
      {messages.length ? (
        <div className={adminRelatedMessagesClassName}>
          {messages.map((message) => (
            <Link key={message.id} href={`/dashboard/messages/${message.id}`}>
              <span>
                {message.channel.toUpperCase()} · {message.status}
              </span>
              <strong>{message.subject || 'SMS notification'}</strong>
              <small>{formatDateTime(message.sent_at || message.created_at)}</small>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-ui text-text-subtle">{emptyLabel}</p>
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
      <Link className={adminBackClassName} href={backHref}>
        ← {backLabel}
      </Link>
      <AdminPageHeader align="center" kicker={kicker} title={title} subtitle={subtitle}>
        <AdminButton href={actionHref}>{actionLabel}</AdminButton>
      </AdminPageHeader>
    </>
  );
}

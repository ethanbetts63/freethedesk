"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { formatDateTime, type AdminMessage } from "@/lib/adminApi";
import type { AccountBase, DealerStatus } from "@/lib/api";

import { dealerStatuses, StatusPill, statusLabel } from "./StatusPill";

                                                                               
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
    <section className="admin-detail-card admin-status-card">
      <div>
        <p className="admin-card-label">Account status</p>
        <StatusPill status={status} />
      </div>
      <select
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
    <section className="admin-detail-card admin-detail-wide">
      <h2>{heading}</h2>
      <p className="admin-muted">{explanation}</p>
      <div className="button-row">
        <button type="button" className="admin-primary-button" disabled={saving} onClick={onApprove}>
          Approve
        </button>
        <button type="button" className="admin-secondary-button" disabled={saving} onClick={onDeny}>
          Deny
        </button>
      </div>
    </section>
  );
}

                                                                  
export function DetailCard({ title, rows }: { title: string; rows: [string, ReactNode][] }) {
  return (
    <section className="admin-detail-card">
      <h2>{title}</h2>
      <dl className="admin-detail-list">
        {rows.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

                                                                               
export function AccountContactCard({ account, extra = [] }: { account: AccountBase; extra?: [string, ReactNode][] }) {
  return (
    <DetailCard
      title="Contact"
      rows={[
        ["Business", account.business_name],
        ["Contact", account.contact_name],
        [
          "Email",
          <a key="email" href={`mailto:${account.email}`}>
            {account.email}
          </a>,
        ],
        [
          "Phone",
          account.phone ? (
            <a key="phone" href={`tel:${account.phone}`}>
              {account.phone}
            </a>
          ) : (
            "Not supplied"
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
        ["Plan", account.plan_label],
        ["Payment", account.payment_status_label],
        ["Current period ends", formatDateTime(account.subscription_current_period_end)],
        ["Cancels at period end", account.cancel_at_period_end ? "Yes" : "No"],
        ["Status", account.status_label],
        ["Status changed", formatDateTime(statusChangedAt)],
        ["Signed up", formatDateTime(account.created_at)],
        ["Last updated", formatDateTime(account.updated_at)],
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
    <section className="admin-detail-card admin-detail-wide">
      <div className="admin-card-heading">
        <h2>Internal notes</h2>
      </div>
      <textarea
        className="admin-notes"
        rows={5}
        value={notes}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Anything worth recording about this account — checks, phone calls, why they were denied."
      />
      <button type="button" className="admin-secondary-button" disabled={saving || notes === saved} onClick={onSave}>
        {saving ? "Saving…" : "Save notes"}
      </button>
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
    <section className="admin-detail-card admin-detail-wide">
      <div className="admin-card-heading">
        <h2>Recent messages</h2>
        <Link href={replyHref}>Compose email</Link>
      </div>
      {messages.length ? (
        <div className="admin-related-messages">
          {messages.map((message) => (
            <Link key={message.id} href={`/dashboard/messages/${message.id}`}>
              <span>
                {message.channel.toUpperCase()} · {message.status}
              </span>
              <strong>{message.subject || "SMS notification"}</strong>
              <small>{formatDateTime(message.sent_at || message.created_at)}</small>
            </Link>
          ))}
        </div>
      ) : (
        <p className="admin-muted">{emptyLabel}</p>
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
      <Link className="admin-back" href={backHref}>
        ← {backLabel}
      </Link>
      <header className="admin-page-header admin-detail-heading">
        <div>
          <p className="admin-kicker">{kicker}</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <Link className="admin-primary-button" href={actionHref}>
          {actionLabel}
        </Link>
      </header>
    </>
  );
}

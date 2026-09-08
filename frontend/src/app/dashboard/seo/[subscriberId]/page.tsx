"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import {
  AccountApprovalCard,
  AccountBillingCard,
  AccountContactCard,
  AccountDetailHeader,
  AccountStatusCard,
  RelatedMessagesCard,
  StaffNotesCard,
} from "@/components/dashboard/AccountDetail";
import { useAccountDetail } from "@/components/dashboard/useAccountDetail";
import { formatDateTime, getSeoSubscriber, updateSeoSubscriber, type SeoSubscriber } from "@/lib/adminApi";

export default function SeoSubscriberDetailPage() {
  const id = Number(useParams<{ subscriberId: string }>().subscriberId);
  const { account, messages, notes, setNotes, loading, saving, notice, error, replyHref, save } =
    useAccountDetail<SeoSubscriber>({
      id,
      fetch: getSeoSubscriber,
      update: updateSeoSubscriber,
      messageFilter: "related_seo_subscriber",
      replySubject: "Your Free the Desk SEO account",
      loadError: "SEO customer could not be loaded.",
      saveError: "The SEO customer could not be updated.",
    });

  if (loading)
    return (
      <div className="admin-page">
        <p className="admin-empty">Loading SEO customer…</p>
      </div>
    );
  if (error && !account)
    return (
      <div className="admin-page">
        <Link className="admin-back" href="/dashboard/seo">
          ← SEO customers
        </Link>
        <p className="admin-banner admin-banner-error">{error}</p>
      </div>
    );
  if (!account) return null;

  return (
    <div className="admin-page">
      <AccountDetailHeader
        backHref="/dashboard/seo"
        backLabel="Back to SEO customers"
        kicker={`SEO customer #${account.id}`}
        title={account.business_name}
        subtitle={`${account.contact_name} · signed up ${formatDateTime(account.created_at)}`}
        actionHref={replyHref}
        actionLabel="Email customer →"
      />

      {error && <p className="admin-banner admin-banner-error">{error}</p>}
      {notice && <p className="admin-banner">{notice}</p>}

      <div className="admin-detail-grid">
        <AccountStatusCard
          status={account.status}
          saving={saving}
          onChange={(status) => save({ status }, `Status set to ${status}.`)}
        />

        {account.status === "pending" && (
          <AccountApprovalCard
            heading="Approve this customer"
            explanation="Approving switches the account on so reporting can begin once they have connected their data."
            saving={saving}
            onApprove={() => save({ status: "active" }, "Customer approved.")}
            onDeny={() => save({ status: "denied" }, "Customer denied.")}
          />
        )}

        <AccountContactCard account={account} extra={[["Website", account.website || "Not supplied"]]} />
        <AccountBillingCard account={account} statusChangedAt={account.status_changed_at} />

        <StaffNotesCard
          notes={notes}
          saved={account.staff_notes}
          saving={saving}
          onChange={setNotes}
          onSave={() => save({ staff_notes: notes }, "Notes saved.")}
        />

        <RelatedMessagesCard messages={messages} replyHref={replyHref} emptyLabel="No messages yet." />
      </div>
    </div>
  );
}

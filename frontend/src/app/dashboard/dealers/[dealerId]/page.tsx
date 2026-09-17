'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import {
  AccountApprovalCard,
  AccountBillingCard,
  AccountContactCard,
  AccountDetailHeader,
  AccountStatusCard,
  RelatedMessagesCard,
  StaffNotesCard,
} from '@/components/dashboard/AccountDetail';
import { useAccountDetail } from '@/components/dashboard/useAccountDetail';
import { DEALER_TYPE, formatDateTime, getDealer, updateDealer, type Dealer } from '@/lib/adminApi';
import { AdminNotice } from '@/components/dashboard/AdminNotice';

export default function DealerDetailPage() {
  const id = Number(useParams<{ dealerId: string }>().dealerId);
  const { account, messages, notes, setNotes, loading, saving, notice, error, replyHref, save } =
    useAccountDetail<Dealer>({
      id,
      fetch: getDealer,
      update: updateDealer,
      relatedType: DEALER_TYPE,
      replySubject: 'Your freethedesk dealer account',
      loadError: 'Dealer could not be loaded.',
      saveError: 'The dealer could not be updated.',
    });

  if (loading)
    return (
      <div className="admin-page">
        <p className="text-text-subtle">Loading dealer…</p>
      </div>
    );
  if (error && !account)
    return (
      <div className="admin-page">
        <Link className="admin-back" href="/dashboard/dealers">
          ← Dealers
        </Link>
        <AdminNotice tone="danger">{error}</AdminNotice>
      </div>
    );
  if (!account) return null;

  return (
    <div className="admin-page">
      <AccountDetailHeader
        backHref="/dashboard/dealers"
        backLabel="Back to dealers"
        kicker={`Dealer #${account.id}`}
        title={account.business_name}
        subtitle={`${account.contact_name} · signed up ${formatDateTime(account.created_at)}`}
        actionHref={replyHref}
        actionLabel="Email dealer →"
      />

      {error && <AdminNotice tone="danger">{error}</AdminNotice>}
      {notice && <AdminNotice tone="success">{notice}</AdminNotice>}

      <div className="admin-detail-grid">
        <AccountStatusCard
          status={account.status}
          saving={saving}
          onChange={(status) => save({ status }, `Status set to ${status}.`)}
        />

        {account.status === 'pending' && (
          <AccountApprovalCard
            heading="Approve this dealer"
            explanation="Approving only switches the account on. The dealer still has to complete onboarding — licence details, prefill data and their sale conditions — before they can run a sale."
            saving={saving}
            onApprove={() => save({ status: 'active' }, 'Dealer approved.')}
            onDeny={() => save({ status: 'denied' }, 'Dealer denied.')}
          />
        )}

        <AccountContactCard account={account} extra={[['State', account.state_label]]} />
        <AccountBillingCard account={account} statusChangedAt={account.status_changed_at} />

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

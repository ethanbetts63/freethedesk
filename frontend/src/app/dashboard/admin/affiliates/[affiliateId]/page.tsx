'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import {
  AccountDetailHeader,
  AccountStatusCard,
  DetailCard,
  RelatedMessagesCard,
  StaffNotesCard,
} from '@/components/dashboard/AccountDetail';
import {
  AFFILIATE_TYPE,
  formatDateTime,
  getAffiliate,
  getMessages,
  updateAffiliate,
  type AdminMessage,
  type Affiliate,
} from '@/lib/adminApi';
import { Notice } from '@/components/ui/Notice';
import {
  cardClassName,
  cardLinkClassName,
  cardTitleClassName,
  cardWideClassName,
  detailGridClassName,
} from '@/components/ui/Card';
import { backClassName, pageClassName } from '@/components/ui/layout';
import { formatMoney } from '@/lib/formatting';
import { cn } from '@/lib/utils';

const money = (value: string) => formatMoney(value, { cents: 'auto' });

/**
 * One affiliate: status, code, every sale and the messages. Not `useAccountDetail`, whose
 * account shape is the dealer's and the SEO customer's (plan, billing period); an affiliate
 * has a code and commissions instead.
 */
export default function AffiliateDetailPage() {
  const id = Number(useParams<{ affiliateId: string }>().affiliateId);
  const [account, setAccount] = useState<Affiliate | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      getAffiliate(id),
      getMessages({ related_type: AFFILIATE_TYPE, related_id: id, page_size: 20 }),
    ])
      .then(([result, messagePage]) => {
        if (!active) return;
        setAccount(result);
        setNotes(result.staff_notes);
        setMessages(messagePage.results);
      })
      .catch((reason) => {
        if (active)
          setError(reason instanceof Error ? reason.message : 'Affiliate could not be loaded.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const replyHref = useMemo(() => {
    if (!account) return '/dashboard/admin/messages/compose';
    const firstName = account.contact_name.trim().split(/\s+/)[0] || account.contact_name;
    const params = new URLSearchParams({
      to: account.email,
      subject: 'Your freethedesk affiliate account',
      body: `Hi ${firstName},\n\n`,
    });
    return `/dashboard/admin/messages/compose?${params}`;
  }, [account]);

  async function save(
    changes: Partial<Pick<Affiliate, 'status' | 'staff_notes'>>,
    message: string,
  ) {
    if (!account) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      setAccount(await updateAffiliate(account.id, changes));
      setNotice(message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The affiliate could not be updated.');
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading affiliate…</p>
      </div>
    );
  if (error && !account)
    return (
      <div className={pageClassName}>
        <Link className={backClassName} href="/dashboard/admin/affiliates">
          ← Affiliates
        </Link>
        <Notice tone="danger">{error}</Notice>
      </div>
    );
  if (!account) return null;

  const commissions = account.commissions ?? [];

  return (
    <div className={pageClassName}>
      <AccountDetailHeader
        backHref="/dashboard/admin/affiliates"
        backLabel="Back to affiliates"
        kicker={`Affiliate #${account.id}`}
        title={account.business_name}
        subtitle={`${account.contact_name} · joined ${formatDateTime(account.created_at)}`}
        actionHref={replyHref}
        actionLabel="Email affiliate →"
      />

      {error && <Notice tone="danger">{error}</Notice>}
      {notice && <Notice tone="success">{notice}</Notice>}

      <div className={detailGridClassName}>
        {/* Suspending or denying switches the code off at checkout; reinstating turns it back on. */}
        <AccountStatusCard
          status={account.status}
          saving={saving}
          onChange={(status) => save({ status }, `Status set to ${status}.`)}
        />

        <DetailCard
          title="Code"
          rows={[
            ['Code', <code key="code">{account.code || 'Removed'}</code>],
            ['Audits sold', String(account.earnings.sales)],
            ['Owed', money(account.earnings.owed)],
            ['Paid out', money(account.earnings.paid)],
          ]}
        />

        <DetailCard
          title="Contact"
          rows={[
            ['Podcast', account.business_name],
            ['Host', account.contact_name],
            [
              'Email',
              <a className={cardLinkClassName} key="email" href={`mailto:${account.email}`}>
                {account.email}
              </a>,
            ],
            [
              'Website',
              account.website ? (
                <a
                  className={cardLinkClassName}
                  key="website"
                  href={account.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  {account.website}
                </a>
              ) : (
                'Not supplied'
              ),
            ],
          ]}
        />

        <DetailCard
          title="Account"
          rows={[
            ['Status', account.status_label],
            ['Status changed', formatDateTime(account.status_changed_at)],
            ['Joined', formatDateTime(account.created_at)],
            ['Last updated', formatDateTime(account.updated_at)],
            [
              'Free audit',
              account.seo_subscriber_id ? (
                <Link
                  className={cardLinkClassName}
                  key="audit"
                  href={`/dashboard/admin/seo/${account.seo_subscriber_id}`}
                >
                  On the SEO list →
                </Link>
              ) : (
                'None'
              ),
            ],
          ]}
        />

        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>Sales</h2>
          {commissions.length ? (
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="text-left text-label text-text-subtle">
                  <th className="py-xs font-heavy">Paid</th>
                  <th className="py-xs font-heavy">Audit</th>
                  <th className="py-xs font-heavy">Sale</th>
                  <th className="py-xs font-heavy">Owed</th>
                  <th className="py-xs font-heavy">Status</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => (
                  <tr key={commission.id} className="border-t border-border-default">
                    <td className="py-xs">{formatDateTime(commission.created_at)}</td>
                    <td className="py-xs">{commission.description}</td>
                    <td className="py-xs">{money(commission.sale_amount)}</td>
                    <td className="py-xs">{money(commission.amount)}</td>
                    <td className="py-xs">
                      {commission.status_label}
                      {commission.note && (
                        <span className="block text-label text-text-subtle">{commission.note}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="m-0 text-label text-text-subtle">No audits bought with this code yet.</p>
          )}
          <p className="mt-m mb-0 text-label text-text-subtle">
            Paying out is not built yet: settle what is owed by hand and note it here.
          </p>
        </section>

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

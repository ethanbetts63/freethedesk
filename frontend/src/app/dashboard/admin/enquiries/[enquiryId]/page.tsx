'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { enquiryStatuses, StatusPill } from '@/components/dashboard/StatusPill';
import { safeWebsiteHref } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  ENQUIRY_TYPE,
  formatDateTime,
  getEnquiry,
  getMessages,
  updateEnquiryStatus,
  type AdminMessage,
  type Enquiry,
} from '@/lib/adminApi';
import { Notice } from '@/components/ui/Notice';
import {
  DetailItem,
  cardClassName,
  cardHeadingClassName,
  cardLabelClassName,
  cardLinkClassName,
  cardTitleClassName,
  cardWideClassName,
  detailGridClassName,
  detailListClassName,
  messageBodyClassName,
  statusCardClassName,
  statusCardLabelGroupClassName,
  statusCardSelectClassName,
} from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { backClassName, pageClassName } from '@/components/ui/layout';
import { adminRelatedMessagesClassName } from '@/components/dashboard/adminLayout';
import { newInvoiceHref } from '@/app/dashboard/admin/invoices/_lib/invoiceStatus';

export default function EnquiryDetailPage() {
  const id = Number(useParams<{ enquiryId: string }>().enquiryId);
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getEnquiry(id),
      getMessages({ related_type: ENQUIRY_TYPE, related_id: id, page_size: 20 }),
    ])
      .then(([result, messagePage]) => {
        setEnquiry(result);
        setMessages(messagePage.results);
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Enquiry could not be loaded.'),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const replyHref = useMemo(() => {
    if (!enquiry) return '/dashboard/admin/messages/compose';
    const firstName = enquiry.name.trim().split(/\s+/)[0] || enquiry.name;
    const params = new URLSearchParams({
      to: enquiry.email,
      subject: `Re: Your freethedesk enquiry`,
      body: `Hi ${firstName},\n\nThanks for getting in touch with freethedesk.\n\n`,
      enquiry: String(enquiry.id),
    });
    return `/dashboard/admin/messages/compose?${params}`;
  }, [enquiry]);

  async function changeStatus(status: string) {
    if (!enquiry) return;
    setSaving(true);
    setError('');
    try {
      setEnquiry(await updateEnquiryStatus(enquiry.id, status));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Status could not be updated.');
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className={pageClassName}>
        <p className="text-text-subtle">Loading enquiry…</p>
      </div>
    );
  if (error && !enquiry)
    return (
      <div className={pageClassName}>
        <Link className={backClassName} href="/dashboard/admin/enquiries">
          ← Enquiries
        </Link>
        <Notice tone="danger">{error}</Notice>
      </div>
    );
  if (!enquiry) return null;

  const configuration = enquiry.configuration ?? {};
  const websiteHref = safeWebsiteHref(enquiry.website);

  return (
    <div className={pageClassName}>
      <Link className={backClassName} href="/dashboard/admin/enquiries">
        ← Back to enquiries
      </Link>
      <PageHeader
        align="center"
        kicker={`Enquiry #${enquiry.id}`}
        title={enquiry.business}
        subtitle={`${enquiry.name} · received ${formatDateTime(enquiry.created_at)}`}
      >
        <div className="flex flex-wrap gap-xs">
          <Button variant="secondary" href={newInvoiceHref(ENQUIRY_TYPE, enquiry.id)}>
            Create invoice
          </Button>
          <Button href={replyHref}>Reply by email →</Button>
        </div>
      </PageHeader>
      {error && <Notice tone="danger">{error}</Notice>}
      <div className={detailGridClassName}>
        <section className={statusCardClassName}>
          <div className={statusCardLabelGroupClassName}>
            <p className={cardLabelClassName}>Workflow status</p>
            <StatusPill status={enquiry.status} />
          </div>
          <select
            className={statusCardSelectClassName}
            value={enquiry.status}
            disabled={saving}
            onChange={(event) => changeStatus(event.target.value)}
          >
            {enquiryStatuses.map((status) => (
              <option key={status} value={status}>
                {status[0].toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </section>
        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Contact</h2>
          <dl className={detailListClassName}>
            <DetailItem term="Name">{enquiry.name}</DetailItem>
            <DetailItem term="Business">{enquiry.business}</DetailItem>
            <DetailItem term="Email">
              <a className={cardLinkClassName} href={`mailto:${enquiry.email}`}>
                {enquiry.email}
              </a>
            </DetailItem>
            <DetailItem term="Phone">
              {enquiry.phone ? (
                <a className={cardLinkClassName} href={`tel:${enquiry.phone}`}>
                  {enquiry.phone}
                </a>
              ) : (
                'Not supplied'
              )}
            </DetailItem>
            <DetailItem term="Website">
              {websiteHref ? (
                <a
                  className={cardLinkClassName}
                  href={websiteHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  {enquiry.website} ↗
                </a>
              ) : (
                enquiry.website || 'Not supplied'
              )}
            </DetailItem>
            <DetailItem term="Interested in">{enquiry.help_with_label}</DetailItem>
            {configuration.budget && (
              <DetailItem term="Stated budget">{configuration.budget}</DetailItem>
            )}
          </dl>
        </section>
        <section className={cn(cardClassName, cardWideClassName)}>
          <h2 className={cardTitleClassName}>What they said</h2>
          <p className={messageBodyClassName}>{enquiry.message}</p>
        </section>
        <section className={cn(cardClassName, cardWideClassName)}>
          <div className={cardHeadingClassName}>
            <h2 className={cardTitleClassName}>Related messages</h2>
            <Link className={cardLinkClassName} href={replyHref}>
              Compose reply
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
            <p className="text-label text-text-subtle">
              No messages are linked to this enquiry yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

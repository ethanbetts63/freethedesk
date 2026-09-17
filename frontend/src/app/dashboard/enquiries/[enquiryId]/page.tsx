'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { enquiryStatuses, StatusPill } from '@/components/dashboard/StatusPill';
import { safeWebsiteHref } from '@/lib/api';
import { AdminButton } from '@/components/dashboard/AdminButton';
import {
  ENQUIRY_TYPE,
  formatDateTime,
  getEnquiry,
  getMessages,
  updateEnquiryStatus,
  type AdminMessage,
  type Enquiry,
} from '@/lib/adminApi';
import { AdminNotice } from '@/components/dashboard/AdminNotice';
import {
  AdminDetailItem,
  adminCardClassName,
  adminCardHeadingClassName,
  adminCardLabelClassName,
  adminCardLinkClassName,
  adminCardTitleClassName,
  adminCardWideClassName,
  adminDetailGridClassName,
  adminDetailListClassName,
  adminMessageBodyClassName,
  adminStatusCardClassName,
  adminStatusCardLabelGroupClassName,
  adminStatusCardSelectClassName,
} from '@/components/dashboard/AdminCard';
import { cn } from '@/lib/utils';
import { AdminPageHeader } from '@/components/dashboard/AdminPageHeader';
import {
  adminBackClassName,
  adminConfigBasicsClassName,
  adminConfigGroupClassName,
  adminConfigLabelClassName,
  adminConfigRequestClassName,
  adminPageClassName,
  adminRelatedMessagesClassName,
} from '@/components/dashboard/adminLayout';

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
    if (!enquiry) return '/dashboard/messages/compose';
    const firstName = enquiry.name.trim().split(/\s+/)[0] || enquiry.name;
    const params = new URLSearchParams({
      to: enquiry.email,
      subject: `Re: Your freethedesk enquiry`,
      body: `Hi ${firstName},\n\nThanks for getting in touch with freethedesk.\n\n`,
      enquiry: String(enquiry.id),
    });
    return `/dashboard/messages/compose?${params}`;
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
      <div className={adminPageClassName}>
        <p className="text-text-subtle">Loading enquiry…</p>
      </div>
    );
  if (error && !enquiry)
    return (
      <div className={adminPageClassName}>
        <Link className={adminBackClassName} href="/dashboard/enquiries">
          ← Enquiries
        </Link>
        <AdminNotice tone="danger">{error}</AdminNotice>
      </div>
    );
  if (!enquiry) return null;

  const configuration = enquiry.configuration ?? {};
  const websiteHref = safeWebsiteHref(enquiry.website);
  const chosenCapabilities = configuration.capabilities?.filter((item) => item.selected) ?? [];
  const chosenInventoryOptions =
    configuration.inventory_options?.filter((item) => item.selected) ?? [];

  return (
    <div className={adminPageClassName}>
      <Link className={adminBackClassName} href="/dashboard/enquiries">
        ← Back to enquiries
      </Link>
      <AdminPageHeader
        align="center"
        kicker={`Enquiry #${enquiry.id}`}
        title={enquiry.business}
        subtitle={`${enquiry.name} · received ${formatDateTime(enquiry.created_at)}`}
      >
        <AdminButton href={replyHref}>Reply by email →</AdminButton>
      </AdminPageHeader>
      {error && <AdminNotice tone="danger">{error}</AdminNotice>}
      <div className={adminDetailGridClassName}>
        <section className={adminStatusCardClassName}>
          <div className={adminStatusCardLabelGroupClassName}>
            <p className={adminCardLabelClassName}>Workflow status</p>
            <StatusPill status={enquiry.status} />
          </div>
          <select
            className={adminStatusCardSelectClassName}
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
        <section className={adminCardClassName}>
          <h2 className={adminCardTitleClassName}>Contact</h2>
          <dl className={adminDetailListClassName}>
            <AdminDetailItem term="Name">{enquiry.name}</AdminDetailItem>
            <AdminDetailItem term="Business">{enquiry.business}</AdminDetailItem>
            <AdminDetailItem term="Email">
              <a className={adminCardLinkClassName} href={`mailto:${enquiry.email}`}>
                {enquiry.email}
              </a>
            </AdminDetailItem>
            <AdminDetailItem term="Phone">
              {enquiry.phone ? (
                <a className={adminCardLinkClassName} href={`tel:${enquiry.phone}`}>
                  {enquiry.phone}
                </a>
              ) : (
                'Not supplied'
              )}
            </AdminDetailItem>
            <AdminDetailItem term="Website">
              {websiteHref ? (
                <a
                  className={adminCardLinkClassName}
                  href={websiteHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  {enquiry.website} ↗
                </a>
              ) : (
                enquiry.website || 'Not supplied'
              )}
            </AdminDetailItem>
            <AdminDetailItem term="Interested in">{enquiry.help_with_label}</AdminDetailItem>
            {configuration.budget && (
              <AdminDetailItem term="Stated budget">{configuration.budget}</AdminDetailItem>
            )}
          </dl>
        </section>
        {enquiry.help_with === 'website_builder' && (
          <section className={cn(adminCardClassName, adminCardWideClassName)}>
            <div className={adminCardHeadingClassName}>
              <h2 className={adminCardTitleClassName}>Website configuration</h2>
              <span className={adminConfigLabelClassName}>Interactive builder</span>
            </div>
            <dl className={cn(adminDetailListClassName, adminConfigBasicsClassName)}>
              <AdminDetailItem term="Brand name">
                {configuration.appearance?.brand_name || enquiry.business}
              </AdminDetailItem>
              <AdminDetailItem term="Current URL">
                {configuration.appearance?.current_url || 'Not supplied'}
              </AdminDetailItem>
              <AdminDetailItem term="Build version">{configuration.version ?? '—'}</AdminDetailItem>
            </dl>
            <div className={adminConfigGroupClassName}>
              <strong>Selected capabilities</strong>
              <div>
                {chosenCapabilities.length ? (
                  chosenCapabilities.map((item) => <span key={item.key}>{item.name}</span>)
                ) : (
                  <em>Base website only</em>
                )}
              </div>
            </div>
            {chosenInventoryOptions.length > 0 && (
              <div className={adminConfigGroupClassName}>
                <strong>Inventory options</strong>
                <div>
                  {chosenInventoryOptions.map((item) => (
                    <span key={item.key}>{item.name}</span>
                  ))}
                </div>
              </div>
            )}
            {configuration.custom_capability && (
              <div className={adminConfigRequestClassName}>
                <strong>Custom capability</strong>
                <p>{configuration.custom_capability}</p>
              </div>
            )}
          </section>
        )}
        <section className={cn(adminCardClassName, adminCardWideClassName)}>
          <h2 className={adminCardTitleClassName}>What they said</h2>
          <p className={adminMessageBodyClassName}>{enquiry.message}</p>
        </section>
        <section className={cn(adminCardClassName, adminCardWideClassName)}>
          <div className={adminCardHeadingClassName}>
            <h2 className={adminCardTitleClassName}>Related messages</h2>
            <Link className={adminCardLinkClassName} href={replyHref}>
              Compose reply
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
            <p className="text-ui text-text-subtle">No messages are linked to this enquiry yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
